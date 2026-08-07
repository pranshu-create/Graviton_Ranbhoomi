import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { eventsData } from "@/data/events";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    // Compile rules into a massive context block
    let systemContext = "You are JARVIS, the elite AI tactical assistant for RANBHOOMI 2.0 (The Ultimate Robotics Fest by Graviton Robotics). ";
    systemContext += "Your tone must be robotic, highly professional, slightly intense, and strictly focused on robotics/hackathon topics. ";
    systemContext += "Address the user as 'Operative' or 'Commander'. Always format responses nicely with lists or bold text when needed. ";
    systemContext += "Here is the highly confidential rulebook database for all events:\n\n";

    eventsData.forEach(event => {
      systemContext += `--- EVENT: ${event.name} ---\n`;
      systemContext += `Objective: ${event.shortDescription}\n`;
      systemContext += `Team Size: ${event.teamSize} | Fees: ${event.fees} | Prize Pool: ${event.prizePool}\n`;
      if (event.rules && event.rules.length > 0) {
        systemContext += `Rules:\n`;
        event.rules.forEach(r => systemContext += `- ${r}\n`);
      }
      systemContext += "\n";
    });

    const result = streamText({
      model: google('gemini-1.5-flash', {
          apiKey: process.env.GEMINI_API_KEY || "dummy", // The user will need to provide this in .env
      }),
      system: systemContext,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("JARVIS Chat Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
