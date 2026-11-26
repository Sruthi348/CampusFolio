export function generateBaseSlug(name) {
  if (!name) return 'student';
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .replace(/\s+/g, '-')         // replace spaces with -
    .replace(/-+/g, '-');        // collapse consecutive -
}

export async function generateUniqueSlug(prisma, name, excludeProfileId = null) {
  let baseSlug = generateBaseSlug(name);
  if (!baseSlug) baseSlug = 'student';

  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.studentProfile.findFirst({
      where: {
        slug: candidateSlug,
        ...(excludeProfileId ? { id: { not: excludeProfileId } } : {})
      },
      select: { id: true }
    });

    if (!existing) {
      return candidateSlug;
    }

    counter += 1;
    candidateSlug = `${baseSlug}-${counter}`;
  }
}
