export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ranbhoomi.tech";

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/super-admin/',
        '/admin-login',
        '/admin-verify-2fa',
        '/admin-panel-secret',
        '/verify-2fa',
        '/verify-email',
        '/reset-password',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
