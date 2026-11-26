import bcrypt from 'bcryptjs';
import fs from 'fs';
import csv from 'csv-parser';
import { z } from 'zod';
import prisma from '../prisma/prismaClient.js';
import { generateUniqueSlug } from '../utils/slugGenerator.js';
import { logAdminAction } from '../utils/auditLogger.js';

// --- STUDENT MANAGEMENT ---

// GET /api/admin/students
export async function getStudents(req, res, next) {
  try {
    const {
      q,
      departmentId,
      batchId,
      status,
      page = 1,
      limit = 15
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (departmentId) where.departmentId = departmentId;
    if (batchId) where.batchId = batchId;
    if (status) where.status = status;

    if (q && q.trim()) {
      const keyword = q.trim();
      where.OR = [
        { fullName: { contains: keyword, mode: 'insensitive' } },
        { rollNumber: { contains: keyword, mode: 'insensitive' } },
        { user: { email: { contains: keyword, mode: 'insensitive' } } }
      ];
    }

    const [total, students] = await Promise.all([
      prisma.studentProfile.count({ where }),
      prisma.studentProfile.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          user: { select: { email: true, createdAt: true, isInitialPassword: true } },
          department: { select: { id: true, name: true, code: true } },
          batch: { select: { id: true, name: true, graduationYear: true } },
          _count: {
            select: {
              projects: true,
              certifications: true,
              achievements: true
            }
          }
        }
      })
    ]);

    return res.json({
      success: true,
      students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/students (Single student creation)
const createStudentSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Valid college email required.'),
  rollNumber: z.string().min(2, 'Roll number is required.'),
  departmentId: z.string().uuid('Valid department required.'),
  batchId: z.string().uuid('Valid batch required.'),
  initialPassword: z.string().min(6, 'Initial password must be at least 6 characters.').default('College@123')
});

