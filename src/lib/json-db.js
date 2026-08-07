import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src/data", "db.json");

export async function getTeams() {
  try {
    const data = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // Create if doesn't exist
      await saveTeams([]);
      return [];
    }
    throw error;
  }
}

export async function saveTeams(teams) {
  // Ensure directory exists
  const dir = path.dirname(DB_PATH);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(DB_PATH, JSON.stringify(teams, null, 2));
}

export async function addTeam(teamData) {
  const teams = await getTeams();
  const teamCount = teams.length;
  const teamId = `T-${String(teamCount + 1).padStart(3, '0')}`;
  
  const newTeam = {
    id: teamId,
    teamId, // keep both for compatibility with frontend
    ...teamData,
    members: teamData.memberDetails.length,
    status: "UNPAID",
    screenshot: null,
    date: new Date().toISOString()
  };

  teams.push(newTeam);
  await saveTeams(teams);
  return newTeam;
}

export async function updateTeam(teamId, updateData) {
  const teams = await getTeams();
  const index = teams.findIndex(t => t.id === teamId || t.teamId === teamId);
  
  if (index === -1) return null;

  teams[index] = { ...teams[index], ...updateData };
  await saveTeams(teams);
  return teams[index];
}
