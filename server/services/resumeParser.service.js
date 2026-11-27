import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extract plain text from PDF or DOCX buffer.
 */
export async function extractTextFromBuffer(buffer, mimetype, filename = '') {
  const ext = filename.toLowerCase().split('.').pop();

  if (mimetype === 'application/pdf' || ext === 'pdf') {
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const result = await parser.getText();
    const text = typeof result === 'string' ? result : (result?.text || '');
    if (!text || text.trim().length < 15) {
      throw new Error('Could not extract readable text from this PDF. It may be an image scan or password protected.');
    }
    return text.trim();
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    ext === 'docx' ||
    ext === 'doc'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    const text = result?.value || '';
    if (!text || text.trim().length < 15) {
      throw new Error('Could not extract readable text from this Word document.');
    }
    return text.trim();
  }

  throw new Error('Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).');
}

/**
 * Query Gemini AI API if GEMINI_API_KEY is configured.
 */
async function extractWithGemini(rawText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a resume parser for CampusFolio student portfolios. Extract structured data from this resume text into JSON format.
Return ONLY a valid JSON object with the following exact keys:
{
  "basicInfo": {
    "fullName": "Full name or empty string",
    "email": "Email address or empty string",
    "phone": "Phone number or empty string",
    "bio": "Short professional summary/bio (max 150 characters)",
    "summary": "Full professional summary",
    "links": [
      { "platform": "GitHub|LinkedIn|Portfolio|Other", "url": "valid url" }
    ]
  },
  "education": [
    {
      "level": "UG" | "PG" | "DIPLOMA" | "SCHOOL" | "OTHER",
      "program": "Degree name e.g. B.Tech Computer Science, MCA, etc.",
      "institution": "University/College/School name",
      "fieldOfStudy": "e.g. Computer Science and Engineering",
      "startYear": 2022,
      "endYear": 2026,
      "isCurrent": false,
      "grade": "8.8 CGPA or percentage or null"
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "description": "Comprehensive project description",
      "role": "e.g. Fullstack Developer or null",
      "githubUrl": "GitHub repo url or null",
      "demoLink": "Live demo url or null",
      "technologies": ["React", "Node.js", "PostgreSQL"]
    }
  ],
  "experience": [
    {
      "organization": "Company or Organization name",
      "role": "Job title or role",
      "location": "City/Country or Remote or null",
      "startDate": "YYYY-MM-DD or YYYY-MM",
      "endDate": "YYYY-MM-DD or YYYY-MM or null",
      "isCurrent": false,
      "description": "Description of responsibilities and achievements"
    }
  ],
  "certifications": [
    {
      "name": "Certification title",
      "issuer": "Issuing organization e.g. AWS, Coursera, Google",
      "issueDate": "YYYY-MM-DD or YYYY-MM",
      "credentialUrl": "Credential link or null"
    }
  ],
  "achievements": [
    {
      "title": "Achievement title",
      "description": "Details of the award, competition, or hackathon",
      "date": "YYYY-MM-DD or YYYY-MM",
      "proofUrl": "URL or null"
    }
  ],
  "skills": [
    { "name": "Skill name", "category": "TECHNICAL" | "SOFT" | "INTEREST", "proficiency": "Intermediate" }
  ]
}

Resume Text:
${rawText.slice(0, 10000)}
`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);
    if (!response.ok) return null;

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (content) {
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('[ResumeParser] Gemini API call skipped or timed out:', err.message);
  }
  return null;
}

/**
 * Built-in Rule-based extraction engine.
 * Completely deterministic, offline, free, and robust.
 */
export function extractWithRules(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  // 1. Basic Info
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].toLowerCase() : '';

  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const githubUrl = githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`) : '';

  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_/%-]+)/i);
  const linkedinUrl = linkedinMatch ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : '';

  // Extract Name from top lines (skipping titles, emails, phones)
  let fullName = '';
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    if (
      !line.includes('@') &&
      !line.match(/\d{5,}/) &&
      !line.match(/curriculum|resume|page|profile|portfolio|objective|summary/i) &&
      line.length >= 3 &&
      line.length <= 40 &&
      !line.includes('http')
    ) {
      fullName = line.replace(/[^a-zA-Z\s.]/g, '').trim();
      break;
    }
  }

  // Links
  const links = [];
  if (githubUrl) links.push({ platform: 'GitHub', url: githubUrl });
  if (linkedinUrl) links.push({ platform: 'LinkedIn', url: linkedinUrl });

  // Other URLs
  const allUrls = rawText.match(/https?:\/\/[^\s,)]+/g) || [];
  for (const url of allUrls) {
    if (!url.includes('github.com') && !url.includes('linkedin.com')) {
      if (url.includes('leetcode.com') || url.includes('hackerrank.com') || url.includes('codechef.com')) {
        links.push({ platform: 'LeetCode', url });
      } else if (!links.some(l => l.url === url)) {
        links.push({ platform: 'Portfolio', url });
      }
    }
  }

  // 2. Section Segmentation
  const sectionHeaders = [
    { key: 'summary', regex: /^(?:professional\s+summary|career\s+objective|summary|profile|about\s+me)\b/i },
    { key: 'education', regex: /^(?:education|academic\s+background|academics|qualifications|educational\s+qualifications)\b/i },
    { key: 'experience', regex: /^(?:experience|work\s+experience|internships?|internship\s+experience|professional\s+experience|employment)\b/i },
    { key: 'projects', regex: /^(?:projects|academic\s+projects|personal\s+projects|technical\s+projects|key\s+projects)\b/i },
    { key: 'skills', regex: /^(?:technical\s+skills|skills\s*(?:&|and)\s*competencies|skills|tools\s*(?:&|and)\s*technologies|areas\s+of\s+expertise)\b/i },
    { key: 'certifications', regex: /^(?:certifications?|licenses\s*(?:&|and)\s*certifications|certificates|courses)\b/i },
    { key: 'achievements', regex: /^(?:achievements?|awards?\s*(?:&|and)\s*honors?|honors?|accomplishments?|co-curricular)\b/i }
  ];

  const sections = {
    summary: [],
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: []
  };

  let currentSection = null;

  for (const line of lines) {
    const matchedHeader = sectionHeaders.find(h => h.regex.test(line));
    if (matchedHeader) {
      currentSection = matchedHeader.key;
      continue;
    }
    if (currentSection && sections[currentSection]) {
      sections[currentSection].push(line);
    }
  }

  // Summary / Bio
  let fullSummary = sections.summary.join(' ').trim();
  let bio = fullSummary.slice(0, 150).trim();

  // 3. Parse Education
  const education = [];
  const degreeKeywords = [
    { pattern: /\b(?:m\.?c\.?a\.?|master\s+of\s+computer\s+applications)\b/i, program: 'Master of Computer Applications (MCA)', level: 'PG', field: 'Computer Applications' },
    { pattern: /\b(?:b\.?c\.?a\.?|bachelor\s+of\s+computer\s+applications)\b/i, program: 'Bachelor of Computer Applications (BCA)', level: 'UG', field: 'Computer Applications' },
    { pattern: /\b(?:m\.?tech|m\.?e\.?|master\s+of\s+technology)\b/i, program: 'Master of Technology (M.Tech)', level: 'PG', field: 'Computer Science' },
    { pattern: /\b(?:b\.?tech|b\.?e\.?|bachelor\s+of\s+technology|bachelor\s+of\s+engineering)\b/i, program: 'Bachelor of Technology (B.Tech)', level: 'UG', field: 'Computer Science & Engineering' },
    { pattern: /\b(?:b\.?sc|bachelor\s+of\s+science)\b/i, program: 'Bachelor of Science (B.Sc)', level: 'UG', field: 'Computer Science' },
    { pattern: /\b(?:m\.?sc|master\s+of\s+science)\b/i, program: 'Master of Science (M.Sc)', level: 'PG', field: 'Computer Science' },
    { pattern: /\b(?:diploma|polytechnic)\b/i, program: 'Diploma in Engineering', level: 'DIPLOMA', field: 'Information Technology' },
    { pattern: /\b(?:hsc|class\s*12|12th|intermediate|senior\s+secondary)\b/i, program: 'Higher Secondary Certificate (Class XII)', level: 'SCHOOL', field: 'Computer Science / Science' },
    { pattern: /\b(?:sslc|class\s*10|10th|secondary\s+school)\b/i, program: 'Secondary School Leaving Certificate (Class X)', level: 'SCHOOL', field: 'General Studies' }
  ];

  const eduText = sections.education.join('\n');
  const eduBlocks = eduText.split(/\n(?=[A-Z0-9])/).filter(b => b.trim().length > 10);

  for (const block of eduBlocks) {
    let matchedDegree = degreeKeywords.find(d => d.pattern.test(block));
    const yearMatches = block.match(/\b(20\d{2}|19\d{2})\b/g);
    let startYear = new Date().getFullYear();
    let endYear = null;
    let isCurrent = false;

    if (yearMatches && yearMatches.length >= 2) {
      startYear = parseInt(yearMatches[0]);
      endYear = parseInt(yearMatches[1]);
    } else if (yearMatches && yearMatches.length === 1) {
      startYear = parseInt(yearMatches[0]) - 3;
      endYear = parseInt(yearMatches[0]);
    }

    if (/present|current|pursuing|ongoing/i.test(block)) {
      isCurrent = true;
      endYear = null;
    }

    // Grade / CGPA
    const gradeMatch = block.match(/(?:cgpa|gpa|percentage|score|marks)?\s*[:=-]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?(?:\s*\/|\s*out\s*of\s*)?(?:10|100|4\.0)?%?)/i);
    let grade = gradeMatch ? gradeMatch[1].trim() : null;
    if (grade && !grade.toLowerCase().includes('cgpa') && !grade.includes('%')) {
      grade = `${grade} CGPA`;
    }

    // Institution
    let institution = 'College / University';
    const linesInBlock = block.split('\n');
    for (const l of linesInBlock) {
      if (/college|university|institute|school|academy|polytechnic|vidyalaya/i.test(l)) {
        institution = l.replace(/[^a-zA-Z\s&,.-]/g, '').trim();
        break;
      }
    }

    if (matchedDegree || institution !== 'College / University') {
      education.push({
        level: matchedDegree?.level || 'UG',
        program: matchedDegree?.program || linesInBlock[0] || 'Bachelor of Science',
        institution: institution,
        fieldOfStudy: matchedDegree?.field || 'Computer Applications & Engineering',
        startYear: startYear || 2022,
        endYear: isCurrent ? null : (endYear || (startYear ? startYear + 3 : 2025)),
        isCurrent,
        grade
      });
    }
  }

  // 4. Parse Projects
  const projects = [];
  const projBlocks = sections.projects.join('\n').split(/\n(?=[A-Z][a-zA-Z0-9\s:|-]{3,40}\n)/).filter(b => b.trim().length > 15);

  const techDictionary = [
    'React', 'Node.js', 'Express', 'Express.js', 'JavaScript', 'TypeScript', 'PostgreSQL',
    'MongoDB', 'MySQL', 'Prisma', 'Tailwind CSS', 'Bootstrap', 'HTML5', 'CSS3', 'Python',
    'Django', 'Flask', 'Java', 'Spring Boot', 'C++', 'Git', 'Docker', 'AWS', 'Next.js',
    'Firebase', 'Redux', 'GraphQL', 'REST API', 'Vite', 'FastAPI'
  ];

  for (const block of projBlocks) {
    const blockLines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!blockLines.length) continue;

    const title = blockLines[0].replace(/^[-•*#\s]+/, '').split(/[-|–]/)[0].trim();
    if (!title || title.length > 60) continue;

    // Technologies used
    const foundTechs = techDictionary.filter(tech => {
      const regex = new RegExp(`\\b${tech.replace('.', '\\.')}\\b`, 'i');
      return regex.test(block);
    });

    // Links
    const projGithub = block.match(/https?:\/\/(?:www\.)?github\.com\/[^\s,)]+/i);
    const projDemo = block.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)+(?:vercel\.app|netlify\.app|render\.com|[a-z]{2,6})[^\s,)]*/i);

    const descLines = blockLines.slice(1).filter(l => !l.startsWith('http') && !l.toLowerCase().includes('technologies:'));
    const description = descLines.join(' ').replace(/\s+/g, ' ').trim() || `${title} application with modern full-stack web technologies.`;

    projects.push({
      title,
      description,
      role: 'Fullstack Developer',
      githubUrl: projGithub ? projGithub[0] : null,
      demoLink: projDemo ? projDemo[0] : null,
      technologies: foundTechs.length ? foundTechs : ['React', 'JavaScript']
    });
  }

  // 5. Parse Experience
  const experience = [];
  const expBlocks = sections.experience.join('\n').split(/\n(?=[A-Z][a-zA-Z0-9\s:|-]{3,40}\n)/).filter(b => b.trim().length > 15);

  for (const block of expBlocks) {
    const expLines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!expLines.length) continue;

    const firstLine = expLines[0].replace(/^[-•*#\s]+/, '');
    let organization = 'Software Organization';
    let role = 'Software Intern';

    if (firstLine.includes('-') || firstLine.includes('|')) {
      const parts = firstLine.split(/[-|]/);
      role = parts[0].trim();
      organization = parts[1].trim();
    } else {
      organization = firstLine;
      if (expLines[1] && expLines[1].length < 40) {
        role = expLines[1].trim();
      }
    }

    const yearMatch = block.match(/\b(20\d{2}|19\d{2})\b/g);
    const startDate = yearMatch && yearMatch[0] ? `${yearMatch[0]}-06-01` : '2023-06-01';
    const isCurrent = /present|current|ongoing/i.test(block);
    const endDate = isCurrent ? null : (yearMatch && yearMatch[1] ? `${yearMatch[1]}-08-01` : '2023-08-31');

    const desc = expLines.slice(2).join(' ').trim() || expLines.slice(1).join(' ').trim();

    experience.push({
      organization,
      role,
      location: /remote/i.test(block) ? 'Remote' : 'India',
      startDate,
      endDate,
      isCurrent,
      description: desc || `Contributed to software engineering workflows and feature development at ${organization}.`
    });
  }

  // 6. Parse Certifications
  const certifications = [];
  const certLines = sections.certifications.filter(l => l.length > 5);
  const commonIssuers = ['AWS', 'Google', 'Microsoft', 'Coursera', 'HackerRank', 'Udemy', 'Oracle', 'Meta', 'IBM', 'freeCodeCamp'];

  for (const line of certLines) {
    const cleanLine = line.replace(/^[-•*#\s]+/, '').trim();
    let issuer = 'Online Certification Authority';
    const matchedIssuer = commonIssuers.find(i => new RegExp(`\\b${i}\\b`, 'i').test(cleanLine));
    if (matchedIssuer) issuer = matchedIssuer;

    const urlMatch = cleanLine.match(/https?:\/\/[^\s,)]+/);
    const name = cleanLine.replace(/https?:\/\/[^\s,)]+/, '').replace(/\s*[-|–]\s*(?:issued by|by)?.*$/i, '').trim();

    if (name.length >= 3 && name.length <= 80) {
      certifications.push({
        name,
        issuer,
        issueDate: '2024-01-15',
        credentialUrl: urlMatch ? urlMatch[0] : null
      });
    }
  }

  // 7. Parse Achievements
  const achievements = [];
  const achLines = sections.achievements.filter(l => l.length > 5);
  for (const line of achLines) {
    const cleanLine = line.replace(/^[-•*#\s]+/, '').trim();
    if (cleanLine.length >= 5) {
      achievements.push({
        title: cleanLine.slice(0, 70),
        description: cleanLine,
        date: '2024-02-10',
        proofUrl: null
      });
    }
  }

  // 8. Parse Skills
  const technicalSkillsList = [
    'React', 'Node.js', 'Express.js', 'JavaScript', 'TypeScript', 'PostgreSQL', 'Prisma',
    'Tailwind CSS', 'CSS3', 'HTML5', 'Python', 'Java', 'C++', 'C', 'MongoDB', 'MySQL',
    'Git', 'GitHub', 'Docker', 'Kubernetes', 'Linux', 'AWS', 'Firebase', 'Next.js',
    'REST API', 'GraphQL', 'Redux', 'Bootstrap', 'FastAPI', 'Django'
  ];

  const softSkillsList = [
    'Leadership', 'Team Collaboration', 'Problem Solving', 'Communication', 'Critical Thinking',
    'Agile Methodologies', 'Time Management', 'Mentorship', 'Presentation'
  ];

  const interestsList = [
    'Open Source', 'Cloud Computing', 'Artificial Intelligence', 'Machine Learning',
    'Web Development', 'System Design', 'Cybersecurity', 'UI/UX Design'
  ];

  const skills = [];
  const skillsText = sections.skills.join(' ') + ' ' + rawText;

  for (const tech of technicalSkillsList) {
    const regex = new RegExp(`\\b${tech.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(skillsText) && !skills.some(s => s.name.toLowerCase() === tech.toLowerCase())) {
      skills.push({ name: tech, category: 'TECHNICAL', proficiency: 'Intermediate' });
    }
  }

  for (const soft of softSkillsList) {
    const regex = new RegExp(`\\b${soft}\\b`, 'i');
    if (regex.test(skillsText) && !skills.some(s => s.name.toLowerCase() === soft.toLowerCase())) {
      skills.push({ name: soft, category: 'SOFT', proficiency: 'Advanced' });
    }
  }

  for (const interest of interestsList) {
    const regex = new RegExp(`\\b${interest}\\b`, 'i');
    if (regex.test(skillsText) && !skills.some(s => s.name.toLowerCase() === interest.toLowerCase())) {
      skills.push({ name: interest, category: 'INTEREST', proficiency: 'Intermediate' });
    }
  }

  return {
    basicInfo: {
      fullName,
      email,
      phone,
      bio: bio || 'Aspiring technology professional with strong foundation in software design and engineering.',
      summary: fullSummary,
      links
    },
    education,
    projects,
    experience,
    certifications,
    achievements,
    skills
  };
}

/**
 * Main parser entrypoint with fallback from AI to Rule-based.
 */
export async function parseResume(buffer, mimetype, filename, existingProfile = null) {
  // Step 1: Extract Text
  const rawText = await extractTextFromBuffer(buffer, mimetype, filename);

  // Step 2: Try Gemini AI first if configured
  let extracted = null;
  if (process.env.GEMINI_API_KEY) {
    extracted = await extractWithGemini(rawText);
  }

  // Step 3: Fallback to rule-based engine
  if (!extracted || !extracted.education || !extracted.projects) {
    extracted = extractWithRules(rawText);
  }

  // Step 4: Duplicate Detection against student's existing portfolio
  if (existingProfile) {
    // Education duplicate check
    if (extracted.education) {
      extracted.education = extracted.education.map(item => {
        const match = existingProfile.education?.find(existing =>
          existing.institution?.toLowerCase() === item.institution?.toLowerCase() ||
          existing.program?.toLowerCase() === item.program?.toLowerCase()
        );
        return {
          ...item,
          isDuplicate: Boolean(match),
          existingId: match?.id || null,
          duplicateNotice: match ? `Matches existing record: ${match.program} at ${match.institution}` : null,
          selected: !match // unselected by default if duplicate
        };
      });
    }

    // Projects duplicate check
    if (extracted.projects) {
      extracted.projects = extracted.projects.map(item => {
        const match = existingProfile.projects?.find(existing =>
          existing.title?.toLowerCase().trim() === item.title?.toLowerCase().trim()
        );
        return {
          ...item,
          isDuplicate: Boolean(match),
          existingId: match?.id || null,
          duplicateNotice: match ? `Matches existing project: "${match.title}"` : null,
          selected: !match
        };
      });
    }

    // Experience duplicate check
    if (extracted.experience) {
      extracted.experience = extracted.experience.map(item => {
        const match = existingProfile.experience?.find(existing =>
          existing.organization?.toLowerCase().trim() === item.organization?.toLowerCase().trim() &&
          existing.role?.toLowerCase().trim() === item.role?.toLowerCase().trim()
        );
        return {
          ...item,
          isDuplicate: Boolean(match),
          existingId: match?.id || null,
          duplicateNotice: match ? `Matches existing experience at ${match.organization}` : null,
          selected: !match
        };
      });
    }

    // Certifications duplicate check
    if (extracted.certifications) {
      extracted.certifications = extracted.certifications.map(item => {
        const match = existingProfile.certifications?.find(existing =>
          existing.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
        );
        return {
          ...item,
          isDuplicate: Boolean(match),
          existingId: match?.id || null,
          duplicateNotice: match ? `Matches existing certification: "${match.name}"` : null,
          selected: !match
        };
      });
    }

    // Achievements duplicate check
    if (extracted.achievements) {
      extracted.achievements = extracted.achievements.map(item => {
        const match = existingProfile.achievements?.find(existing =>
          existing.title?.toLowerCase().trim() === item.title?.toLowerCase().trim()
        );
        return {
          ...item,
          isDuplicate: Boolean(match),
          existingId: match?.id || null,
          duplicateNotice: match ? `Matches existing achievement: "${match.title}"` : null,
          selected: !match
        };
      });
    }

    // Skills duplicate check
    if (extracted.skills) {
      extracted.skills = extracted.skills.map(item => {
        const match = existingProfile.skills?.find(existing =>
          existing.skill?.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
        );
        return {
          ...item,
          isDuplicate: Boolean(match),
          existingId: match?.skillId || null,
          duplicateNotice: match ? `Skill "${item.name}" already added` : null,
          selected: !match
        };
      });
    }
  } else {
    // Default selected to true for all items
    ['education', 'projects', 'experience', 'certifications', 'achievements', 'skills'].forEach(key => {
      if (extracted[key]) {
        extracted[key] = extracted[key].map(item => ({ ...item, selected: true, isDuplicate: false }));
      }
    });
  }

  return {
    rawLength: rawText.length,
    extracted
  };
}
