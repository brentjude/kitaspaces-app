import { PrismaClient } from '@/generated/prisma';

/**
 * Generates a user ID in format YYYYNNN (e.g., 2025001, 2025002)
 * Resets counter each year
 */
export async function generateUserId(prisma: PrismaClient): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearPrefix = currentYear.toString();

  // Find the latest user ID for this year
  const latestUser = await prisma.user.findFirst({
    where: {
      id: {
        startsWith: yearPrefix,
      },
    },
    orderBy: {
      id: 'desc',
    },
  });

  let nextNumber = 1;

  if (latestUser) {
    // Extract the number part (last 3 digits)
    const lastNumber = parseInt(latestUser.id.slice(-3));
    nextNumber = lastNumber + 1;
  }

  // Format: YYYYNNN (e.g., 2025001)
  const userId = `${yearPrefix}${nextNumber.toString().padStart(3, '0')}`;

  return userId;
}