export async function addStudent(req, res, next) {
  try {
    const data = createStudentSchema.parse(req.body);
    const cleanEmail = data.email.toLowerCase().trim();

    // Check existing email
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    // Check existing roll number
    const existingRoll = await prisma.studentProfile.findUnique({
      where: { rollNumber: data.rollNumber.trim() }
    });
    if (existingRoll) {
      return res.status(409).json({ success: false, message: 'A student with this roll number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.initialPassword, salt);
    const slug = await generateUniqueSlug(prisma, data.fullName);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: 'STUDENT',
          isInitialPassword: true
        }
      });

      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          fullName: data.fullName.trim(),
          slug,
          rollNumber: data.rollNumber.trim(),
          departmentId: data.departmentId,
          batchId: data.batchId,
          status: 'ACTIVE',
          isApproved: true,
          isPublished: true,
          visibilitySettings: {
            showEducation: true,
            showSkills: true,
            showProjects: true,
            showCertifications: true,
            showExperience: true,
            showAchievements: true,
            showExtracurriculars: true,
            showLinks: true
          }
        },
        include: {
          department: true,
          batch: true,
          user: { select: { email: true } }
        }
      });

      return profile;
    });

    await logAdminAction(prisma, {
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'ADD_STUDENT',
      targetType: 'StudentProfile',
      targetId: result.id,
      details: { rollNumber: result.rollNumber, email: result.user.email, name: result.fullName }
    });

    return res.status(201).json({
      success: true,
      message: 'Student account created successfully.',
      student: result
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/students/import (CSV Batch Import)
export async function importStudentsFromCSV(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file.' });
    }

    const filePath = req.file.path;
    const results = [];
    const errors = [];
    let successCount = 0;

    const departments = await prisma.department.findMany();
    const batches = await prisma.batch.findMany();

    const deptMap = new Map();
    departments.forEach(d => {
      deptMap.set(d.code.toUpperCase(), d.id);
      deptMap.set(d.name.toLowerCase(), d.id);
    });

    const batchMap = new Map();
    batches.forEach(b => {
      batchMap.set(`${b.name.toLowerCase()}_${b.departmentId}`, b.id);
      batchMap.set(b.name.toLowerCase(), b.id);
    });

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          for (let index = 0; index < results.length; index++) {
            const row = results[index];
            const rowNum = index + 2; // header is row 1

            const fullName = (row.name || row.fullName || '').trim();
            const email = (row.email || '').toLowerCase().trim();
            const rollNumber = (row.rollNumber || row.roll_number || '').trim();
            const deptCode = (row.departmentCode || row.department || '').trim().toUpperCase();
            const batchName = (row.batchName || row.batch || '').trim();
            const password = (row.password || 'College@123').trim();

            if (!fullName || !email || !rollNumber) {
              errors.push({ row: rowNum, error: 'Missing mandatory fields: name, email, or rollNumber' });
              continue;
            }

            const deptId = deptMap.get(deptCode) || deptMap.get(deptCode.toLowerCase());
            if (!deptId) {
              errors.push({ row: rowNum, error: `Department '${deptCode}' not found.` });
              continue;
            }

            const batchId = batchMap.get(`${batchName.toLowerCase()}_${deptId}`) || batchMap.get(batchName.toLowerCase());
            if (!batchId) {
              errors.push({ row: rowNum, error: `Batch '${batchName}' not found.` });
              continue;
            }

            // Check duplicate email or rollNumber
            const duplicateCheck = await prisma.user.findFirst({
              where: {
                OR: [
                  { email },
                  { studentProfile: { rollNumber } }
                ]
              }
            });

            if (duplicateCheck) {
              errors.push({ row: rowNum, error: `Duplicate email (${email}) or roll number (${rollNumber}).` });
              continue;
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            const slug = await generateUniqueSlug(prisma, fullName);

            await prisma.$transaction(async (tx) => {
              const user = await tx.user.create({
                data: {
                  email,
                  passwordHash,
                  role: 'STUDENT',
                  isInitialPassword: true
                }
              });

              await tx.studentProfile.create({
                data: {
                  userId: user.id,
                  fullName,
                  slug,
                  rollNumber,
                  departmentId: deptId,
                  batchId,
                  status: 'ACTIVE',
                  isApproved: true,
                  isPublished: true,
                  visibilitySettings: {
                    showEducation: true,
                    showSkills: true,
                    showProjects: true,
                    showCertifications: true,
                    showExperience: true,
                    showAchievements: true,
                    showExtracurriculars: true,
                    showLinks: true
                  }
                }
              });
            });

            successCount++;
          }

          // Clean up temp CSV file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          await logAdminAction(prisma, {
            adminId: req.user.id,
            adminEmail: req.user.email,
            action: 'IMPORT_STUDENTS_CSV',
            targetType: 'StudentBatch',
            targetId: 'CSV_IMPORT',
            details: { totalRows: results.length, successCount, failedCount: errors.length }
          });

          return res.json({
            success: true,
            message: `CSV import completed. Successfully imported ${successCount} students.`,
            successCount,
            errors
          });
        } catch (innerError) {
          next(innerError);
        }
      })
      .on('error', (err) => next(err));
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/students/:id/status
const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'GRADUATED', 'ALUMNI', 'SUSPENDED', 'ARCHIVED']),
  isApproved: z.boolean().optional()
});

