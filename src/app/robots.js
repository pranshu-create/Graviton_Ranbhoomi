export default function robots() {
  const baseUrl = "https://ranbhoomi.tech"; // Replace with your actual domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/super-admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
