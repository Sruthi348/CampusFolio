import bcrypt from 'bcryptjs';
import prisma from './prismaClient.js';
import { generateUniqueSlug } from '../utils/slugGenerator.js';

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // 1. Clean existing records safely
  await prisma.verificationRecord.deleteMany();
  await prisma.documentSubmission.deleteMany();
  await prisma.staffStudentAssignment.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.projectTechnology.deleteMany();
  await prisma.project.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.studentLink.deleteMany();
  await prisma.education.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.extracurricular.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.department.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // 2. Create Departments
  const deptMCA = await prisma.department.create({
    data: {
      name: 'Department of Computer Applications',
      code: 'MCA',
      description: 'Master of Computer Applications focusing on fullstack engineering, cloud architecture, and modern software design.'
    }
  });

  const deptCSE = await prisma.department.create({
    data: {
      name: 'Department of Computer Science & Engineering',
      code: 'CSE',
      description: 'Undergraduate and postgraduate programs in computer science, algorithms, operating systems, and intelligent systems.'
    }
  });

  const deptIT = await prisma.department.create({
    data: {
      name: 'Department of Information Technology',
      code: 'IT',
      description: 'Focusing on distributed systems, information security, enterprise networking, and modern software systems.'
    }
  });

  const deptECE = await prisma.department.create({
    data: {
      name: 'Department of Electronics & Communication',
      code: 'ECE',
      description: 'Hardware-software codesign, embedded systems, IoT architecture, and digital signal processing.'
    }
  });

  console.log('✅ Departments created: MCA, CSE, IT, ECE');

  // 3. Create Batches
  const batchMCA2026 = await prisma.batch.create({
    data: { name: '2024 - 2026', graduationYear: 2026, departmentId: deptMCA.id }
  });
  const batchMCA2025 = await prisma.batch.create({
    data: { name: '2023 - 2025', graduationYear: 2025, departmentId: deptMCA.id }
  });
  const batchCSE2026 = await prisma.batch.create({
    data: { name: '2022 - 2026', graduationYear: 2026, departmentId: deptCSE.id }
  });
  const batchIT2024 = await prisma.batch.create({
    data: { name: '2020 - 2024', graduationYear: 2024, departmentId: deptIT.id }
  });
  const batchECE2026 = await prisma.batch.create({
    data: { name: '2022 - 2026', graduationYear: 2026, departmentId: deptECE.id }
  });

  console.log('✅ Batches created.');

  // 4. Create Skills & Interests Shared Catalogue
  const technicalSkillsList = [
    'React', 'Node.js', 'Express.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS',
    'TypeScript', 'Python', 'Java', 'Docker', 'Next.js', 'GraphQL',
    'Redis', 'AWS', 'Git', 'REST API', 'Kubernetes', 'FastAPI', 'C++'
  ];

  const softSkillsList = [
    'Leadership', 'Public Speaking', 'Agile Collaboration', 'Problem Solving',
    'Technical Writing', 'Team Mentorship'
  ];

  const interestsList = [
    'Open Source', 'Machine Learning', 'Cloud Architecture', 'UI/UX Design',
    'System Design', 'Cybersecurity', 'Web3'
  ];

  const skillRecords = {};

  for (const name of technicalSkillsList) {
    const s = await prisma.skill.create({ data: { name, category: 'TECHNICAL' } });
    skillRecords[name] = s;
  }
  for (const name of softSkillsList) {
    const s = await prisma.skill.create({ data: { name, category: 'SOFT' } });
    skillRecords[name] = s;
  }
  for (const name of interestsList) {
    const s = await prisma.skill.create({ data: { name, category: 'INTEREST' } });
    skillRecords[name] = s;
  }

  console.log('✅ Skills and interests catalog seeded.');

  // 5. Create Administrator Account
  const adminPasswordHash = await bcrypt.hash('AdminPassword@123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isInitialPassword: false
    }
  });

  console.log('✅ Admin user created: admin@college.edu / AdminPassword@123');

  // 5b. Create Staff Accounts (Class In-charge / Tutor)
  const staffPasswordHash = await bcrypt.hash('StaffPassword@123', 10);

  const userStaffMCA = await prisma.user.create({
    data: {
      email: 'staff.mca@college.edu',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
      isInitialPassword: false
    }
  });

  const staffMCA = await prisma.staffProfile.create({
    data: {
      userId: userStaffMCA.id,
      staffId: 'STF-MCA-001',
      fullName: 'Prof. Rajesh Kumar',
      phone: '+91 98765 43210',
      designation: 'Class In-charge / Tutor',
      departmentId: deptMCA.id,
      batchId: batchMCA2026.id
    }
  });

  const userStaffCSE = await prisma.user.create({
    data: {
      email: 'staff.cse@college.edu',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
      isInitialPassword: false
    }
  });

  const staffCSE = await prisma.staffProfile.create({
    data: {
      userId: userStaffCSE.id,
      staffId: 'STF-CSE-002',
      fullName: 'Dr. Meenakshi Sundaram',
      phone: '+91 98765 87654',
      designation: 'Assistant Professor & Tutor',
      departmentId: deptCSE.id,
      batchId: batchCSE2026.id
    }
  });

  console.log('✅ Staff users created: staff.mca@college.edu / staff.cse@college.edu (StaffPassword@123)');

  // Helper password for students
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);

  // 6. Student 1: Keerthana A R (MCA, Active, Featured Projects, Verified Certs)
  const userKeerthana = await prisma.user.create({
    data: {
      email: 'keerthana.ar@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isInitialPassword: false
    }
  });

  const profileKeerthana = await prisma.studentProfile.create({
    data: {
      userId: userKeerthana.id,
      fullName: 'Keerthana A R',
      slug: 'keerthana-ar',
      rollNumber: 'MCA202401',
      departmentId: deptMCA.id,
      batchId: batchMCA2026.id,
      bio: 'Fullstack Engineer passionate about cloud-native systems, scalable PostgreSQL data layers, and clean UI.',
      dateOfBirth: new Date('2002-05-14'), // Private!
      status: 'ACTIVE',
      isApproved: true,
      isPublished: true,
      profileViews: 142,
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

  // Links for Keerthana
  await prisma.studentLink.createMany({
    data: [
      { studentId: profileKeerthana.id, platform: 'GitHub', url: 'https://github.com/keerthana-ar', label: 'github.com/keerthana-ar' },
      { studentId: profileKeerthana.id, platform: 'LinkedIn', url: 'https://linkedin.com/in/keerthana-ar', label: 'linkedin.com/in/keerthana-ar' },
      { studentId: profileKeerthana.id, platform: 'Portfolio', url: 'https://keerthana.dev', label: 'keerthana.dev' }
    ]
  });

  // Skills for Keerthana
  const keerthanaSkills = ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'Leadership', 'Cloud Architecture'];
  for (const sName of keerthanaSkills) {
    if (skillRecords[sName]) {
      await prisma.studentSkill.create({
        data: {
          studentId: profileKeerthana.id,
          skillId: skillRecords[sName].id,
          proficiency: 'Advanced'
        }
      });
    }
  }

  // Education for Keerthana
  await prisma.education.createMany({
    data: [
      {
        studentId: profileKeerthana.id,
        level: 'PG',
        program: 'Master of Computer Applications (MCA)',
        institution: 'University College of Engineering',
        fieldOfStudy: 'Computer Applications',
        startYear: 2024,
        endYear: 2026,
        isCurrent: true,
        grade: '9.35 CGPA'
      },
      {
        studentId: profileKeerthana.id,
        level: 'UG',
        program: 'Bachelor of Computer Applications (BCA)',
        institution: 'National Science & Technology Institute',
        fieldOfStudy: 'Computer Science',
        startYear: 2021,
        endYear: 2024,
        isCurrent: false,
        grade: '9.1 CGPA'
      }
    ]
  });

  // Projects for Keerthana
  const proj1 = await prisma.project.create({
    data: {
      studentId: profileKeerthana.id,
      title: 'EduSphere - Decentralized Credential Verifier',
      summary: 'Tamper-proof academic credential verification platform with instant QR verification and cryptographic signatures.',
      description: 'EduSphere enables universities to issue tamper-proof digital certificates that recruiters can verify instantly without contacting registrar offices. Built with high-performance Node.js REST services and PostgreSQL indexing.',
      category: 'Web Application',
      role: 'Lead Architect & Fullstack Developer',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-12-15'),
      isOngoing: false,
      githubUrl: 'https://github.com/keerthana-ar/edusphere',
      demoLink: 'https://edusphere.dev',
      isFeatured: true, // Featured on home page!
      progressStatus: 'COMPLETED'
    }
  });

  const proj2 = await prisma.project.create({
    data: {
      studentId: profileKeerthana.id,
      title: 'DevPulse - Developer Productivity & Commit Analytics',
      summary: 'Real-time engineering telemetry platform aggregating GitHub PR velocity, code review turnarounds, and CI build health.',
      description: 'Aggregates multi-repository engineering telemetry into actionable team health dashboards with automated Slack notifications and sprint burndown projections.',
      category: 'Cloud DevOps',
      role: 'Fullstack Engineer',
      startDate: new Date('2025-01-10'),
      isOngoing: true,
      githubUrl: 'https://github.com/keerthana-ar/devpulse',
      isFeatured: true,
      progressStatus: 'IN_PROGRESS'
    }
  });

  // Link technologies
  for (const tech of ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS']) {
    if (skillRecords[tech]) {
      await prisma.projectTechnology.create({
        data: { projectId: proj1.id, skillId: skillRecords[tech].id }
      });
    }
  }
  for (const tech of ['React', 'TypeScript', 'Docker']) {
    if (skillRecords[tech]) {
      await prisma.projectTechnology.create({
        data: { projectId: proj2.id, skillId: skillRecords[tech].id }
      });
    }
  }

  // Certifications for Keerthana (Verified)
  await prisma.certification.createMany({
    data: [
      {
        studentId: profileKeerthana.id,
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2024-06-20'),
        credentialUrl: 'https://aws.amazon.com/verification/AWS-SAA-83921',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date('2024-07-01'),
        verifiedBy: 'admin@college.edu'
      },
      {
        studentId: profileKeerthana.id,
        name: 'PostgreSQL 16 Professional Database Administrator',
        issuer: 'Linux Foundation / Postgres Institute',
        issueDate: new Date('2024-11-10'),
        credentialUrl: 'https://credentials.postgres.org/cert/PG-16-9921',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date('2024-11-15'),
        verifiedBy: 'admin@college.edu'
      }
    ]
  });

  // Experience for Keerthana
  await prisma.experience.create({
    data: {
      studentId: profileKeerthana.id,
      organization: 'CloudScale Labs',
      role: 'Software Development Intern',
      location: 'Bengaluru, India (Hybrid)',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-08-01'),
      isCurrent: false,
      description: 'Architected REST endpoints with Express and PostgreSQL, reducing API latency by 34%. Implemented Redis query caching and automated Jest integration test suites.'
    }
  });

  // Achievements for Keerthana (Verified)
  await prisma.achievement.create({
    data: {
      studentId: profileKeerthana.id,
      title: '1st Place Winner - National Smart India Hackathon 2025',
      description: 'Led a 6-member engineering squad to develop an offline-first rural healthcare triage portal under the Ministry of Health problem statement.',
      date: new Date('2025-01-25'),
      proofUrl: 'https://sih.gov.in/winners-2025-keerthana',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date('2025-02-01'),
      verifiedBy: 'admin@college.edu'
    }
  });

  // Extracurriculars for Keerthana
  await prisma.extracurricular.create({
    data: {
      studentId: profileKeerthana.id,
      activityName: 'University Open Source Club',
      role: 'Vice President & Workshop Lead',
      organization: 'Department of Computer Applications',
      duration: 'August 2024 - Present',
      description: 'Conducted hands-on git workshops and fullstack bootcamps for over 180 junior students.'
    }
  });

  console.log('✅ Student 1 created: Keerthana A R (/student/keerthana-ar)');

  // 7. Student 2: Rahul Sharma (CSE, Active, ML Specialist)
  const userRahul = await prisma.user.create({
    data: {
      email: 'rahul.sharma@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isInitialPassword: false
    }
  });

  const profileRahul = await prisma.studentProfile.create({
    data: {
      userId: userRahul.id,
      fullName: 'Rahul Sharma',
      slug: 'rahul-sharma',
      rollNumber: 'CSE202445',
      departmentId: deptCSE.id,
      batchId: batchCSE2026.id,
      bio: 'Machine learning researcher and systems engineer focusing on vector search, neural embeddings, and high-throughput APIs.',
      dateOfBirth: new Date('2003-09-18'),
      status: 'ACTIVE',
      isApproved: true,
      isPublished: true,
      profileViews: 98,
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

  await prisma.studentLink.createMany({
    data: [
      { studentId: profileRahul.id, platform: 'GitHub', url: 'https://github.com/rahulsharma-dev', label: 'github.com/rahulsharma-dev' },
      { studentId: profileRahul.id, platform: 'LinkedIn', url: 'https://linkedin.com/in/rahulsharma-ml', label: 'linkedin.com/in/rahulsharma-ml' }
    ]
  });

  for (const sName of ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Machine Learning', 'Problem Solving']) {
    if (skillRecords[sName]) {
      await prisma.studentSkill.create({
        data: {
          studentId: profileRahul.id,
          skillId: skillRecords[sName].id,
          proficiency: 'Advanced'
        }
      });
    }
  }

  await prisma.education.create({
    data: {
      studentId: profileRahul.id,
      level: 'UG',
      program: 'B.Tech in Computer Science & Engineering',
      institution: 'University College of Engineering',
      fieldOfStudy: 'Computer Science',
      startYear: 2022,
      endYear: 2026,
      isCurrent: true,
      grade: '8.92 CGPA'
    }
  });

  const projRahul = await prisma.project.create({
    data: {
      studentId: profileRahul.id,
      title: 'NeuralSearch - Vector Similarity Retrieval Engine',
      summary: 'Sub-millisecond approximate nearest neighbor semantic search engine built for multilingual technical documentation.',
      description: 'Indexes over 500,000 documents with dense vector embeddings. Built with HNSW indexing, FastAPI async endpoints, and PostgreSQL pgvector compatibility.',
      category: 'AI / Machine Learning',
      role: 'Core Systems Engineer',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-20'),
      isOngoing: false,
      githubUrl: 'https://github.com/rahulsharma-dev/neuralsearch',
      demoLink: 'https://neuralsearch.dev',
      isFeatured: true,
      progressStatus: 'COMPLETED'
    }
  });

  for (const tech of ['Python', 'Docker', 'PostgreSQL']) {
    if (skillRecords[tech]) {
      await prisma.projectTechnology.create({
        data: { projectId: projRahul.id, skillId: skillRecords[tech].id }
      });
    }
  }

  await prisma.certification.create({
    data: {
      studentId: profileRahul.id,
      name: 'DeepLearning.AI TensorFlow Developer Professional',
      issuer: 'DeepLearning.AI / Coursera',
      issueDate: new Date('2024-03-15'),
      credentialUrl: 'https://coursera.org/verify/TF-88412-DEV',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date('2024-04-01'),
      verifiedBy: 'admin@college.edu'
    }
  });

  await prisma.experience.create({
    data: {
      studentId: profileRahul.id,
      organization: 'DataNova Analytics',
      role: 'Backend Engineering Intern',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-09-01'),
      isCurrent: false,
      description: 'Engineered asynchronous data pipelines ingesting 10M records daily using Python and PostgreSQL.'
    }
  });

  await prisma.achievement.create({
    data: {
      studentId: profileRahul.id,
      title: 'Published Paper at IEEE International Conference',
      description: 'Co-authored "Efficient Graph Traversal for Billion-Scale Nearest Neighbor Searches" accepted at IEEE BigData 2024.',
      date: new Date('2024-11-20'),
      proofUrl: 'https://ieeexplore.ieee.org/document/998124',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date('2024-12-01'),
      verifiedBy: 'admin@college.edu'
    }
  });

  console.log('✅ Student 2 created: Rahul Sharma (/student/rahul-sharma)');

  // 8. Student 3: Ananya Patel (IT, Alumni showcase with Alumni Badge)
  const userAnanya = await prisma.user.create({
    data: {
      email: 'ananya.patel@alumni.college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isInitialPassword: false
    }
  });

  const profileAnanya = await prisma.studentProfile.create({
    data: {
      userId: userAnanya.id,
      fullName: 'Ananya Patel',
      slug: 'ananya-patel',
      rollNumber: 'IT202008',
      departmentId: deptIT.id,
      batchId: batchIT2024.id,
      bio: 'Software Engineer at FinTech Global. MCA/IT 2024 Alumni. Passionate about distributed payment rails and resilience engineering.',
      dateOfBirth: new Date('2001-03-22'),
      status: 'ALUMNI', // Alumni status!
      isApproved: true,
      isPublished: true,
      profileViews: 215,
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

  await prisma.studentLink.createMany({
    data: [
      { studentId: profileAnanya.id, platform: 'GitHub', url: 'https://github.com/ananyapatel-tech', label: 'github.com/ananyapatel-tech' },
      { studentId: profileAnanya.id, platform: 'LinkedIn', url: 'https://linkedin.com/in/ananyapatel-fintech', label: 'linkedin.com/in/ananyapatel' }
    ]
  });

  for (const sName of ['Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'TypeScript', 'Agile Collaboration']) {
    if (skillRecords[sName]) {
      await prisma.studentSkill.create({
        data: {
          studentId: profileAnanya.id,
          skillId: skillRecords[sName].id,
          proficiency: 'Expert'
        }
      });
    }
  }

  await prisma.education.create({
    data: {
      studentId: profileAnanya.id,
      level: 'UG',
      program: 'B.Tech in Information Technology',
      institution: 'University College of Engineering',
      fieldOfStudy: 'Information Technology',
      startYear: 2020,
      endYear: 2024,
      isCurrent: false,
      grade: '9.42 CGPA'
    }
  });

  const projAnanya = await prisma.project.create({
    data: {
      studentId: profileAnanya.id,
      title: 'CryptoPay - High-Throughput Settlement Engine',
      summary: 'ISO-20022 compliant financial settlement simulation engine processing 10,000 TPS with atomic two-phase commit verification.',
      description: 'Distributed payments simulation platform demonstrating idempotency, deadlock detection, and fault-tolerant event sourcing.',
      category: 'FinTech',
      role: 'Lead Systems Architect',
      startDate: new Date('2023-10-01'),
      endDate: new Date('2024-04-15'),
      isOngoing: false,
      githubUrl: 'https://github.com/ananyapatel-tech/cryptopay',
      isFeatured: true,
      progressStatus: 'COMPLETED'
    }
  });

  for (const tech of ['Node.js', 'PostgreSQL', 'Docker', 'TypeScript']) {
    if (skillRecords[tech]) {
      await prisma.projectTechnology.create({
        data: { projectId: projAnanya.id, skillId: skillRecords[tech].id }
      });
    }
  }

  await prisma.certification.create({
    data: {
      studentId: profileAnanya.id,
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation (CNCF)',
      issueDate: new Date('2024-02-10'),
      credentialUrl: 'https://cncf.io/verify/CKA-99214',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date('2024-02-20'),
      verifiedBy: 'admin@college.edu'
    }
  });

  await prisma.experience.create({
    data: {
      studentId: profileAnanya.id,
      organization: 'FinTech Global Systems',
      role: 'Software Engineer',
      location: 'Hyderabad, India',
      startDate: new Date('2024-07-01'),
      isCurrent: true,
      description: 'Developing high-availability payment gateway connectors and transaction reconciliation pipelines in microservices architecture.'
    }
  });

  await prisma.achievement.create({
    data: {
      studentId: profileAnanya.id,
      title: 'Google Summer of Code 2023 Contributor',
      description: 'Selected as GSoC 2023 contributor for the PostgreSQL Foundation, optimizing client connection pooling utilities.',
      date: new Date('2023-09-01'),
      proofUrl: 'https://summerofcode.withgoogle.com/archive/2023/projects/ananya',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date('2023-10-01'),
      verifiedBy: 'admin@college.edu'
    }
  });

  console.log('✅ Student 3 created: Ananya Patel (Alumni) (/student/ananya-patel)');

  // 9. Student 4: Pooja Verma (Active student with PENDING items for Moderation Queue)
  const userPooja = await prisma.user.create({
    data: {
      email: 'pooja.verma@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isInitialPassword: false
    }
  });

  const profilePooja = await prisma.studentProfile.create({
    data: {
      userId: userPooja.id,
      fullName: 'Pooja Verma',
      slug: 'pooja-verma',
      rollNumber: 'MCA202418',
      departmentId: deptMCA.id,
      batchId: batchMCA2026.id,
      bio: 'Frontend enthusiast creating accessible, responsive UI experiences with React and Tailwind CSS.',
      dateOfBirth: new Date('2003-01-12'),
      status: 'ACTIVE',
      isApproved: true,
      isPublished: true,
      profileViews: 45
    }
  });

  await prisma.studentLink.create({
    data: { studentId: profilePooja.id, platform: 'GitHub', url: 'https://github.com/poojaverma-dev', label: 'github.com/poojaverma-dev' }
  });

  for (const sName of ['React', 'Tailwind CSS', 'TypeScript', 'UI/UX Design']) {
    if (skillRecords[sName]) {
      await prisma.studentSkill.create({
        data: { studentId: profilePooja.id, skillId: skillRecords[sName].id, proficiency: 'Intermediate' }
      });
    }
  }

  await prisma.education.create({
    data: {
      studentId: profilePooja.id,
      level: 'PG',
      program: 'Master of Computer Applications',
      institution: 'University College of Engineering',
      fieldOfStudy: 'Computer Applications',
      startYear: 2024,
      endYear: 2026,
      isCurrent: true,
      grade: '8.8 CGPA'
    }
  });

  await prisma.project.create({
    data: {
      studentId: profilePooja.id,
      title: 'CampusHub - Interactive Student Navigation Guide',
      summary: 'Interactive campus map and department directory with accessible wayfinding for university visitors.',
      description: 'Single-page responsive application with accessible high-contrast navigation guides and offline floor directories.',
      category: 'Frontend Web App',
      role: 'Lead UI Developer',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-10'),
      isOngoing: false,
      githubUrl: 'https://github.com/poojaverma-dev/campushub',
      progressStatus: 'COMPLETED'
    }
  });

  // Pending Certification for Admin Moderation Queue
  await prisma.certification.create({
    data: {
      studentId: profilePooja.id,
      name: 'Meta Frontend Developer Professional Certificate',
      issuer: 'Meta / Coursera',
      issueDate: new Date('2025-01-10'),
      credentialUrl: 'https://coursera.org/verify/professional-cert/META-POOJA-991',
      verificationStatus: 'PENDING' // Pending admin verification
    }
  });

  // Pending Achievement for Admin Moderation Queue
  await prisma.achievement.create({
    data: {
      studentId: profilePooja.id,
      title: 'Runner Up - State Level Frontend Design Hackathon',
      description: 'Designed an accessibility-first healthcare booking portal adhering strictly to WCAG 2.1 AAA guidelines.',
      date: new Date('2025-02-12'),
      proofUrl: 'https://statehack2025.org/winners/pooja-verma',
      verificationStatus: 'PENDING' // Pending admin verification
    }
  });

  console.log('✅ Student 4 created: Pooja Verma (with pending items for moderation queue)');

  // 10. Student 5: Aditya Nair (SUSPENDED account - to verify access control & filters)
  const userAditya = await prisma.user.create({
    data: {
      email: 'aditya.nair@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isInitialPassword: false
    }
  });

  await prisma.studentProfile.create({
    data: {
      userId: userAditya.id,
      fullName: 'Aditya Nair',
      slug: 'aditya-nair',
      rollNumber: 'ECE202419',
      departmentId: deptECE.id,
      batchId: batchECE2026.id,
      bio: 'Embedded software engineer experimenting with microcontrollers and RTOS.',
      dateOfBirth: new Date('2002-11-04'),
      status: 'SUSPENDED', // SUSPENDED!
      isApproved: true,
      isPublished: true,
      profileViews: 12
    }
  });

  console.log('✅ Student 5 created: Aditya Nair (SUSPENDED status)');

  // 12. Staff-Student Assignments
  await prisma.staffStudentAssignment.createMany({
    data: [
      { staffProfileId: staffMCA.id, studentId: profileKeerthana.id },
      { staffProfileId: staffMCA.id, studentId: profilePooja.id },
      { staffProfileId: staffCSE.id, studentId: profileRahul.id }
    ]
  });

  // 13. Document Submissions & Verification Records
  const doc1 = await prisma.documentSubmission.create({
    data: {
      studentId: profileKeerthana.id,
      title: 'AWS Certified Solutions Architect – Associate Certificate',
      category: 'CERTIFICATE',
      fileUrl: '/uploads/documents/aws-solutions-architect.pdf',
      fileName: 'aws-solutions-architect.pdf',
      fileSize: 1048576,
      description: 'Official AWS certification proof with validation ID AWS-SAA-83921.',
      credentialUrl: 'https://aws.amazon.com/verification/AWS-SAA-83921',
      issueDate: new Date('2024-06-20'),
      status: 'VERIFIED',
      version: 1
    }
  });

  await prisma.verificationRecord.create({
    data: {
      documentSubmissionId: doc1.id,
      studentId: profileKeerthana.id,
      reviewerStaffId: staffMCA.id,
      reviewerName: 'Prof. Rajesh Kumar',
      reviewerEmail: 'staff.mca@college.edu',
      reviewerRole: 'Class In-charge / Tutor',
      decision: 'VERIFIED',
      comments: 'Certificate credentials cross-checked and verified on AWS verification portal.'
    }
  });

  const doc2 = await prisma.documentSubmission.create({
    data: {
      studentId: profileKeerthana.id,
      title: 'National Smart India Hackathon 2025 Winner Certificate',
      category: 'ACHIEVEMENT',
      fileUrl: '/uploads/documents/sih-2025-winner-certificate.pdf',
      fileName: 'sih-2025-winner-certificate.pdf',
      fileSize: 854200,
      description: 'First prize certificate issued by Ministry of Health & AICTE.',
      credentialUrl: 'https://sih.gov.in/winners-2025-keerthana',
      issueDate: new Date('2025-01-25'),
      status: 'VERIFIED',
      version: 1
    }
  });

  await prisma.verificationRecord.create({
    data: {
      documentSubmissionId: doc2.id,
      studentId: profileKeerthana.id,
      reviewerStaffId: staffMCA.id,
      reviewerName: 'Prof. Rajesh Kumar',
      reviewerEmail: 'staff.mca@college.edu',
      reviewerRole: 'Class In-charge / Tutor',
      decision: 'VERIFIED',
      comments: 'Verified with departmental records and official SIH announcement.'
    }
  });

  const doc3 = await prisma.documentSubmission.create({
    data: {
      studentId: profileKeerthana.id,
      title: 'CloudScale Labs Summer Internship Completion Certificate',
      category: 'INTERNSHIP_EXPERIENCE',
      fileUrl: '/uploads/documents/cloudscale-internship-certificate.pdf',
      fileName: 'cloudscale-internship-certificate.pdf',
      fileSize: 645120,
      description: 'Completed 3-month Software Development Internship at CloudScale Labs working on Express.js and PostgreSQL.',
      issueDate: new Date('2024-08-01'),
      status: 'PENDING',
      version: 1
    }
  });

  const doc4 = await prisma.documentSubmission.create({
    data: {
      studentId: profileKeerthana.id,
      title: 'Docker Certified Associate (DCA) Examination Scorecard',
      category: 'CERTIFICATE',
      fileUrl: '/uploads/documents/docker-certified-scorecard.pdf',
      fileName: 'docker-certified-scorecard.pdf',
      fileSize: 512000,
      description: 'Scorecard and credential validation for Docker Certified Associate.',
      issueDate: new Date('2024-12-05'),
      status: 'RESUBMISSION_REQUIRED',
      version: 1
    }
  });

  await prisma.verificationRecord.create({
    data: {
      documentSubmissionId: doc4.id,
      studentId: profileKeerthana.id,
      reviewerStaffId: staffMCA.id,
      reviewerName: 'Prof. Rajesh Kumar',
      reviewerEmail: 'staff.mca@college.edu',
      reviewerRole: 'Class In-charge / Tutor',
      decision: 'RESUBMISSION_REQUIRED',
      comments: 'The uploaded scan has low resolution and the credential verification QR is unreadable. Please re-upload a clear high-resolution PDF or scan.'
    }
  });

  const doc5 = await prisma.documentSubmission.create({
    data: {
      studentId: profileRahul.id,
      title: 'Stanford Machine Learning Specialization Certificate',
      category: 'CERTIFICATE',
      fileUrl: '/uploads/documents/stanford-ml-specialization.pdf',
      fileName: 'stanford-ml-specialization.pdf',
      fileSize: 921600,
      description: 'Coursera / DeepLearning.AI completed specialization certificate by Andrew Ng.',
      credentialUrl: 'https://coursera.org/verify/specialization/ML-STANFORD-994',
      issueDate: new Date('2024-09-12'),
      status: 'PENDING',
      version: 1
    }
  });

  console.log('✅ Staff assignments and document submissions seeded.');

  // 11. Initial Admin Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        action: 'SYSTEM_INITIALIZATION',
        targetType: 'System',
        targetId: 'INIT',
        details: 'Initial system seeding with departments, batches, catalog skills, and verified accounts.'
      },
      {
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        action: 'FEATURE_PROJECT',
        targetType: 'Project',
        targetId: proj1.id,
        details: JSON.stringify({ title: proj1.title, studentName: 'Keerthana A R' })
      },
      {
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        action: 'VERIFY_CERTIFICATION',
        targetType: 'Certification',
        targetId: 'AWS-SAA-83921',
        details: JSON.stringify({ cert: 'AWS Certified Solutions Architect', student: 'Keerthana A R' })
      }
    ]
  });

  console.log('✅ Seed completed successfully!');
  console.log('=======================================================');
  console.log('Credentials Summary:');
  console.log('Admin:   admin@college.edu       | AdminPassword@123');
  console.log('Staff 1: staff.mca@college.edu   | StaffPassword@123 (MCA Class In-charge)');
  console.log('Staff 2: staff.cse@college.edu   | StaffPassword@123 (CSE Tutor)');
  console.log('Student: keerthana.ar@college.edu| Student@123');
  console.log('Student: rahul.sharma@college.edu| Student@123');
  console.log('Student: pooja.verma@college.edu | Student@123');
  console.log('Alumni:  ananya.patel@alumni.college.edu | Student@123');
  console.log('=======================================================');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
