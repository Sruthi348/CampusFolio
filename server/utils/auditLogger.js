export async function logAdminAction(prisma, { adminId, adminEmail, action, targetType, targetId, details }) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: adminId || 'SYSTEM',
        adminEmail: adminEmail || 'system@college.edu',
        action,
        targetType,
        targetId: String(targetId || 'N/A'),
        details: typeof details === 'object' ? JSON.stringify(details) : String(details || '')
      }
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
