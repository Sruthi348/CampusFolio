import prisma from '../prisma/prismaClient.js';

/**
 * Evaluates whether all required sections and supporting documents for a student
 * have been verified and approved by the assigned faculty tutor.
 *
 * Requirements for Staff Publishing Approval:
 * 1. Student account must be ACTIVE (not suspended).
 * 2. Every submitted supporting document must be marked 'VERIFIED'.
 * 3. Every certification and achievement must be marked 'VERIFIED'.
 * 4. Zero items in PENDING, RESUBMISSION_REQUIRED, or REJECTED state.
 *
 * NOTE: Completed verification is a prerequisite, but the public portfolio
 * remains UNPUBLISHED until the assigned staff tutor explicitly approves publication.
 */
export async function getStudentVerificationStatus(studentId, db = prisma) {
  const profile = await db.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      documentSubmissions: true,
      certifications: true,
      achievements: true
    }
  });

  if (!profile) {
    return {
      canPublish: false,
      isPublished: false,
      reason: 'Student profile not found.'
    };
  }

  const docs = profile.documentSubmissions || [];
  const certs = profile.certifications || [];
  const achs = profile.achievements || [];

  const pendingDocs = docs.filter(d => d.status === 'PENDING' || d.status === 'RESUBMISSION_REQUIRED');
  const rejectedDocs = docs.filter(d => d.status === 'REJECTED');
  const verifiedDocs = docs.filter(d => d.status === 'VERIFIED');

  const pendingCerts = certs.filter(c => c.verificationStatus === 'PENDING' || c.verificationStatus === 'RESUBMISSION_REQUIRED');
  const rejectedCerts = certs.filter(c => c.verificationStatus === 'REJECTED');
  const verifiedCerts = certs.filter(c => c.verificationStatus === 'VERIFIED');

  const pendingAchs = achs.filter(a => a.verificationStatus === 'PENDING' || a.verificationStatus === 'RESUBMISSION_REQUIRED');
  const rejectedAchs = achs.filter(a => a.verificationStatus === 'REJECTED');
  const verifiedAchs = achs.filter(a => a.verificationStatus === 'VERIFIED');

  const pendingCount = pendingDocs.length + pendingCerts.length + pendingAchs.length;
  const rejectedCount = rejectedDocs.length + rejectedCerts.length + rejectedAchs.length;
  const verifiedCount = verifiedDocs.length + verifiedCerts.length + verifiedAchs.length;
  const totalCount = docs.length + certs.length + achs.length;

  if (profile.status === 'SUSPENDED') {
    return {
      canPublish: false,
      isPublished: profile.isPublished,
      pendingCount,
      rejectedCount,
      verifiedCount,
      totalCount,
      reason: 'Student account is suspended.'
    };
  }

  if (pendingCount > 0) {
    return {
      canPublish: false,
      isPublished: profile.isPublished,
      pendingCount,
      rejectedCount,
      verifiedCount,
      totalCount,
      reason: `${pendingCount} item(s) are awaiting faculty verification.`
    };
  }

  if (rejectedCount > 0) {
    return {
      canPublish: false,
      isPublished: profile.isPublished,
      pendingCount,
      rejectedCount,
      verifiedCount,
      totalCount,
      reason: `${rejectedCount} item(s) have been rejected or require student resubmission.`
    };
  }

  return {
    canPublish: true,
    isPublished: profile.isPublished,
    pendingCount: 0,
    rejectedCount: 0,
    verifiedCount,
    totalCount,
    reason: 'All submitted documents and portfolio items have been verified and approved.'
  };
}

/**
 * If a student makes updates, submits new documents, or has rejected items,
 * and their portfolio was previously published, automatically revoke public access
 * so unverified content is never publicly visible.
 */
export async function revokePublicAccessIfUnverified(studentId, db = prisma) {
  const status = await getStudentVerificationStatus(studentId, db);
  if (!status.canPublish) {
    // If it was published, revoke it
    if (status.isPublished) {
      await db.studentProfile.update({
        where: { id: studentId },
        data: { isPublished: false }
      });
      return { revoked: true, reason: status.reason };
    }
  }
  return { revoked: false };
}

/**
 * Compatibility wrapper. Only revokes if unverified; does NOT automatically publish.
 */
export async function syncStudentVerificationAndPublish(studentId, db = prisma) {
  const res = await revokePublicAccessIfUnverified(studentId, db);
  return !res.revoked;
}
