import Pusher from "pusher";

const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

async function testPusher() {
  try {
    console.log("Testing Pusher trigger...");
    const res = await pusherServer.trigger("god-mode-channel", "system-update", { test: true });
    console.log("Pusher Trigger Result Status:", res.status);
    console.log("Success! Pusher event dispatched successfully.");
  } catch (error) {
    console.error("Pusher Trigger Failed with error:", error);
  }
}

testPusher();
