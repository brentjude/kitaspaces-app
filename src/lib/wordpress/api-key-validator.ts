export function validateWordPressApiKey(apiKey: string | null): boolean {
  if (!apiKey) {
    return false;
  }

  const validApiKey = process.env.WORDPRESS_API_KEY;
  
  if (!validApiKey) {
    console.error("WORDPRESS_API_KEY not configured in environment variables");
    return false;
  }

  return apiKey === validApiKey;
}