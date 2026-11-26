import prisma from '../prisma/prismaClient.js';

// GET /api/public/students/:username
export async function getPublicPortfolio(req, res, next) {
  try {
    const { username } = req.params;

    const profile = await prisma.studentProfile.findUnique({
      where: { slug: username.toLowerCase().trim() },
      include: {
        department: true,
        batch: true,
        user: {
          select: { email: true }
        },
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
          where: { verificationStatus: 'VERIFIED' }, // Public only sees verified or allowed items
          orderBy: [{ issueDate: 'desc' }]
        },
        experience: {
          orderBy: [{ startDate: 'desc' }]
        },
        achievements: {
          where: { verificationStatus: 'VERIFIED' },
          orderBy: [{ date: 'desc' }]
        },
        extracurriculars: {
          orderBy: [{ createdAt: 'desc' }]
        }
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student portfolio not found.'
      });
    }

    // Acceptance Criteria FR-6.6: Only approved students with ACTIVE or ALUMNI/GRADUATED status and published are publicly visible
    const isAllowedStatus = ['ACTIVE', 'GRADUATED', 'ALUMNI'].includes(profile.status);
    if (!profile.isApproved || !profile.isPublished || !isAllowedStatus) {
      return res.status(404).json({
        success: false,
        message: 'This portfolio is not publicly available or has been suspended.'
      });
    }

    // Increment view count asynchronously
    prisma.studentProfile.update({
      where: { id: profile.id },
      data: { profileViews: { increment: 1 } }
    }).catch(err => console.error('Failed to increment views:', err));

    // Privacy Protection (FR-4.6, FR-6.5): NEVER expose dateOfBirth or sensitive user info
    const safeProfile = {
      id: profile.id,
      fullName: profile.fullName,
      slug: profile.slug,
      bio: profile.bio,
      photoUrl: profile.photoUrl,
      status: profile.status,
      department: profile.department ? {
        id: profile.department.id,
        name: profile.department.name,
        code: profile.department.code
      } : null,
      batch: profile.batch ? {
        id: profile.batch.id,
        name: profile.batch.name,
        graduationYear: profile.batch.graduationYear
      } : null,
      updatedAt: profile.updatedAt
    };

    // Apply visibility settings (FR-4.7, FR-6.5)
    const visibility = profile.visibilitySettings || {};

    const publicData = {
      ...safeProfile,
      links: (visibility.showLinks !== false) ? profile.links : [],
      skills: (visibility.showSkills !== false) ? profile.skills : [],
      education: (visibility.showEducation !== false) ? profile.education : [],
      projects: (visibility.showProjects !== false) ? profile.projects : [],
      certifications: (visibility.showCertifications !== false) ? profile.certifications : [],
      experience: (visibility.showExperience !== false) ? profile.experience : [],
      achievements: (visibility.showAchievements !== false) ? profile.achievements : [],
      extracurriculars: (visibility.showExtracurriculars !== false) ? profile.extracurriculars : []
    };

    return res.json({
      success: true,
      student: publicData
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/public/search
export async function searchPortfolios(req, res, next) {
  try {
    const {
      q,
      departmentId,
      batchId,
      skill,
      status, // 'ACTIVE' or 'ALUMNI'
      sort = 'relevance', // 'relevance', 'recent', 'name'
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Filter only approved, published, non-suspended profiles
    const where = {
      isApproved: true,
      isPublished: true,
      status: { in: ['ACTIVE', 'GRADUATED', 'ALUMNI'] }
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (batchId) {
      where.batchId = batchId;
    }

    if (status) {
      if (status.toUpperCase() === 'ALUMNI' || status.toUpperCase() === 'GRADUATED') {
        where.status = { in: ['ALUMNI', 'GRADUATED'] };
      } else if (status.toUpperCase() === 'ACTIVE') {
        where.status = 'ACTIVE';
      }
    }

    // Skill filter
    if (skill) {
      where.skills = {
        some: {
          skill: {
            name: {
              equals: skill.trim(),
              mode: 'insensitive'
            }
          }
        }
      };
    }

    // Keyword search across fullName, bio, skills, and project titles
    if (q && q.trim()) {
      const keyword = q.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { fullName: { contains: keyword, mode: 'insensitive' } },
            { bio: { contains: keyword, mode: 'insensitive' } },
            {
              skills: {
                some: {
                  skill: {
                    name: { contains: keyword, mode: 'insensitive' }
                  }
                }
              }
            },
            {
              projects: {
                some: {
                  title: { contains: keyword, mode: 'insensitive' }
                }
              }
            }
          ]
        }
      ];
    }

    // Sorting
    let orderBy = [{ updatedAt: 'desc' }];
    if (sort === 'name') {
      orderBy = [{ fullName: 'asc' }];
    } else if (sort === 'views') {
      orderBy = [{ profileViews: 'desc' }];
    } else if (sort === 'recent') {
      orderBy = [{ updatedAt: 'desc' }];
    }

    const [total, students] = await Promise.all([
      prisma.studentProfile.count({ where }),
      prisma.studentProfile.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          fullName: true,
          slug: true,
          photoUrl: true,
          bio: true,
          status: true,
          updatedAt: true,
          department: {
            select: { id: true, name: true, code: true }
          },
          batch: {
            select: { id: true, name: true, graduationYear: true }
          },
          skills: {
            take: 6,
            include: {
              skill: { select: { id: true, name: true, category: true } }
            }
          },
          _count: {
            select: {
              projects: true,
              certifications: true
            }
          }
        }
      })
    ]);

    return res.json({
      success: true,
      data: students,
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

// GET /api/public/featured-projects
export async function getFeaturedProjects(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        isFeatured: true,
        student: {
          isApproved: true,
          isPublished: true,
          status: { in: ['ACTIVE', 'GRADUATED', 'ALUMNI'] }
        }
      },
      take: 6,
      orderBy: { updatedAt: 'desc' },
      include: {
        technologies: {
          include: { skill: true }
        },
        student: {
          select: {
            fullName: true,
            slug: true,
            photoUrl: true,
            department: { select: { name: true, code: true } }
          }
        }
      }
    });

    return res.json({
      success: true,
      projects
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/public/featured-students
export async function getFeaturedStudents(req, res, next) {
  try {
    const students = await prisma.studentProfile.findMany({
      where: {
        isApproved: true,
        isPublished: true,
        status: { in: ['ACTIVE', 'ALUMNI', 'GRADUATED'] }
      },
      take: 6,
      orderBy: [{ profileViews: 'desc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        fullName: true,
        slug: true,
        photoUrl: true,
        bio: true,
        status: true,
        department: { select: { name: true, code: true } },
        batch: { select: { name: true, graduationYear: true } },
        skills: {
          take: 4,
          include: { skill: { select: { name: true, category: true } } }
        },
        _count: {
          select: { projects: true, certifications: true }
        }
      }
    });

    return res.json({
      success: true,
      students
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/public/meta
export async function getPublicMeta(req, res, next) {
  try {
    const [departments, batches, skills] = await Promise.all([
      prisma.department.findMany({
        where: { isArchived: false },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, code: true }
      }),
      prisma.batch.findMany({
        where: { isArchived: false },
        orderBy: { graduationYear: 'desc' },
        select: { id: true, name: true, graduationYear: true, departmentId: true }
      }),
      prisma.skill.findMany({
        orderBy: { name: 'asc' },
        take: 100,
        select: { id: true, name: true, category: true }
      })
    ]);

    return res.json({
      success: true,
      departments,
      batches,
      skills
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/public/departments
export async function getDepartmentsList(req, res, next) {
  try {
    const departments = await prisma.department.findMany({
      where: { isArchived: false },
      include: {
        batches: {
          where: { isArchived: false },
          orderBy: { graduationYear: 'desc' }
        },
        _count: {
          select: {
            students: {
              where: {
                isApproved: true,
                isPublished: true,
                status: { in: ['ACTIVE', 'GRADUATED', 'ALUMNI'] }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.json({
      success: true,
      departments
    });
  } catch (error) {
    next(error);
  }
}
