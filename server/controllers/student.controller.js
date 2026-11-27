import { z } from 'zod';
import prisma from '../prisma/prismaClient.js';
import { generateUniqueSlug } from '../utils/slugGenerator.js';
import { calculateProfileCompletion } from '../utils/completionCalc.js';
import { syncStudentVerificationAndPublish } from '../services/verificationGate.service.js';

// Helper to get current authenticated student profile
async function getStudentProfileByUserId(userId) {
  return await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { email: true, role: true } },
      department: true,
      batch: true,
      links: true,
      skills: {
        include: { skill: true }
      },
      education: {
        orderBy: [{ startYear: 'desc' }]
      },
      projects: {
        include: {
          technologies: {
            include: { skill: true }
          }
        },
        orderBy: [{ createdAt: 'desc' }]
      },
      certifications: {
        orderBy: [{ issueDate: 'desc' }]
      },
      experience: {
        orderBy: [{ startDate: 'desc' }]
      },
      achievements: {
        orderBy: [{ date: 'desc' }]
      },
      extracurriculars: {
        orderBy: [{ createdAt: 'desc' }]
      },
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
}

// GET /api/students/me
export async function getMyProfile(req, res, next) {
  try {
    const profile = await getStudentProfileByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const completion = calculateProfileCompletion(profile);

    return res.json({
      success: true,
      profile,
      completion
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/students/me/profile
const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must have at least 2 characters.'),
  bio: z.string().max(150, 'Bio cannot exceed 150 characters.').optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable()
});

export async function updateMyProfile(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const data = updateProfileSchema.parse(req.body);

    let newSlug = profile.slug;
    if (data.fullName && data.fullName !== profile.fullName) {
      newSlug = await generateUniqueSlug(prisma, data.fullName, profile.id);
    }

    const updated = await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        fullName: data.fullName,
        slug: newSlug,
        bio: data.bio !== undefined ? data.bio : profile.bio,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        photoUrl: data.photoUrl !== undefined ? data.photoUrl : profile.photoUrl
      },
      include: {
        department: true,
        batch: true
      }
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updated
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/students/me/visibility
export async function updateVisibility(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const visibilitySettings = req.body;
    const updated = await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { visibilitySettings }
    });

    return res.json({
      success: true,
      message: 'Visibility settings updated.',
      visibilitySettings: updated.visibilitySettings
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/students/me/publish
export async function togglePublish(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

    // Public portfolio link activation is governed strictly by assigned staff publishing approval
    return res.status(403).json({
      success: false,
      message: 'Portfolio publishing is controlled by your assigned faculty tutor. The public portfolio link can only be approved and published by your assigned faculty tutor after reviewing and verifying all your submitted documents.'
    });
  } catch (error) {
    next(error);
  }
}

// --- LINKS ---
const linkSchema = z.object({
  platform: z.string().min(1, 'Platform name is required.'),
  url: z.string().url('Please enter a valid URL.'),
  label: z.string().optional().nullable()
});

export async function addLink(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = linkSchema.parse(req.body);

    const link = await prisma.studentLink.create({
      data: {
        studentId: profile.id,
        platform: data.platform,
        url: data.url,
        label: data.label
      }
    });

    return res.status(201).json({ success: true, message: 'Link added.', link });
  } catch (error) {
    next(error);
  }
}

export async function updateLink(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = linkSchema.parse(req.body);

    const existing = await prisma.studentLink.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Link not found or unauthorized.' });

    const updated = await prisma.studentLink.update({
      where: { id },
      data: {
        platform: data.platform,
        url: data.url,
        label: data.label
      }
    });

    return res.json({ success: true, message: 'Link updated.', link: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteLink(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });

    const existing = await prisma.studentLink.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Link not found or unauthorized.' });

    await prisma.studentLink.delete({ where: { id } });
    return res.json({ success: true, message: 'Link deleted.' });
  } catch (error) {
    next(error);
  }
}

// --- SKILLS & INTERESTS ---
export async function syncSkills(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const { skills } = req.body; // Array of { name, category, proficiency }

    if (!Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: 'Skills must be an array.' });
    }

    // Use transaction to update student skills cleanly
    await prisma.$transaction(async (tx) => {
      // Clear existing student skills
      await tx.studentSkill.deleteMany({
        where: { studentId: profile.id }
      });

      for (const item of skills) {
        const cleanName = item.name.trim();
        if (!cleanName) continue;

        const category = ['TECHNICAL', 'SOFT', 'INTEREST'].includes(item.category)
          ? item.category
          : 'TECHNICAL';

        // Upsert skill in shared dictionary
        let skillRecord = await tx.skill.findUnique({
          where: { name: cleanName }
        });

        if (!skillRecord) {
          skillRecord = await tx.skill.create({
            data: {
              name: cleanName,
              category
            }
          });
        }

        // Link student to skill
        await tx.studentSkill.create({
          data: {
            studentId: profile.id,
            skillId: skillRecord.id,
            proficiency: item.proficiency || 'Intermediate'
          }
        });
      }
    });

    const updatedProfile = await getStudentProfileByUserId(req.user.id);
    return res.json({
      success: true,
      message: 'Skills and interests updated.',
      skills: updatedProfile.skills
    });
  } catch (error) {
    next(error);
  }
}

