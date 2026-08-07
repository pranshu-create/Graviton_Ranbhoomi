// Setup Pusher client
let pusherInstance = null;

export const getPusherClient = async () => {
  if (typeof window === 'undefined') return null; // Prevent SSR crashes
  
  if (!pusherInstance) {
    const Pusher = (await import('pusher-js')).default;
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'mock_key', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
      forceTLS: true,
    });
  }
  return pusherInstance;
};
