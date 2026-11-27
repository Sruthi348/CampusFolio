import prisma from '../prisma/prismaClient.js';

/**
 * Checks whether all required sections and supporting documents for a student
 * have been verified and approved by the assigned staff member.
 *
 * If all submissions are verified, automatically activates (publishes) the portfolio.
 * If any submission is pending, rejected, or requires correction, deactivates (unpublishes) it.
 */
export async function syncStudentVerificationAndPublish(studentId, db = prisma) {
  const profile = await db.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      documentSubmissions: true,
      certifications: true,
      achievements: true
    }
  });

  if (!profile) return false;

  const docs = profile.documentSubmissions || [];
  const certs = profile.certifications || [];
  const achs = profile.achievements || [];

  // Check for any pending or rejected submissions
  const hasPendingDocs = docs.some(d => d.status === 'PENDING' || d.status === 'RESUBMISSION_REQUIRED');
  const hasRejectedDocs = docs.some(d => d.status === 'REJECTED');

  const hasPendingCerts = certs.some(c => c.verificationStatus === 'PENDING' || c.verificationStatus === 'RESUBMISSION_REQUIRED');
  const hasRejectedCerts = certs.some(c => c.verificationStatus === 'REJECTED');

  const hasPendingAchs = achs.some(a => a.verificationStatus === 'PENDING' || a.verificationStatus === 'RESUBMISSION_REQUIRED');
  const hasRejectedAchs = achs.some(a => a.verificationStatus === 'REJECTED');

  const hasUnverifiedItems = hasPendingDocs || hasRejectedDocs || hasPendingCerts || hasRejectedCerts || hasPendingAchs || hasRejectedAchs;

  // A portfolio is verified if:
  // 1. It has NO pending or rejected documents or credentials
  // 2. The student profile is approved by staff/admin
  // 3. Status is not suspended
  // 4. If any documents were submitted, all submitted documents and credentials must be VERIFIED
  const hasSubmissions = docs.length > 0 || certs.length > 0 || achs.length > 0;
  const allSubmissionsVerified = hasSubmissions
    ? (docs.every(d => d.status === 'VERIFIED') && certs.every(c => c.verificationStatus === 'VERIFIED') && achs.every(a => a.verificationStatus === 'VERIFIED'))
    : profile.isApproved;

  const shouldBePublished = !hasUnverifiedItems && allSubmissionsVerified && profile.isApproved && profile.status !== 'SUSPENDED';

  if (profile.isPublished !== shouldBePublished) {
    await db.studentProfile.update({
      where: { id: studentId },
      data: { isPublished: shouldBePublished }
    });
  }

  return shouldBePublished;
}