// --- EDUCATION ---
const educationSchema = z.object({
  level: z.enum(['SCHOOL', 'DIPLOMA', 'UG', 'PG', 'OTHER']),
  program: z.string().min(2, 'Program name is required.'),
  institution: z.string().min(2, 'Institution name is required.'),
  fieldOfStudy: z.string().min(2, 'Field of study is required.'),
  startYear: z.number().int().min(1970).max(2100),
  endYear: z.number().int().min(1970).max(2100).optional().nullable(),
  isCurrent: z.boolean().default(false),
  grade: z.string().optional().nullable()
}).refine(data => {
  if (!data.isCurrent && data.endYear) {
    return data.endYear >= data.startYear;
  }
  return true;
}, {
  message: 'End year cannot be earlier than start year.',
  path: ['endYear']
});

export async function addEducation(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = educationSchema.parse(req.body);

    const record = await prisma.education.create({
      data: {
        studentId: profile.id,
        level: data.level,
        program: data.program,
        institution: data.institution,
        fieldOfStudy: data.fieldOfStudy,
        startYear: data.startYear,
        endYear: data.isCurrent ? null : data.endYear,
        isCurrent: data.isCurrent,
        grade: data.grade
      }
    });

    return res.status(201).json({ success: true, message: 'Education record added.', education: record });
  } catch (error) {
    next(error);
  }
}

export async function updateEducation(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = educationSchema.parse(req.body);

    const existing = await prisma.education.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Education record not found or unauthorized.' });

    const updated = await prisma.education.update({
      where: { id },
      data: {
        level: data.level,
        program: data.program,
        institution: data.institution,
        fieldOfStudy: data.fieldOfStudy,
        startYear: data.startYear,
        endYear: data.isCurrent ? null : data.endYear,
        isCurrent: data.isCurrent,
        grade: data.grade
      }
    });

    return res.json({ success: true, message: 'Education record updated.', education: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteEducation(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });

    const existing = await prisma.education.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Education record not found or unauthorized.' });

    await prisma.education.delete({ where: { id } });
    return res.json({ success: true, message: 'Education record deleted.' });
  } catch (error) {
    next(error);
  }
}

// --- PROJECTS ---
const projectSchema = z.object({
  title: z.string().min(2, 'Project title is required.'),
  summary: z.string().optional().nullable(),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  category: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isOngoing: z.boolean().default(false),
  githubUrl: z.string().url('Invalid GitHub URL').optional().nullable().or(z.literal('')),
  demoLink: z.string().url('Invalid Demo URL').optional().nullable().or(z.literal('')),
  screenshotUrl: z.string().optional().nullable(),
  progressStatus: z.enum(['COMPLETED', 'IN_PROGRESS', 'PROTOTYPE']).default('COMPLETED'),
  technologies: z.array(z.string()).optional().default([])
}).refine(data => {
  if (data.startDate && data.endDate && !data.isOngoing) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date cannot be earlier than start date.',
  path: ['endDate']
});

