export function generateEventSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Append first 8 characters of ID for uniqueness
  return `${slug}-${id.substring(0, 8)}`;
}

export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-');
  const potentialId = parts[parts.length - 1];
  
  // Check if last part looks like an ID (8 characters)
  if (potentialId.length === 8) {
    return potentialId;
  }
  
  return null;
}