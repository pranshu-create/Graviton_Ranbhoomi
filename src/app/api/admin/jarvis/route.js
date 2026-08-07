import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req) {
  try {
    const { command, systemContext } = await req.json();

    if (!command) {
      return new Response(JSON.stringify({ error: "No command provided" }), { status: 400 });
    }

    // Build the context string
    let contextStr = "System Context:\n";
    if (systemContext) {
      if (systemContext.teamsCount) contextStr += `- Total Teams: ${systemContext.teamsCount}\n`;
      if (systemContext.verifiedCount) contextStr += `- Verified Teams: ${systemContext.verifiedCount}\n`;
      if (systemContext.activeTab) contextStr += `- Active Tab: ${systemContext.activeTab}\n`;
      if (systemContext.isLockdown !== undefined) contextStr += `- Lockdown Active: ${systemContext.isLockdown}\n`;
    }

    const systemPrompt = `You are J.A.R.V.I.S., the highly advanced tactical AI assistant for the Super Admin of RANBHOOMI 2.0 (The Ultimate Robotics Fest by Graviton Robotics).
Your job is to parse the Super Admin's natural language command and map it to a specific system intent.

Available intents:
- QUERY_STATS: Asking for team counts, revenue, event stats.
- VERIFY_TEAM: Verifying a specific team (requires teamName or teamId).
- REJECT_TEAM: Rejecting a specific team (requires teamName or teamId).
- DISQUALIFY_TEAM: Disqualifying a specific team (requires teamName or teamId).
- VERIFY_ALL_PENDING: Verifying all pending teams.
- TOGGLE_LOCKDOWN: Activating or deactivating system lockdown.
- TOGGLE_MAINTENANCE: Activating or deactivating maintenance mode.
- FREEZE_EVENT: Freezing registrations for an event (requires eventName).
- UNFREEZE_EVENT: Unfreezing an event (requires eventName).
- SEND_COMMS: Sending a broadcast message (requires message).
- SEND_BLAST: Sending an email blast to verified teams (requires message).
- SEND_NO_SHOW: Sending no-show alerts to absent teams.
- RESEND_RECEIPT: Resending receipt to a team (requires teamName or teamId).
- NAVIGATE_TAB: Navigating to a specific tab like DATABASE, SCANNER, AI_SCREENER, ARENA, COMMS, FINANCES (requires tabName).
- EXPORT_CSV: Exporting teams to CSV.
- TOGGLE_LEADERBOARD: Releasing or hiding the leaderboard.
- AI_ANALYZE: Analyzing a specific team (requires teamName or teamId).
- UNKNOWN: Use this if the command is just conversational or doesn't match an action.

If the action is destructive (like DISQUALIFY_TEAM, TOGGLE_LOCKDOWN, REJECT_TEAM, SEND_BLAST, SEND_NO_SHOW), set "requiresConfirmation" to true.

Provide a short, robotic, JARVIS-style narration (e.g., "Verifying team Alpha Squad now, Commander.", "Initiating system lockdown protocols. Are you sure you wish to proceed?", "I have no record of that command, Operative.").

${contextStr}
`;

    let resultObject;

    const hasRealKey = process.env.GEMINI_API_KEY && 
                       process.env.GEMINI_API_KEY !== "dummy" && 
                       process.env.GEMINI_API_KEY !== "YOUR_KEY_HERE" &&
                       process.env.GEMINI_API_KEY.startsWith("AIza");

    console.log(`[JARVIS] Command: "${command}" | AI Mode: ${hasRealKey ? 'Gemini' : 'Offline Regex'}`);

    if (!hasRealKey) {
        // Normalize: lowercase, collapse whitespace, remove punctuation
        const raw = command.toLowerCase().trim();
        // Handle speech-recognition artifacts like "un verified" → "unverified"
        const c = raw
          .replace(/\bun verified\b/g, "unverified")
          .replace(/\bun freeze\b/g, "unfreeze")
          .replace(/\block down\b/g, "lockdown")
          .replace(/\bdata base\b/g, "database")
          .replace(/\bover view\b/g, "overview")
          .replace(/\blea der board\b/g, "leaderboard")
          .replace(/\bmain tenance\b/g, "maintenance");

        resultObject = {
            intent: "UNKNOWN",
            params: {},
            narration: "I am afraid I do not understand that command, Commander. Try saying: 'show me pending teams', 'go to scanner', 'activate lockdown', or 'how many teams'.",
            requiresConfirmation: false
        };

        // ── QUERY / INFO commands ──────────────────────────────────────────
        const isQuery = c.includes("give me") || c.includes("tell me") || c.includes("show me") ||
                        c.includes("how many") || c.includes("what is") || c.includes("list") ||
                        c.includes("details") || c.includes("info") || c.includes("count") ||
                        c.includes("stats") || c.includes("report") || c.includes("overview") ||
                        c.includes("status") || c.includes("summary") || c.includes("display");

        if (isQuery && (c.includes("unverified") || c.includes("pending") || c.includes("not verified") || c.includes("waiting"))) {
            resultObject.intent = "QUERY_STATS";
            resultObject.narration = `Commander, we currently have ${systemContext?.pendingCount ?? systemContext?.unverifiedCount ?? 0} teams awaiting verification out of ${systemContext?.teamsCount || 0} total registered. ${systemContext?.verifiedCount || 0} are already verified.`;
        } else if (isQuery && (c.includes("verified") || c.includes("approved"))) {
            resultObject.intent = "QUERY_STATS";
            resultObject.narration = `${systemContext?.verifiedCount || 0} teams are verified and cleared, Commander. Total registered: ${systemContext?.teamsCount || 0}.`;
        } else if (isQuery && (c.includes("rejected") || c.includes("denied"))) {
            resultObject.intent = "QUERY_STATS";
            resultObject.narration = `${systemContext?.rejectedCount || 0} teams have been rejected from the system, Commander.`;
        } else if (isQuery && (c.includes("disqualified") || c.includes("banned"))) {
            resultObject.intent = "QUERY_STATS";
            resultObject.narration = `${systemContext?.disqualifiedCount || 0} teams are currently disqualified, Commander.`;
        } else if (isQuery && (c.includes("team") || c.includes("squad") || c.includes("participant") || c.includes("revenue") || c.includes("total"))) {
            resultObject.intent = "QUERY_STATS";
            resultObject.narration = `Total teams: ${systemContext?.teamsCount || 0}. Verified: ${systemContext?.verifiedCount || 0}. Pending: ${systemContext?.pendingCount || 0}. Rejected: ${systemContext?.rejectedCount || 0}. Disqualified: ${systemContext?.disqualifiedCount || 0}.`;

        // ── VERIFY commands ───────────────────────────────────────────────
        } else if ((c.includes("verify") || c.includes("approve") || c.includes("clear") || c.includes("confirm")) && !c.includes("unverified")) {
            if (c.includes("all") || c.includes("pending") || c.includes("everyone") || c.includes("everybody")) {
                resultObject.intent = "VERIFY_ALL_PENDING";
                resultObject.narration = `Initiating bulk verification of all ${systemContext?.pendingCount || 0} pending teams, Commander.`;
                resultObject.requiresConfirmation = true;
            } else {
                resultObject.intent = "VERIFY_TEAM";
                resultObject.params.teamName = c.replace(/verify team|approve team|clear team|confirm team|verify|approve|clear|confirm|team|the|squad/, "").trim();
                resultObject.narration = "Verifying team credentials now, Commander.";
            }

        // ── REJECT commands ───────────────────────────────────────────────
        } else if (c.includes("reject") || c.includes("deny") || c.includes("kick") || c.includes("remove team")) {
            resultObject.intent = "REJECT_TEAM";
            resultObject.params.teamName = c.replace(/reject team|deny team|kick team|remove team|reject|deny|kick|remove|team|the|squad/, "").trim();
            resultObject.narration = "Warning: Initiating rejection protocols against the target team.";
            resultObject.requiresConfirmation = true;

        // ── DISQUALIFY commands ───────────────────────────────────────────
        } else if (c.includes("disqualify") || c.includes("ban")) {
            resultObject.intent = "DISQUALIFY_TEAM";
            resultObject.params.teamName = c.replace(/disqualify team|ban team|disqualify|ban|team|the|squad/, "").trim();
            resultObject.narration = "Warning: Initiating disqualification against the target team.";
            resultObject.requiresConfirmation = true;

        // ── LOCKDOWN commands ─────────────────────────────────────────────
        } else if (c.includes("lockdown") || c.includes("lock down") || c.includes("shut down") || c.includes("seal the") || c.includes("emergency")) {
            resultObject.intent = "TOGGLE_LOCKDOWN";
            resultObject.narration = systemContext?.isLockdown
              ? "Deactivating lockdown protocols. Are you sure, Commander?"
              : "Lockdown override detected. This will lock all users out. Are you sure you wish to proceed?";
            resultObject.requiresConfirmation = true;

        // ── MAINTENANCE commands ──────────────────────────────────────────
        } else if (c.includes("maintenance") || c.includes("dev mode") || c.includes("under construction")) {
            resultObject.intent = "TOGGLE_MAINTENANCE";
            resultObject.narration = "Maintenance mode toggle requested. All users will see a maintenance screen. Confirm?";
            resultObject.requiresConfirmation = true;

        // ── NAVIGATE commands ─────────────────────────────────────────────
        } else if (c.includes("go to") || c.includes("open") || c.includes("navigate") || c.includes("take me") || c.includes("switch to") || c.includes("bring up") || c.includes("show") || c.includes("display")) {
            resultObject.intent = "NAVIGATE_TAB";
            resultObject.narration = "Navigating interface now, Operative.";
            if (c.includes("database") || c.includes("data base") || c.includes("records") || c.includes("all teams")) resultObject.params.tabName = "DATABASE";
            else if (c.includes("scanner") || c.includes("qr") || c.includes("scan")) resultObject.params.tabName = "SCANNER";
            else if (c.includes("arena") || c.includes("battle") || c.includes("matches") || c.includes("event")) resultObject.params.tabName = "ARENA";
            else if (c.includes("finance") || c.includes("expense") || c.includes("money") || c.includes("budget") || c.includes("payment")) resultObject.params.tabName = "FINANCES";
            else if (c.includes("comms") || c.includes("message") || c.includes("chat") || c.includes("communication") || c.includes("broadcast")) resultObject.params.tabName = "COMMS";
            else if (c.includes("ai") || c.includes("screener") || c.includes("smart") || c.includes("artificial")) resultObject.params.tabName = "AI_SCREENER";
            else if (c.includes("hostel") || c.includes("accommodation") || c.includes("room") || c.includes("stay")) resultObject.params.tabName = "HOSTEL";
            else resultObject.intent = "UNKNOWN";

        // ── EXPORT commands ───────────────────────────────────────────────
        } else if (c.includes("export") || c.includes("csv") || c.includes("download") || c.includes("save data") || c.includes("extract")) {
            resultObject.intent = "EXPORT_CSV";
            resultObject.narration = "Exporting system records to secure datapad, Commander.";

        // ── LEADERBOARD commands ──────────────────────────────────────────
        } else if (c.includes("leaderboard") || c.includes("rankings") || c.includes("scores") || c.includes("standings") || c.includes("winner")) {
            resultObject.intent = "TOGGLE_LEADERBOARD";
            resultObject.narration = "Leaderboard visibility command received, Commander.";

        // ── FREEZE / UNFREEZE commands ────────────────────────────────────
        } else if (c.includes("unfreeze") || c.includes("resume") || c.includes("reopen")) {
            resultObject.intent = "UNFREEZE_EVENT";
            resultObject.params.eventName = c.replace(/unfreeze event|unfreeze|resume|reopen|the|event/, "").trim();
            resultObject.narration = "Unfreezing event registrations as requested.";
        } else if (c.includes("freeze") || c.includes("pause") || c.includes("stop registration") || c.includes("close registration")) {
            resultObject.intent = "FREEZE_EVENT";
            resultObject.params.eventName = c.replace(/freeze event|freeze|pause|stop registration|close registration|the|event/, "").trim();
            resultObject.narration = "Freezing event registrations now.";

        // ── BROADCAST commands ────────────────────────────────────────────
        } else if (c.includes("blast") || c.includes("broadcast") || c.includes("send email") || c.includes("announce") || c.includes("mass mail") || c.includes("notify all")) {
            resultObject.intent = "SEND_BLAST";
            resultObject.narration = "Warning: Preparing mass broadcast to all verified teams. Do you wish to proceed?";
            resultObject.requiresConfirmation = true;

        // ── NO-SHOW commands ──────────────────────────────────────────────
        } else if (c.includes("no show") || c.includes("no-show") || c.includes("absent") || c.includes("missing team")) {
            resultObject.intent = "SEND_NO_SHOW";
            resultObject.narration = "Sending no-show warnings to inactive participants, Commander.";
            resultObject.requiresConfirmation = true;

        // ── ANALYZE commands ──────────────────────────────────────────────
        } else if (c.includes("analyze") || c.includes("analyse") || c.includes("inspect") || c.includes("profile") || c.includes("deep dive") || c.includes("investigate")) {
            resultObject.intent = "AI_ANALYZE";
            resultObject.params.teamName = c.replace(/analyze|analyse|inspect|profile|deep dive|investigate|team|the|squad/, "").trim();
            resultObject.narration = "Running deep AI analysis on the target team.";
        }

    } else {
      const result = await generateObject({
        model: google('gemini-1.5-flash'),
        system: systemPrompt,
        prompt: `Command: "${command}"`,
        schema: z.object({
          intent: z.enum([
            'QUERY_STATS', 'VERIFY_TEAM', 'REJECT_TEAM', 'DISQUALIFY_TEAM', 'VERIFY_ALL_PENDING',
            'TOGGLE_LOCKDOWN', 'TOGGLE_MAINTENANCE', 'FREEZE_EVENT', 'UNFREEZE_EVENT',
            'SEND_COMMS', 'SEND_BLAST', 'SEND_NO_SHOW', 'RESEND_RECEIPT', 'NAVIGATE_TAB',
            'EXPORT_CSV', 'TOGGLE_LEADERBOARD', 'AI_ANALYZE', 'UNKNOWN'
          ]),
          params: z.object({
            teamName: z.string().optional(),
            teamId: z.string().optional(),
            eventName: z.string().optional(),
            message: z.string().optional(),
            tabName: z.string().optional(),
          }),
          narration: z.string(),
          requiresConfirmation: z.boolean()
        }),
      });
      resultObject = result.object;
    }

    return new Response(JSON.stringify(resultObject), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("JARVIS Intent Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