export async function addProject(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = projectSchema.parse(req.body);

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          studentId: profile.id,
          title: data.title,
          summary: data.summary,
          description: data.description,
          category: data.category,
          role: data.role,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.isOngoing || !data.endDate ? null : new Date(data.endDate),
          isOngoing: data.isOngoing,
          githubUrl: data.githubUrl || null,
          demoLink: data.demoLink || null,
          screenshotUrl: data.screenshotUrl || null,
          progressStatus: data.progressStatus
        }
      });

      if (data.technologies && data.technologies.length > 0) {
        for (const tech of data.technologies) {
          const cleanTech = tech.trim();
          if (!cleanTech) continue;

          let skill = await tx.skill.findUnique({ where: { name: cleanTech } });
          if (!skill) {
            skill = await tx.skill.create({
              data: { name: cleanTech, category: 'TECHNICAL' }
            });
          }

          await tx.projectTechnology.create({
            data: {
              projectId: created.id,
              skillId: skill.id
            }
          });
        }
      }

      return await tx.project.findUnique({
        where: { id: created.id },
        include: { technologies: { include: { skill: true } } }
      });
    });

    return res.status(201).json({ success: true, message: 'Project created successfully.', project });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = projectSchema.parse(req.body);

    const existing = await prisma.project.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Project not found or unauthorized.' });

    const updated = await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id },
        data: {
          title: data.title,
          summary: data.summary,
          description: data.description,
          category: data.category,
          role: data.role,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.isOngoing || !data.endDate ? null : new Date(data.endDate),
          isOngoing: data.isOngoing,
          githubUrl: data.githubUrl || null,
          demoLink: data.demoLink || null,
          screenshotUrl: data.screenshotUrl || null,
          progressStatus: data.progressStatus
        }
      });

      // Sync technologies
      await tx.projectTechnology.deleteMany({ where: { projectId: id } });

      if (data.technologies && data.technologies.length > 0) {
        for (const tech of data.technologies) {
          const cleanTech = tech.trim();
          if (!cleanTech) continue;

          let skill = await tx.skill.findUnique({ where: { name: cleanTech } });
          if (!skill) {
            skill = await tx.skill.create({
              data: { name: cleanTech, category: 'TECHNICAL' }
            });
          }

          await tx.projectTechnology.create({
            data: {
              projectId: id,
              skillId: skill.id
            }
          });
        }
      }

      return await tx.project.findUnique({
        where: { id },
        include: { technologies: { include: { skill: true } } }
      });
    });

    return res.json({ success: true, message: 'Project updated successfully.', project: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });

    const existing = await prisma.project.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Project not found or unauthorized.' });

    await prisma.project.delete({ where: { id } });
    return res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// --- CERTIFICATIONS ---
const certSchema = z.object({
  name: z.string().min(2, 'Certification name is required.'),
  issuer: z.string().min(2, 'Issuer name is required.'),
  issueDate: z.string().min(1, 'Issue date is required.'),
  expiryDate: z.string().optional().nullable(),
  credentialUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  certificateFileUrl: z.string().optional().nullable()
});

export async function addCertification(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = certSchema.parse(req.body);

    const record = await prisma.certification.create({
      data: {
        studentId: profile.id,
        name: data.name,
        issuer: data.issuer,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        credentialUrl: data.credentialUrl || null,
        certificateFileUrl: data.certificateFileUrl || null,
        verificationStatus: 'PENDING'
      }
    });

    return res.status(201).json({ success: true, message: 'Certification added and submitted for verification.', certification: record });
  } catch (error) {
    next(error);
  }
}

export async function updateCertification(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = certSchema.parse(req.body);

    const existing = await prisma.certification.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Certification not found or unauthorized.' });

    const updated = await prisma.certification.update({
      where: { id },
      data: {
        name: data.name,
        issuer: data.issuer,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        credentialUrl: data.credentialUrl || null,
        certificateFileUrl: data.certificateFileUrl || null,
        verificationStatus: 'PENDING' // re-trigger pending verification when updated
      }
    });

    return res.json({ success: true, message: 'Certification updated.', certification: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteCertification(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });

    const existing = await prisma.certification.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Certification not found or unauthorized.' });

    await prisma.certification.delete({ where: { id } });
    return res.json({ success: true, message: 'Certification deleted.' });
  } catch (error) {
    next(error);
  }
}

// --- EXPERIENCE ---
const expSchema = z.object({
  organization: z.string().min(2, 'Organization is required.'),
  role: z.string().min(2, 'Role is required.'),
  location: z.string().optional().nullable(),
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().min(10, 'Description must be at least 10 characters.')
}).refine(data => {
  if (data.startDate && data.endDate && !data.isCurrent) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date cannot be earlier than start date.',
  path: ['endDate']
});

