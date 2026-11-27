import { z } from 'zod';
import prisma from '../prisma/prismaClient.js';
import {
  getStudentVerificationStatus,
  revokePublicAccessIfUnverified,
  syncStudentVerificationAndPublish
} from '../services/verificationGate.service.js';

// Helper to retrieve the current staff member's profile
async function getStaffProfile(userId) {
  return await prisma.staffProfile.findUnique({
    where: { userId },
    include: {
      department: true,
      batch: true,
      assignedStudents: {
        include: { student: true }
      }
    }
  });
}

// Helper to determine the student query condition based on staff assignments
async function getAuthorizedStudentCondition(staffProfile) {
  const directAssignments = await prisma.staffStudentAssignment.findMany({
    where: { staffProfileId: staffProfile.id },
    select: { studentId: true }
  });
  const directStudentIds = directAssignments.map(a => a.studentId);

  const orConditions = [];
  if (directStudentIds.length > 0) {
    orConditions.push({ id: { in: directStudentIds } });
  }
  if (staffProfile.batchId) {
    orConditions.push({ batchId: staffProfile.batchId });
  } else if (staffProfile.departmentId) {
    orConditions.push({ departmentId: staffProfile.departmentId });
  }

  if (orConditions.length === 0) {
    // If no direct or departmental assignments exist, restrict to none
    return { id: '__NO_ASSIGNED_STUDENTS__' };
  }

  return { OR: orConditions };
}