export async function updateStudentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, isApproved } = updateStatusSchema.parse(req.body);

    const existing = await prisma.studentProfile.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const updated = await prisma.studentProfile.update({
      where: { id },
      data: {
        status,
        ...(isApproved !== undefined ? { isApproved } : {})
      }
    });

    await logAdminAction(prisma, {
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'UPDATE_STUDENT_STATUS',
      targetType: 'StudentProfile',
      targetId: id,
      details: { previousStatus: existing.status, newStatus: status, isApproved: updated.isApproved }
    });

    return res.json({
      success: true,
      message: `Student status updated to ${status}.`,
      student: updated
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/batches/:id/archive-or-graduate (FR-2.5: a whole batch can be archived or graduated at once)
export async function batchStatusUpdate(req, res, next) {
  try {
    const { id } = req.params;
    const { targetStatus } = req.body; // 'GRADUATED', 'ALUMNI', or 'ARCHIVED'

    if (!['GRADUATED', 'ALUMNI', 'ARCHIVED'].includes(targetStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid target status. Must be GRADUATED, ALUMNI, or ARCHIVED.' });
    }

    const batch = await prisma.batch.findUnique({ where: { id } });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found.' });

    const updatedStudents = await prisma.studentProfile.updateMany({
      where: { batchId: id },
      data: { status: targetStatus }
    });

    if (targetStatus === 'ARCHIVED') {
      await prisma.batch.update({
        where: { id },
        data: { isArchived: true }
      });
    }

    await logAdminAction(prisma, {
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'BATCH_STATUS_UPDATE',
      targetType: 'Batch',
      targetId: id,
      details: { batchName: batch.name, targetStatus, affectedStudentsCount: updatedStudents.count }
    });

    return res.json({
      success: true,
      message: `Batch '${batch.name}' updated to ${targetStatus}. ${updatedStudents.count} student profiles updated.`,
      count: updatedStudents.count
    });
  } catch (error) {
    next(error);
  }
}

// --- MODERATION QUEUE ---

// GET /api/admin/moderation
export async function getModerationQueue(req, res, next) {
  try {
    const [pendingCertifications, pendingAchievements] = await Promise.all([
      prisma.certification.findMany({
        where: { verificationStatus: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: { id: true, fullName: true, rollNumber: true, slug: true, department: true }
          }
        }
      }),
      prisma.achievement.findMany({
        where: { verificationStatus: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: { id: true, fullName: true, rollNumber: true, slug: true, department: true }
          }
        }
      })
    ]);

    return res.json({
      success: true,
      pendingCertifications,
      pendingAchievements,
      totalPending: pendingCertifications.length + pendingAchievements.length
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/moderation/certification/:id
export async function moderateCertification(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // 'VERIFIED', 'REJECTED'

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be VERIFIED or REJECTED.' });
    }

    const updated = await prisma.certification.update({
      where: { id },
      data: {
        verificationStatus: status,
        verificationNotes: notes || null,
        verifiedAt: new Date(),
        verifiedBy: req.user.email
      },
      include: { student: true }
    });

    await logAdminAction(prisma, {
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: `CERTIFICATION_${status}`,
      targetType: 'Certification',
      targetId: id,
      details: { certName: updated.name, studentId: updated.studentId, studentName: updated.student.fullName, notes }
    });

    return res.json({
      success: true,
      message: `Certification marked as ${status}.`,
      certification: updated
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/moderation/achievement/:id
export async function moderateAchievement(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'VERIFIED', 'REJECTED'

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be VERIFIED or REJECTED.' });
    }

    const updated = await prisma.achievement.update({
      where: { id },
      data: {
        verificationStatus: status,
        verifiedAt: new Date(),
        verifiedBy: req.user.email
      },
      include: { student: true }
    });

    await logAdminAction(prisma, {
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: `ACHIEVEMENT_${status}`,
      targetType: 'Achievement',
      targetId: id,
      details: { title: updated.title, studentId: updated.studentId, studentName: updated.student.fullName }
    });

    return res.json({
      success: true,
      message: `Achievement marked as ${status}.`,
      achievement: updated
    });
  } catch (error) {
    next(error);
  }
}

// --- FEATURED PROJECTS ---

// GET /api/admin/projects
export async function getAdminProjects(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: {
        student: {
          select: { id: true, fullName: true, rollNumber: true, department: true }
        },
        technologies: {
          include: { skill: true }
        }
      }
    });

    return res.json({ success: true, projects });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/projects/:id/feature
export async function toggleProjectFeatured(req, res, next) {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { student: true }
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const updated = await prisma.project.update({
      where: { id },
      data: { isFeatured: Boolean(isFeatured) }
    });

    await logAdminAction(prisma, {
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: updated.isFeatured ? 'FEATURE_PROJECT' : 'UNFEATURE_PROJECT',
      targetType: 'Project',
      targetId: id,
      details: { title: project.title, studentName: project.student.fullName }
    });

    return res.json({
      success: true,
      message: updated.isFeatured ? 'Project marked as featured on home page.' : 'Project unfeatured.',
      project: updated
    });
  } catch (error) {
    next(error);
  }
}

// --- DEPARTMENTS & BATCHES ---

// GET /api/admin/departments
export async function getAdminDepartments(req, res, next) {
  try {
    const departments = await prisma.department.findMany({
      include: {
        batches: {
          orderBy: { graduationYear: 'desc' },
          include: {
            _count: { select: { students: true } }
          }
        },
        _count: { select: { students: true } }
      },
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, departments });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/departments
export async function addDepartment(req, res, next) {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required.' });
    }

    const dept = await prisma.department.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description ? description.trim() : null
      }
    });

    await logAdminAction(prisma, {
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'ADD_DEPARTMENT',
      targetType: 'Department',
      targetId: dept.id,
      details: { name: dept.name, code: dept.code }
    });

    return res.status(201).json({ success: true, message: 'Department created.', department: dept });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/batches
export async function addBatch(req, res, next) {
  try {
    const { name, graduationYear, departmentId } = req.body;
    if (!name || !graduationYear || !departmentId) {
      return res.status(400).json({ success: false, message: 'Name, graduationYear, and departmentId are required.' });
    }

    const batch = await prisma.batch.create({
      data: {
        name: name.trim(),
        graduationYear: parseInt(graduationYear, 10),
        departmentId
      },
      include: { department: true }
    });

    await logAdminAction(prisma, {
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'ADD_BATCH',
      targetType: 'Batch',
      targetId: batch.id,
      details: { name: batch.name, dept: batch.department.name }
    });

    return res.status(201).json({ success: true, message: 'Batch created.', batch });
  } catch (error) {
    next(error);
  }
}

// --- REPORTS & ANALYTICS ---

// GET /api/admin/reports
export async function getAdminReports(req, res, next) {
  try {
    const [
      totalUsers,
      totalStudents,
      activeStudents,
      graduatedStudents,
      alumniStudents,
      suspendedStudents,
      pendingVerificationCerts,
      pendingVerificationAchs,
      totalProjects,
      featuredProjects,
      departmentStats,
      batchStats,
      topViewedStudents,
      popularSkills,
      totalStaff,
      totalDocumentSubmissions,
      pendingSubmissions,
      verifiedSubmissions,
      rejectedSubmissions,
      resubmissionRequired
    ] = await Promise.all([
      prisma.user.count(),
      prisma.studentProfile.count(),
      prisma.studentProfile.count({ where: { status: 'ACTIVE' } }),
      prisma.studentProfile.count({ where: { status: 'GRADUATED' } }),
      prisma.studentProfile.count({ where: { status: 'ALUMNI' } }),
      prisma.studentProfile.count({ where: { status: 'SUSPENDED' } }),
      prisma.certification.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.achievement.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.project.count(),
      prisma.project.count({ where: { isFeatured: true } }),
      prisma.department.findMany({
        where: { isArchived: false },
        select: {
          id: true,
          name: true,
          code: true,
          _count: { select: { students: true } }
        }
      }),
      prisma.batch.findMany({
        where: { isArchived: false },
        select: {
          id: true,
          name: true,
          department: { select: { code: true } },
          _count: { select: { students: true } }
        },
        take: 10
      }),
      prisma.studentProfile.findMany({
        orderBy: { profileViews: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          slug: true,
          profileViews: true,
          department: { select: { code: true } },
          batch: { select: { name: true } }
        }
      }),
      prisma.skill.findMany({
        orderBy: {
          studentSkills: { _count: 'desc' }
        },
        take: 10,
        select: {
          id: true,
          name: true,
          category: true,
          _count: { select: { studentSkills: true, projectTechnologies: true } }
        }
      }),
      prisma.staffProfile.count(),
      prisma.documentSubmission.count(),
      prisma.documentSubmission.count({ where: { status: 'PENDING' } }),
      prisma.documentSubmission.count({ where: { status: 'VERIFIED' } }),
      prisma.documentSubmission.count({ where: { status: 'REJECTED' } }),
      prisma.documentSubmission.count({ where: { status: 'RESUBMISSION_REQUIRED' } })
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalStaff,
        activeStudents,
        graduatedStudents,
        alumniStudents,
        suspendedStudents,
        pendingVerificationCerts,
        pendingVerificationAchs,
        totalProjects,
        featuredProjects,
        totalDocumentSubmissions,
        pendingSubmissions,
        verifiedSubmissions,
        rejectedSubmissions,
        resubmissionRequired
      },
      departmentStats,
      batchStats,
      topViewedStudents,
      popularSkills
    });
  } catch (error) {
    next(error);
  }
}

// --- AUDIT LOGS ---

// GET /api/admin/audit-log
export async function getAuditLogs(req, res, next) {
  try {
    const { action, page = 1, limit = 30 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (action) where.action = action;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/students/export (CSV Export)
export async function exportStudentsCSV(req, res, next) {
  try {
    const students = await prisma.studentProfile.findMany({
      orderBy: [{ rollNumber: 'asc' }],
      include: {
        user: { select: { email: true } },
        department: { select: { code: true, name: true } },
        batch: { select: { name: true, graduationYear: true } }
      }
    });

    const csvHeaders = ['Roll Number', 'Full Name', 'Email', 'Department', 'Batch', 'Status', 'Slug', 'Created At'];
    const rows = students.map(s => [
      `"${s.rollNumber}"`,
      `"${s.fullName}"`,
      `"${s.user.email}"`,
      `"${s.department.code}"`,
      `"${s.batch.name}"`,
      `"${s.status}"`,
      `"${s.slug}"`,
      `"${s.createdAt.toISOString()}"`
    ]);

    const csvContent = [csvHeaders.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="students_roster_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

// --- STAFF MANAGEMENT ---

// GET /api/admin/staff
export async function getStaffList(req, res, next) {
  try {
    const staff = await prisma.staffProfile.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        user: { select: { id: true, email: true, createdAt: true, isInitialPassword: true } },
        department: { select: { id: true, code: true, name: true } },
        batch: { select: { id: true, name: true, graduationYear: true } },
        assignedStudents: {
          include: {
            student: {
              select: { id: true, fullName: true, rollNumber: true, slug: true, department: true, batch: true }
            }
          }
        },
        _count: {
          select: {
            verificationRecords: true,
            assignedStudents: true
          }
        }
      }
    });

    return res.json({ success: true, staff });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/staff
const createStaffSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Valid email is required.'),
  staffId: z.string().min(2, 'Staff ID is required.'),
  designation: z.string().optional().default('Class In-charge / Tutor'),
  phone: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  batchId: z.string().optional().nullable(),
  initialPassword: z.string().min(6, 'Initial password must be at least 6 characters.').optional()
});

export async function addStaff(req, res, next) {
  try {
    const data = createStaffSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();
    const staffId = data.staffId.trim().toUpperCase();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { staffProfile: { staffId } }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address or Staff ID already exists.'
      });
    }

    const rawPassword = data.initialPassword || 'Staff@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'STAFF',
          isInitialPassword: true
        }
      });

      const staff = await tx.staffProfile.create({
        data: {
          userId: user.id,
          staffId,
          fullName: data.fullName.trim(),
          designation: data.designation || 'Class In-charge / Tutor',
          phone: data.phone ? data.phone.trim() : null,
          departmentId: data.departmentId || null,
          batchId: data.batchId || null
        },
        include: {
          department: true,
          batch: true
        }
      });

      return { user, staff };
    });

    await logAdminAction(prisma, {
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'CREATE_STAFF_ACCOUNT',
      targetType: 'StaffProfile',
      targetId: result.staff.id,
      details: { staffId, email, fullName: data.fullName, designation: data.designation }
    });

    return res.status(201).json({
      success: true,
      message: `Staff account created successfully for ${data.fullName}.`,
      staff: result.staff,
      initialPasswordProvided: rawPassword
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/staff/:id
export async function updateStaff(req, res, next) {
  try {
    const { id } = req.params;
    const { fullName, designation, phone, departmentId, batchId } = req.body;

    const existing = await prisma.staffProfile.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    const updated = await prisma.staffProfile.update({
      where: { id },
      data: {
        ...(fullName ? { fullName: fullName.trim() } : {}),
        ...(designation ? { designation: designation.trim() } : {}),
        ...(phone !== undefined ? { phone: phone ? phone.trim() : null } : {}),
        ...(departmentId !== undefined ? { departmentId: departmentId || null } : {}),
        ...(batchId !== undefined ? { batchId: batchId || null } : {})
      },
      include: {
        department: true,
        batch: true
      }
    });

    await logAdminAction(prisma, {
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'UPDATE_STAFF_PROFILE',
      targetType: 'StaffProfile',
      targetId: id,
      details: { staffId: existing.staffId, fullName: updated.fullName, designation: updated.designation }
    });

    return res.json({ success: true, message: 'Staff profile updated successfully.', staff: updated });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/staff/:id/assign
export async function assignStudentsToStaff(req, res, next) {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'studentIds array is required.' });
    }

    const staff = await prisma.staffProfile.findUnique({ where: { id } });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found.' });

    let createdCount = 0;
    for (const studentId of studentIds) {
      try {
        await prisma.staffStudentAssignment.upsert({
          where: {
            staffProfileId_studentId: {
              staffProfileId: id,
              studentId
            }
          },
          update: {},
          create: {
            staffProfileId: id,
            studentId
          }
        });
        createdCount++;
      } catch (err) {
        // ignore duplicate
      }
    }

    await logAdminAction(prisma, {
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'ASSIGN_STUDENTS_TO_STAFF',
      targetType: 'StaffProfile',
      targetId: id,
      details: { staffName: staff.fullName, assignedCount: createdCount }
    });

    return res.json({
      success: true,
      message: `Assigned ${createdCount} student(s) to ${staff.fullName}.`
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/staff/:id/assign/:studentId
export async function removeStaffAssignment(req, res, next) {
  try {
    const { id, studentId } = req.params;
    await prisma.staffStudentAssignment.deleteMany({
      where: {
        staffProfileId: id,
        studentId
      }
    });

    return res.json({ success: true, message: 'Student assignment removed.' });
  } catch (error) {
    next(error);
  }
}

// --- ACCOUNT & CREDENTIAL MANAGEMENT ---

// GET /api/admin/credentials
export async function getAccountsAndCredentials(req, res, next) {
  try {
    const { role, status, q, page = 1, limit = 25 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (role && role !== 'all') where.role = role;

    if (q && q.trim()) {
      const keyword = q.trim();
      where.OR = [
        { email: { contains: keyword, mode: 'insensitive' } },
        { studentProfile: { fullName: { contains: keyword, mode: 'insensitive' } } },
        { studentProfile: { rollNumber: { contains: keyword, mode: 'insensitive' } } },
        { staffProfile: { fullName: { contains: keyword, mode: 'insensitive' } } },
        { staffProfile: { staffId: { contains: keyword, mode: 'insensitive' } } }
      ];
    }

    if (status) {
      where.studentProfile = { status };
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ createdAt: 'desc' }],
        select: {
          id: true,
          email: true,
          role: true,
          isInitialPassword: true,
          createdAt: true,
          updatedAt: true,
          studentProfile: {
            select: {
              id: true,
              fullName: true,
              rollNumber: true,
              status: true,
              isApproved: true,
              department: { select: { code: true, name: true } },
              batch: { select: { name: true } }
            }
          },
          staffProfile: {
            select: {
              id: true,
              staffId: true,
              fullName: true,
              designation: true,
              department: { select: { code: true, name: true } },
              batch: { select: { name: true } }
            }
          }
        }
      })
    ]);

    return res.json({
      success: true,
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/credentials/reset
export async function resetUserCredential(req, res, next) {
  try {
    const { userId, newPassword } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true, staffProfile: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const passwordToSet = newPassword && newPassword.trim().length >= 6
      ? newPassword.trim()
      : 'College@' + Math.floor(1000 + Math.random() * 9000);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordToSet, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        isInitialPassword: true
      }
    });

    await logAdminAction(prisma, {
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'ADMIN_CREDENTIAL_RESET',
      targetType: 'User',
      targetId: userId,
      details: {
        email: user.email,
        role: user.role,
        targetName: user.studentProfile?.fullName || user.staffProfile?.fullName || user.email
      }
    });

    return res.json({
      success: true,
      message: `Password initialized/reset successfully for ${user.email}. Temporary credentials issued securely.`,
      tempPassword: passwordToSet
    });
  } catch (error) {
    next(error);
  }
}

// --- CENTRALIZED VERIFICATION LOGS ---

// GET /api/admin/verification-logs
export async function getVerificationLogs(req, res, next) {
  try {
    const { decision, reviewerId, studentId, q, page = 1, limit = 30 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (decision && decision !== 'all') where.decision = decision;
    if (reviewerId) where.reviewerStaffId = reviewerId;
    if (studentId) where.studentId = studentId;

    if (q && q.trim()) {
      const keyword = q.trim();
      where.OR = [
        { reviewerName: { contains: keyword, mode: 'insensitive' } },
        { reviewerEmail: { contains: keyword, mode: 'insensitive' } },
        { student: { fullName: { contains: keyword, mode: 'insensitive' } } },
        { student: { rollNumber: { contains: keyword, mode: 'insensitive' } } },
        { comments: { contains: keyword, mode: 'insensitive' } },
        { documentSubmission: { title: { contains: keyword, mode: 'insensitive' } } }
      ];
    }

    const [total, records] = await Promise.all([
      prisma.verificationRecord.count({ where }),
      prisma.verificationRecord.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          documentSubmission: true,
          student: {
            select: {
              id: true,
              fullName: true,
              rollNumber: true,
              slug: true,
              department: { select: { code: true, name: true } },
              batch: { select: { name: true } }
            }
          },
          reviewerStaff: {
            select: {
              id: true,
              staffId: true,
              fullName: true,
              designation: true
            }
          }
        }
      })
    ]);

    return res.json({
      success: true,
      records,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
}