export async function addExperience(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = expSchema.parse(req.body);

    const record = await prisma.experience.create({
      data: {
        studentId: profile.id,
        organization: data.organization,
        role: data.role,
        location: data.location || null,
        startDate: new Date(data.startDate),
        endDate: data.isCurrent || !data.endDate ? null : new Date(data.endDate),
        isCurrent: data.isCurrent,
        description: data.description
      }
    });

    return res.status(201).json({ success: true, message: 'Experience added.', experience: record });
  } catch (error) {
    next(error);
  }
}

export async function updateExperience(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = expSchema.parse(req.body);

    const existing = await prisma.experience.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Experience record not found or unauthorized.' });

    const updated = await prisma.experience.update({
      where: { id },
      data: {
        organization: data.organization,
        role: data.role,
        location: data.location || null,
        startDate: new Date(data.startDate),
        endDate: data.isCurrent || !data.endDate ? null : new Date(data.endDate),
        isCurrent: data.isCurrent,
        description: data.description
      }
    });

    return res.json({ success: true, message: 'Experience record updated.', experience: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteExperience(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });

    const existing = await prisma.experience.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Experience record not found or unauthorized.' });

    await prisma.experience.delete({ where: { id } });
    return res.json({ success: true, message: 'Experience record deleted.' });
  } catch (error) {
    next(error);
  }
}

// --- ACHIEVEMENTS ---
const achSchema = z.object({
  title: z.string().min(2, 'Title is required.'),
  description: z.string().min(5, 'Description is required.'),
  date: z.string().min(1, 'Date is required.'),
  proofUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  proofFileUrl: z.string().optional().nullable()
});

export async function addAchievement(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = achSchema.parse(req.body);

    const record = await prisma.achievement.create({
      data: {
        studentId: profile.id,
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        proofUrl: data.proofUrl || null,
        proofFileUrl: data.proofFileUrl || null,
        verificationStatus: 'PENDING'
      }
    });

    return res.status(201).json({ success: true, message: 'Achievement added.', achievement: record });
  } catch (error) {
    next(error);
  }
}

export async function updateAchievement(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = achSchema.parse(req.body);

    const existing = await prisma.achievement.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Achievement not found or unauthorized.' });

    const updated = await prisma.achievement.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        proofUrl: data.proofUrl || null,
        proofFileUrl: data.proofFileUrl || null,
        verificationStatus: 'PENDING'
      }
    });

    return res.json({ success: true, message: 'Achievement updated.', achievement: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteAchievement(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });

    const existing = await prisma.achievement.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Achievement not found or unauthorized.' });

    await prisma.achievement.delete({ where: { id } });
    return res.json({ success: true, message: 'Achievement deleted.' });
  } catch (error) {
    next(error);
  }
}

// --- EXTRACURRICULARS ---
const extraSchema = z.object({
  activityName: z.string().min(2, 'Activity name is required.'),
  role: z.string().min(2, 'Role is required.'),
  organization: z.string().optional().nullable(),
  duration: z.string().min(1, 'Duration is required.'),
  description: z.string().min(5, 'Description is required.')
});

export async function addExtracurricular(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = extraSchema.parse(req.body);

    const record = await prisma.extracurricular.create({
      data: {
        studentId: profile.id,
        activityName: data.activityName,
        role: data.role,
        organization: data.organization || null,
        duration: data.duration,
        description: data.description
      }
    });

    return res.status(201).json({ success: true, message: 'Extracurricular activity added.', extracurricular: record });
  } catch (error) {
    next(error);
  }
}