// GET /api/staff/overview
export async function getStaffOverview(req, res, next) {
  try {
    const staff = await getStaffProfile(req.user.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    const studentCondition = await getAuthorizedStudentCondition(staff);
    const authorizedStudents = await prisma.studentProfile.findMany({
      where: studentCondition,
      select: { id: true }
    });
    const studentIds = authorizedStudents.map(s => s.id);

    const [
      pendingCount,
      verifiedCount,
      rejectedCount,
      resubmissionCount,
      recentSubmissions
    ] = await Promise.all([
      prisma.documentSubmission.count({
        where: { studentId: { in: studentIds }, status: 'PENDING' }
      }),
      prisma.documentSubmission.count({
        where: { studentId: { in: studentIds }, status: 'VERIFIED' }
      }),
      prisma.documentSubmission.count({
        where: { studentId: { in: studentIds }, status: 'REJECTED' }
      }),
      prisma.documentSubmission.count({
        where: { studentId: { in: studentIds }, status: 'RESUBMISSION_REQUIRED' }
      }),
      prisma.documentSubmission.findMany({
        where: { studentId: { in: studentIds }, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              rollNumber: true,
              slug: true,
              photoUrl: true,
              department: { select: { code: true, name: true } },
              batch: { select: { name: true } }
            }
          }
        }
      })
    ]);

    return res.json({
      success: true,
      staff: {
        id: staff.id,
        staffId: staff.staffId,
        fullName: staff.fullName,
        designation: staff.designation,
        phone: staff.phone,
        department: staff.department,
        batch: staff.batch
      },
      counts: {
        assignedStudents: studentIds.length,
        pending: pendingCount,
        verified: verifiedCount,
        rejected: rejectedCount,
        resubmissionRequired: resubmissionCount,
        totalReviewed: verifiedCount + rejectedCount + resubmissionCount
      },
      recentSubmissions
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/staff/students
export async function getAssignedStudents(req, res, next) {
  try {
    const staff = await getStaffProfile(req.user.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    const { q, batchId, status } = req.query;
    const baseCondition = await getAuthorizedStudentCondition(staff);

    const andConditions = [baseCondition];
    if (q) {
      andConditions.push({
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { rollNumber: { contains: q, mode: 'insensitive' } },
          { user: { email: { contains: q, mode: 'insensitive' } } }
        ]
      });
    }
    if (batchId) {
      andConditions.push({ batchId });
    }
    if (status) {
      andConditions.push({ status });
    }

    const students = await prisma.studentProfile.findMany({
      where: { AND: andConditions },
      orderBy: [{ rollNumber: 'asc' }],
      include: {
        user: { select: { email: true } },
        department: { select: { code: true, name: true } },
        batch: { select: { name: true, graduationYear: true } },
        documentSubmissions: {
          select: {
            id: true,
            status: true,
            category: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            projects: true,
            certifications: true,
            achievements: true,
            documentSubmissions: true
          }
        }
      }
    });

    const enriched = students.map(s => {
      const pendingDocs = s.documentSubmissions.filter(d => d.status === 'PENDING').length;
      const verifiedDocs = s.documentSubmissions.filter(d => d.status === 'VERIFIED').length;
      const actionNeeded = s.documentSubmissions.filter(d => d.status === 'RESUBMISSION_REQUIRED' || d.status === 'REJECTED').length;
      const canPublish = s.status === 'ACTIVE' && pendingDocs === 0 && actionNeeded === 0;

      return {
        id: s.id,
        fullName: s.fullName,
        rollNumber: s.rollNumber,
        slug: s.slug,
        email: s.user.email,
        department: s.department,
        batch: s.batch,
        status: s.status,
        isApproved: s.isApproved,
        isPublished: s.isPublished,
        photoUrl: s.photoUrl,
        pendingDocs,
        verifiedDocs,
        actionNeeded,
        canPublish,
        counts: s._count
      };
    });

    return res.json({ success: true, students: enriched });
  } catch (error) {
    next(error);
  }
}

// GET /api/staff/students/:id
export async function getStudentDetails(req, res, next) {
  try {
    const { id } = req.params;
    const staff = await getStaffProfile(req.user.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    const studentCondition = await getAuthorizedStudentCondition(staff);
    const isAuthorized = await prisma.studentProfile.findFirst({
      where: {
        id,
        ...studentCondition
      }
    });

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this student portfolio.'
      });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true } },
        department: true,
        batch: true,
        links: true,
        skills: { include: { skill: true } },
        education: { orderBy: [{ startYear: 'desc' }] },
        projects: {
          include: {
            technologies: { include: { skill: true } }
          },
          orderBy: [{ createdAt: 'desc' }]
        },
        certifications: { orderBy: [{ issueDate: 'desc' }] },
        experience: { orderBy: [{ startDate: 'desc' }] },
        achievements: { orderBy: [{ date: 'desc' }] },
        extracurriculars: { orderBy: [{ createdAt: 'desc' }] },
        documentSubmissions: {
          orderBy: [{ createdAt: 'desc' }],
          include: {
            verificationRecords: {
              orderBy: [{ createdAt: 'desc' }]
            }
          }
        }
      }
    });

    const verificationStatus = await getStudentVerificationStatus(student.id);

    return res.json({ success: true, student, verificationStatus });
  } catch (error) {
    next(error);
  }
}

// GET /api/staff/verifications
export async function getVerificationQueue(req, res, next) {
  try {
    const staff = await getStaffProfile(req.user.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    const { status, category, studentId, q } = req.query;
    const studentCondition = await getAuthorizedStudentCondition(staff);

    const authorizedStudents = await prisma.studentProfile.findMany({
      where: studentCondition,
      select: { id: true }
    });
    const authorizedIds = authorizedStudents.map(s => s.id);

    const where = {
      studentId: { in: authorizedIds }
    };

    if (status && status !== 'all') {
      if (status === 'REJECTED') {
        where.status = { in: ['REJECTED', 'RESUBMISSION_REQUIRED'] };
      } else {
        where.status = status;
      }
    }
    if (category && category !== 'all') {
      where.category = category;
    }
    if (studentId) {
      where.studentId = studentId;
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { student: { fullName: { contains: q, mode: 'insensitive' } } },
        { student: { rollNumber: { contains: q, mode: 'insensitive' } } }
      ];
    }

    const submissions = await prisma.documentSubmission.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
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
        verificationRecords: {
          orderBy: [{ createdAt: 'desc' }]
        }
      }
    });

    return res.json({ success: true, submissions, count: submissions.length });
  } catch (error) {
    next(error);
  }
}

