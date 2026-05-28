// Use environment variable if set, otherwise fallback to localhost for development, or Render for production
// This comment is intentionally added to trigger a fresh Vercel redeploy commit.
export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== "undefined" && window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://guna-website.onrender.com");