export async function updateExtracurricular(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const data = extraSchema.parse(req.body);

    const existing = await prisma.extracurricular.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Extracurricular record not found or unauthorized.' });

    const updated = await prisma.extracurricular.update({
      where: { id },
      data: {
        activityName: data.activityName,
        role: data.role,
        organization: data.organization || null,
        duration: data.duration,
        description: data.description
      }
    });

    return res.json({ success: true, message: 'Extracurricular updated.', extracurricular: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteExtracurricular(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });

    const existing = await prisma.extracurricular.findFirst({
      where: { id, studentId: profile.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Extracurricular record not found or unauthorized.' });

    await prisma.extracurricular.delete({ where: { id } });
    return res.json({ success: true, message: 'Extracurricular deleted.' });
  } catch (error) {
    next(error);
  }
}

// --- DOCUMENT VERIFICATION (STUDENT) ---

// GET /api/students/me/documents
export async function getMyDocuments(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: 'Student profile not found.' });

    const documents = await prisma.documentSubmission.findMany({
      where: { studentId: profile.id },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        verificationRecords: {
          orderBy: [{ createdAt: 'desc' }]
        }
      }
    });

    const counts = {
      total: documents.length,
      pending: documents.filter(d => d.status === 'PENDING').length,
      verified: documents.filter(d => d.status === 'VERIFIED').length,
      rejected: documents.filter(d => d.status === 'REJECTED').length,
      resubmissionRequired: documents.filter(d => d.status === 'RESUBMISSION_REQUIRED').length
    };

    return res.json({
      success: true,
      documents,
      counts
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/students/me/documents
const documentSubmissionSchema = z.object({
  title: z.string().min(2, 'Document title is required.'),
  category: z.enum(['CERTIFICATE', 'ACHIEVEMENT', 'INTERNSHIP_EXPERIENCE', 'ACADEMIC_SUPPORTING', 'OTHER']).default('CERTIFICATE'),
  fileUrl: z.string().min(1, 'Uploaded file location is required.'),
  fileName: z.string().optional().nullable(),
  fileSize: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
  credentialUrl: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  issueDate: z.string().optional().nullable()
});

export async function submitDocument(req, res, next) {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: 'Student profile not found.' });

    const data = documentSubmissionSchema.parse(req.body);

    const submission = await prisma.documentSubmission.create({
      data: {
        studentId: profile.id,
        title: data.title,
        category: data.category,
        fileUrl: data.fileUrl,
        fileName: data.fileName || null,
        fileSize: data.fileSize || null,
        description: data.description || null,
        credentialUrl: data.credentialUrl || null,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        status: 'PENDING',
        version: 1
      },
      include: {
        verificationRecords: true
      }
    });

    // Submitting a new document re-checks publish status (held pending staff verification)
    await syncStudentVerificationAndPublish(profile.id);

    return res.status(201).json({
      success: true,
      message: 'Document submitted successfully. Status is marked as Pending Verification.',
      document: submission
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/students/me/documents/:id/resubmit
const resubmitSchema = z.object({
  title: z.string().min(2).optional(),
  category: z.enum(['CERTIFICATE', 'ACHIEVEMENT', 'INTERNSHIP_EXPERIENCE', 'ACADEMIC_SUPPORTING', 'OTHER']).optional(),
  fileUrl: z.string().min(1, 'New file is required for resubmission.'),
  fileName: z.string().optional().nullable(),
  fileSize: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
  credentialUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  issueDate: z.string().optional().nullable()
});

export async function resubmitDocument(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: 'Student profile not found.' });

    const existing = await prisma.documentSubmission.findFirst({
      where: { id, studentId: profile.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Document submission not found or unauthorized.' });
    }

    const data = resubmitSchema.parse(req.body);

    const updated = await prisma.documentSubmission.update({
      where: { id },
      data: {
        title: data.title || existing.title,
        category: data.category || existing.category,
        fileUrl: data.fileUrl,
        fileName: data.fileName !== undefined ? data.fileName : existing.fileName,
        fileSize: data.fileSize !== undefined ? data.fileSize : existing.fileSize,
        description: data.description !== undefined ? data.description : existing.description,
        credentialUrl: data.credentialUrl !== undefined ? (data.credentialUrl || null) : existing.credentialUrl,
        issueDate: data.issueDate ? new Date(data.issueDate) : existing.issueDate,
        status: 'PENDING', // Re-triggers pending verification
        version: existing.version + 1
      },
      include: {
        verificationRecords: {
          orderBy: [{ createdAt: 'desc' }]
        }
      }
    });

    // Resubmission re-evaluates verification gate
    await syncStudentVerificationAndPublish(profile.id);

    return res.json({
      success: true,
      message: 'Document resubmitted successfully. It is now Pending Verification by your Staff reviewer.',
      document: updated
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/students/me/documents/:id
export async function deleteDocument(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: 'Student profile not found.' });

    const existing = await prisma.documentSubmission.findFirst({
      where: { id, studentId: profile.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
    }

    if (existing.status === 'VERIFIED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an already verified document. Please contact your Staff in-charge.'
      });
    }

    await prisma.documentSubmission.delete({ where: { id } });
    await syncStudentVerificationAndPublish(profile.id);
    return res.json({ success: true, message: 'Document submission deleted successfully.' });
  } catch (error) {
    next(error);
  }
}