// GET /api/staff/verifications/:id
export async function getVerificationItem(req, res, next) {
  try {
    const { id } = req.params;
    const staff = await getStaffProfile(req.user.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    const submission = await prisma.documentSubmission.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            department: true,
            batch: true
          }
        },
        verificationRecords: {
          orderBy: [{ createdAt: 'desc' }]
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Document submission not found.' });
    }

    const studentCondition = await getAuthorizedStudentCondition(staff);
    const isAuthorized = await prisma.studentProfile.findFirst({
      where: {
        id: submission.studentId,
        ...studentCondition
      }
    });

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to review documents for this student.'
      });
    }

    return res.json({ success: true, submission });
  } catch (error) {
    next(error);
  }
}

// POST /api/staff/verifications/:id/decision
const decisionSchema = z.object({
  decision: z.enum(['VERIFIED', 'REJECTED', 'RESUBMISSION_REQUIRED']),
  comments: z.string().optional()
}).refine(data => {
  if (['REJECTED', 'RESUBMISSION_REQUIRED'].includes(data.decision)) {
    return Boolean(data.comments && data.comments.trim().length >= 5);
  }
  return true;
}, {
  message: 'A mandatory comment or reason explaining the issue (minimum 5 characters) is required for rejection or resubmission requests.',
  path: ['comments']
});

