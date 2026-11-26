export function calculateProfileCompletion(profile) {
  if (!profile) return { percentage: 0, checklist: [] };

  const checks = [
    { key: 'photo', label: 'Profile Photo', weight: 10, completed: Boolean(profile.photoUrl) },
    { key: 'bio', label: 'Biography', weight: 10, completed: Boolean(profile.bio && profile.bio.trim().length > 10) },
    { key: 'dob', label: 'Date of Birth (Private)', weight: 5, completed: Boolean(profile.dateOfBirth) },
    { key: 'links', label: 'Professional Links', weight: 10, completed: Boolean(profile.links && profile.links.length > 0) },
    { key: 'skills', label: 'Skills & Interests (3+)', weight: 15, completed: Boolean(profile.skills && profile.skills.length >= 3) },
    { key: 'education', label: 'Education Records', weight: 15, completed: Boolean(profile.education && profile.education.length > 0) },
    { key: 'projects', label: 'Projects (1+)', weight: 15, completed: Boolean(profile.projects && profile.projects.length > 0) },
    { key: 'certifications', label: 'Certifications', weight: 10, completed: Boolean(profile.certifications && profile.certifications.length > 0) },
    { key: 'experience', label: 'Internships / Experience', weight: 5, completed: Boolean(profile.experience && profile.experience.length > 0) },
    { key: 'achievements', label: 'Achievements or Activities', weight: 5, completed: Boolean((profile.achievements && profile.achievements.length > 0) || (profile.extracurriculars && profile.extracurriculars.length > 0)) }
  ];

  const totalCompletedWeight = checks.reduce((sum, item) => item.completed ? sum + item.weight : sum, 0);

  return {
    percentage: Math.min(100, Math.round(totalCompletedWeight)),
    checklist: checks
  };
}
