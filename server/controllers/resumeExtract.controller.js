import prisma from '../prisma/prismaClient.js';
import { parseResume } from '../services/resumeParser.service.js';
import { calculateProfileCompletion } from '../utils/completionCalc.js';

// GET /api/students/me/resume/extract (POST with file)
export async function parseResumeUpload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded. Please upload a PDF or DOCX file.'
      });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        links: true,
        skills: { include: { skill: true } },
        education: true,
        projects: true,
        certifications: true,
        experience: true,
        achievements: true
      }
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const { rawLength, extracted } = await parseResume(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
      studentProfile
    );

    return res.json({
      success: true,
      message: 'Resume parsed successfully. Please review and confirm the extracted data.',
      fileName: req.file.originalname,
      rawLength,
      extracted
    });
  } catch (error) {
    console.error('[Resume Extraction Error]:', error);
    return res.status(422).json({
      success: false,
      message: error.message || 'Failed to parse resume document.'
    });
  }
}

// POST /api/students/me/resume/import
export async function importExtractedData(req, res, next) {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const {
      basicInfo,
      education = [],
      projects = [],
      experience = [],
      certifications = [],
      achievements = [],
      skills = []
    } = req.body;

    const summaryResults = {
      bioUpdated: false,
      linksAdded: 0,
      educationAdded: 0,
      projectsAdded: 0,
      experienceAdded: 0,
      certificationsAdded: 0,
      achievementsAdded: 0,
      skillsAdded: 0
    };

    await prisma.$transaction(async (tx) => {
      // 1. Basic Info - Bio & Links (Never touch rollNumber, department, batch, status, credentials)
      if (basicInfo?.importBio && basicInfo?.bio?.trim()) {
        const cleanBio = basicInfo.bio.trim().slice(0, 150);
        await tx.studentProfile.update({
          where: { id: studentProfile.id },
          data: { bio: cleanBio }
        });
        summaryResults.bioUpdated = true;
      }

      if (Array.isArray(basicInfo?.links)) {
        for (const link of basicInfo.links) {
          if (link.selected && link.url?.trim()) {
            // Check if link already exists
            const existingLink = await tx.studentLink.findFirst({
              where: {
                studentId: studentProfile.id,
                url: link.url.trim()
              }
            });
            if (!existingLink) {
              await tx.studentLink.create({
                data: {
                  studentId: studentProfile.id,
                  platform: link.platform || 'Portfolio',
                  url: link.url.trim(),
                  label: link.label || null
                }
              });
              summaryResults.linksAdded++;
            }
          }
        }
      }

      // 2. Education
      if (Array.isArray(education)) {
        for (const item of education) {
          if (item.selected && item.program?.trim() && item.institution?.trim()) {
            const level = ['SCHOOL', 'DIPLOMA', 'UG', 'PG', 'OTHER'].includes(item.level)
              ? item.level
              : 'UG';
            const startYear = parseInt(item.startYear) || new Date().getFullYear();
            const endYear = item.isCurrent ? null : (parseInt(item.endYear) || startYear + 3);

            // Avoid duplicate insert
            const existing = await tx.education.findFirst({
              where: {
                studentId: studentProfile.id,
                program: item.program.trim(),
                institution: item.institution.trim()
              }
            });

            if (!existing) {
              await tx.education.create({
                data: {
                  studentId: studentProfile.id,
                  level,
                  program: item.program.trim(),
                  institution: item.institution.trim(),
                  fieldOfStudy: item.fieldOfStudy?.trim() || 'General Studies',
                  startYear,
                  endYear,
                  isCurrent: Boolean(item.isCurrent),
                  grade: item.grade?.trim() || null
                }
              });
              summaryResults.educationAdded++;
            }
          }
        }
      }

      // 3. Projects
      if (Array.isArray(projects)) {
        for (const item of projects) {
          if (item.selected && item.title?.trim()) {
            const existing = await tx.project.findFirst({
              where: {
                studentId: studentProfile.id,
                title: item.title.trim()
              }
            });

            if (!existing) {
              const project = await tx.project.create({
                data: {
                  studentId: studentProfile.id,
                  title: item.title.trim(),
                  description: item.description?.trim() || `${item.title.trim()} software project.`,
                  role: item.role?.trim() || null,
                  githubUrl: item.githubUrl?.trim() || null,
                  demoLink: item.demoLink?.trim() || null,
                  progressStatus: 'COMPLETED'
                }
              });

              // Link project technologies
              if (Array.isArray(item.technologies)) {
                for (const techName of item.technologies) {
                  const cleanTech = typeof techName === 'string' ? techName.trim() : techName?.name?.trim();
                  if (!cleanTech) continue;

                  let skillRecord = await tx.skill.findUnique({
                    where: { name: cleanTech }
                  });

                  if (!skillRecord) {
                    skillRecord = await tx.skill.create({
                      data: { name: cleanTech, category: 'TECHNICAL' }
                    });
                  }

                  await tx.projectTechnology.create({
                    data: {
                      projectId: project.id,
                      skillId: skillRecord.id
                    }
                  });
                }
              }

              summaryResults.projectsAdded++;
            }
          }
        }
      }

      // 4. Experience / Internships
      if (Array.isArray(experience)) {
        for (const item of experience) {
          if (item.selected && item.organization?.trim() && item.role?.trim()) {
            const existing = await tx.experience.findFirst({
              where: {
                studentId: studentProfile.id,
                organization: item.organization.trim(),
                role: item.role.trim()
              }
            });

            if (!existing) {
              let parsedStartDate = new Date(item.startDate);
              if (isNaN(parsedStartDate.getTime())) parsedStartDate = new Date();

              let parsedEndDate = item.endDate ? new Date(item.endDate) : null;
              if (parsedEndDate && isNaN(parsedEndDate.getTime())) parsedEndDate = null;

              await tx.experience.create({
                data: {
                  studentId: studentProfile.id,
                  organization: item.organization.trim(),
                  role: item.role.trim(),
                  location: item.location?.trim() || null,
                  startDate: parsedStartDate,
                  endDate: item.isCurrent ? null : parsedEndDate,
                  isCurrent: Boolean(item.isCurrent),
                  description: item.description?.trim() || `Role at ${item.organization.trim()}`
                }
              });
              summaryResults.experienceAdded++;
            }
          }
        }
      }

      // 5. Certifications
      if (Array.isArray(certifications)) {
        for (const item of certifications) {
          if (item.selected && item.name?.trim() && item.issuer?.trim()) {
            const existing = await tx.certification.findFirst({
              where: {
                studentId: studentProfile.id,
                name: item.name.trim()
              }
            });

            if (!existing) {
              let parsedIssueDate = new Date(item.issueDate);
              if (isNaN(parsedIssueDate.getTime())) parsedIssueDate = new Date();

              await tx.certification.create({
                data: {
                  studentId: studentProfile.id,
                  name: item.name.trim(),
                  issuer: item.issuer.trim(),
                  issueDate: parsedIssueDate,
                  credentialUrl: item.credentialUrl?.trim() || null,
                  verificationStatus: 'PENDING'
                }
              });
              summaryResults.certificationsAdded++;
            }
          }
        }
      }

      // 6. Achievements
      if (Array.isArray(achievements)) {
        for (const item of achievements) {
          if (item.selected && item.title?.trim()) {
            const existing = await tx.achievement.findFirst({
              where: {
                studentId: studentProfile.id,
                title: item.title.trim()
              }
            });

            if (!existing) {
              let parsedDate = new Date(item.date);
              if (isNaN(parsedDate.getTime())) parsedDate = new Date();

              await tx.achievement.create({
                data: {
                  studentId: studentProfile.id,
                  title: item.title.trim(),
                  description: item.description?.trim() || item.title.trim(),
                  date: parsedDate,
                  proofUrl: item.proofUrl?.trim() || null,
                  verificationStatus: 'PENDING'
                }
              });
              summaryResults.achievementsAdded++;
            }
          }
        }
      }

      // 7. Skills & Interests (upsert into Skill catalog, add StudentSkill if not already linked)
      if (Array.isArray(skills)) {
        for (const item of skills) {
          if (item.selected && item.name?.trim()) {
            const cleanName = item.name.trim();
            const category = ['TECHNICAL', 'SOFT', 'INTEREST'].includes(item.category)
              ? item.category
              : 'TECHNICAL';

            let skillRecord = await tx.skill.findUnique({
              where: { name: cleanName }
            });

            if (!skillRecord) {
              skillRecord = await tx.skill.create({
                data: { name: cleanName, category }
              });
            }

            const existingStudentSkill = await tx.studentSkill.findUnique({
              where: {
                studentId_skillId: {
                  studentId: studentProfile.id,
                  skillId: skillRecord.id
                }
              }
            });

            if (!existingStudentSkill) {
              await tx.studentSkill.create({
                data: {
                  studentId: studentProfile.id,
                  skillId: skillRecord.id,
                  proficiency: item.proficiency || 'Intermediate'
                }
              });
              summaryResults.skillsAdded++;
            }
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Extracted data successfully imported to portfolio.',
      summary: summaryResults
    });
  } catch (error) {
    next(error);
  }
}