export async function recordVerificationDecision(req, res, next) {
  try {
    const { id } = req.params;
    const staff = await getStaffProfile(req.user.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    const { decision, comments } = decisionSchema.parse(req.body);

    const submission = await prisma.documentSubmission.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Document submission not found.' });
    }

    const studentCondition = await getAuthorizedStudentCondition(staff);
    const isAuthorized = await prisma.studentProfile.findFirst({
      where: {
        id: submission.studentId,
        ...studentCondition
      }
    });

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to make verification decisions for this student.'
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Document Submission status
      const updatedSubmission = await tx.documentSubmission.update({
        where: { id },
        data: {
          status: decision
        }
      });

      // 2. Insert new permanent VerificationRecord
      const record = await tx.verificationRecord.create({
        data: {
          documentSubmissionId: id,
          studentId: submission.studentId,
          reviewerStaffId: staff.id,
          reviewerName: staff.fullName,
          reviewerEmail: req.user.email,
          reviewerRole: staff.designation || 'Class In-charge / Tutor',
          decision,
          comments: comments ? comments.trim() : null
        }
      });

      // 3. Sync linked Certification or Achievement if applicable
      if (submission.certificationId) {
        await tx.certification.update({
          where: { id: submission.certificationId },
          data: {
            verificationStatus: decision,
            verificationNotes: comments ? comments.trim() : null,
            verifiedAt: new Date(),
            verifiedBy: staff.fullName
          }
        }).catch(() => null);
      } else if (submission.category === 'CERTIFICATE') {
        // Find matching certification by title and student if exists
        const cert = await tx.certification.findFirst({
          where: { studentId: submission.studentId, name: submission.title }
        });
        if (cert) {
          await tx.certification.update({
            where: { id: cert.id },
            data: {
              verificationStatus: decision,
              verificationNotes: comments ? comments.trim() : null,
              verifiedAt: new Date(),
              verifiedBy: staff.fullName
            }
          });
        }
      }

      if (submission.achievementId) {
        await tx.achievement.update({
          where: { id: submission.achievementId },
          data: {
            verificationStatus: decision,
            verifiedAt: new Date(),
            verifiedBy: staff.fullName
          }
        }).catch(() => null);
      } else if (submission.category === 'ACHIEVEMENT') {
        const ach = await tx.achievement.findFirst({
          where: { studentId: submission.studentId, title: submission.title }
        });
        if (ach) {
          await tx.achievement.update({
            where: { id: ach.id },
            data: {
              verificationStatus: decision,
              verifiedAt: new Date(),
              verifiedBy: staff.fullName
            }
          });
        }
      }

      // 4. Record in Audit Log for centralized monitoring
      await tx.auditLog.create({
        data: {
          adminId: staff.id,
          adminEmail: req.user.email,
          action: `STAFF_VERIFICATION_${decision}`,
          targetType: 'DocumentSubmission',
          targetId: id,
          details: JSON.stringify({
            studentId: submission.studentId,
            studentName: submission.student.fullName,
            documentTitle: submission.title,
            category: submission.category,
            decision,
            comments,
            reviewer: staff.fullName
          })
        }
      });

      return { updatedSubmission, record };
    });

    // If decision was rejected or requires correction, immediately revoke public access
    if (decision === 'REJECTED' || decision === 'RESUBMISSION_REQUIRED') {
      await revokePublicAccessIfUnverified(submission.studentId);
    }

    const statusDisplay = decision === 'VERIFIED'
      ? 'Approved / Verified'
      : decision === 'REJECTED'
      ? 'Rejected'
      : 'Resubmission Requested';

    return res.json({
      success: true,
      message: `Document successfully marked as ${statusDisplay}.`,
      submission: result.updatedSubmission,
      record: result.record
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/staff/students/:id/publish
export async function toggleStudentPublishStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    const staff = await getStaffProfile(req.user.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    const studentCondition = await getAuthorizedStudentCondition(staff);
    const student = await prisma.studentProfile.findFirst({
      where: {
        id,
        ...studentCondition
      }
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to manage publishing for this student.'
      });
    }

    if (isPublished) {
      const verificationStatus = await getStudentVerificationStatus(student.id);
      if (!verificationStatus.canPublish) {
        return res.status(400).json({
          success: false,
          message: `Cannot publish portfolio: ${verificationStatus.reason}`,
          verificationStatus
        });
      }

      await prisma.studentProfile.update({
        where: { id: student.id },
        data: { isPublished: true }
      });

      await prisma.auditLog.create({
        data: {
          adminId: staff.id,
          adminEmail: req.user.email,
          action: 'STAFF_PUBLISHED_PORTFOLIO',
          targetType: 'StudentProfile',
          targetId: student.id,
          details: JSON.stringify({
            studentName: student.fullName,
            rollNumber: student.rollNumber,
            publishedBy: staff.fullName
          })
        }
      });

      return res.json({
        success: true,
        message: `Student portfolio for ${student.fullName} has been approved and published for public discovery.`,
        isPublished: true
      });
    } else {
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: { isPublished: false }
      });

      await prisma.auditLog.create({
        data: {
          adminId: staff.id,
          adminEmail: req.user.email,
          action: 'STAFF_UNPUBLISHED_PORTFOLIO',
          targetType: 'StudentProfile',
          targetId: student.id,
          details: JSON.stringify({
            studentName: student.fullName,
            rollNumber: student.rollNumber,
            unpublishedBy: staff.fullName
          })
        }
      });

      return res.json({
        success: true,
        message: `Student portfolio for ${student.fullName} has been unpublished. Public access is now revoked.`,
        isPublished: false
      });
    }
  } catch (error) {
    next(error);
  }
}

// GET /api/staff/history
export async function getVerificationHistory(req, res, next) {
  try {
    const staff = await getStaffProfile(req.user.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    const { decision, studentId, limit = 50 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

    const where = {
      reviewerStaffId: staff.id
    };

    if (decision && decision !== 'all') {
      where.decision = decision;
    }
    if (studentId) {
      where.studentId = studentId;
    }

    const history = await prisma.verificationRecord.findMany({
      where,
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
            department: { select: { code: true } },
            batch: { select: { name: true } }
          }
        }
      }
    });

    return res.json({ success: true, history, count: history.length });
  } catch (error) {
    next(error);
  }
}

// PUT /api/staff/settings
const staffSettingsSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  designation: z.string().optional()
});

export async function updateStaffSettings(req, res, next) {
  try {
    const staff = await getStaffProfile(req.user.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    const data = staffSettingsSchema.parse(req.body);

    const updated = await prisma.staffProfile.update({
      where: { id: staff.id },
      data: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.designation ? { designation: data.designation } : {})
      },
      include: { department: true, batch: true }
    });

    return res.json({ success: true, message: 'Settings updated successfully.', staff: updated });
  } catch (error) {
    next(error);
  }
}
