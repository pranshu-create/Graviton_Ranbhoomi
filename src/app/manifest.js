export default function manifest() {
  return {
    name: 'RANBHOOMI 2.0 | Graviton Robotics',
    short_name: 'RANBHOOMI',
    description: 'The ultimate technical robotics fest by Graviton Robotics. Battle of metal and minds.',
    start_url: '/',
    display: 'standalone',
    background_color: '#02050A',
    theme_color: '#66FCF1',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/Logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/Logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
