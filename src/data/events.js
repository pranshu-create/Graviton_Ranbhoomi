export const eventsData = [
  {
    id: "robo-race",
    name: "ROBO RACE",
    shortDescription: "Navigate a customized obstacle course in the shortest time.",
    description: "Robo Race track will be a customized course with various features like speed breakers, ramps, and different terrain surfaces. The objective is to complete the track in the given order in the shortest time while maintaining control and precision.",
    objectiveQuote: "To engineer a versatile rover capable of conquering any terrain at maximum velocity.",
    structuredSpecs: [
      { label: "MAX WEIGHT", value: "3 kg", sub: "Includes battery" },
      { label: "DIMENSIONS", value: "< 280x280x150 mm", sub: "L x W x H" },
      { label: "POWER", value: "Max 16-17V", sub: "Battery limit" },
      { label: "CONTROL", value: "Wireless", sub: "No wired bots" }
    ],
    arenaSpecs: [
      { label: "DIMENSIONS", value: "45 x 55 sq feet, 130-150 feet length" },
      { label: "LANES", value: "35cm to 45-55cm wide" },
      { label: "OBSTACLES", value: "Tunnel, Curves, Seesaw, Marble Pit, Slippery Path" }
    ],
    phases: [
      { id: "01", name: "PHASE 01: QUALIFIER", subtitle: "OFFLINE // TIME TRIAL", desc: "A single lap run to establish baseline speed and maneuverability. Top 50% advance." },
      { id: "02", name: "PHASE 02: MAIN RACE", subtitle: "OFFLINE // FULL TRACK", desc: "Full obstacle course run. Time penalties applied for off-track or touches." }
    ],
    bountyBreakdown: [
      { label: "CHAMPION (1ST)", value: "₹10,000" },
      { label: "RUNNER UP (2ND)", value: "₹6,000" },
      { label: "THIRD PLACE (3RD)", value: "₹4,000" }
    ],
    eligibility: "Open to all students with a self-built robot that meets the event specifications.",
    specs: [
      "Weight Limit: Maximum 3 KG (including battery).",
      "Dimensions: Must be less than 280 mm x 280 mm (L x W), with a height of less than 150 mm.",
      "Power Source: Maximum 16 - 17 V battery.",
      "Control: Only wireless bots are allowed. Wired bots will not be permitted.",
      "Safety: Must be safe to operate and not include hazardous components.",
      "Error: Of only 10% will be considered."
    ],
    rules: [
      "Bots will compete on a specially designed obstacle track.",
      "10 sec penalty for every wall touch/collision/off-track.",
      "Missed checkpoints cost a 30 sec penalty.",
      "2 free hand touches for certain areas; subsequent touches cost 30 sec.",
      "2 skips allowed for any obstacle, costing 45 sec penalties each."
    ],
    judgingCriteria: [
      "Speed: Time taken to complete the track after totaling penalty time.",
      "Control: Stability and maneuverability of the bot.",
      "Completion: Successful navigation of all track segments. Judges' decisions are final."
    ],
    teamSize: "1-4 Members",
    fees: "₹500 / Team",
    prizePool: "₹20,000",
    color: "neon-cyan"
  },
  {
    id: "robo-soccer",
    name: "ROBO SOCCER",
    shortDescription: "A manually controlled robot must push the ball into the opponent's goal.",
    description: "A thrilling battle of manually controlled bots pushing the ball into the opponent's goal while defending their own. Expect aggressive play and precision handling.",
    objectiveQuote: "To build a robust, agile striker bot capable of dominating the arena and outscoring the opposition.",
    structuredSpecs: [
      { label: "MAX WEIGHT", value: "5 kg", sub: "Heavy duty frame" },
      { label: "DIMENSIONS", value: "300x300x300 mm", sub: "Max volume" },
      { label: "POWER", value: "Max 16-17V", sub: "No IC engines" },
      { label: "MECHANISM", value: "No Kickers", sub: "Clamps must be fixed" }
    ],
    arenaSpecs: [
      { label: "DIMENSIONS", value: "8.0ft x 5.0ft" },
      { label: "SURFACE", value: "Fully covered with artificial grass" },
      { label: "GOALPOSTS", value: "35cm width" }
    ],
    phases: [
      { id: "01", name: "PHASE 01: GROUP STAGE", subtitle: "OFFLINE // ROUND ROBIN", desc: "Teams face off in a mini-league. Win = 3pts, Draw = 1pt." },
      { id: "02", name: "PHASE 02: KNOCKOUTS", subtitle: "OFFLINE // ELIMINATION", desc: "High-stakes elimination bracket. 2 halves of 2 mins each." }
    ],
    bountyBreakdown: [
      { label: "CHAMPION (1ST)", value: "₹10,000" },
      { label: "RUNNER UP (2ND)", value: "₹6,000" },
      { label: "THIRD PLACE (3RD)", value: "₹4,000" }
    ],
    eligibility: "Open to all students.",
    specs: [
      "Size Limit: 300mm x 300mm x 300mm",
      "Weight: <= 5kg",
      "Control: Wired/wireless",
      "Power: Max 16 - 17V battery (No IC engines)",
      "Kicking mechanisms prohibited",
      "Clamps must be fully stationary — no motion, no actuation.",
      "Error: Of only 10% will be considered."
    ],
    rules: [
      "Match Format: 2 halves of 2 minutes each.",
      "Timeliness: Late arrivals may face elimination but can rejoin with a penalty.",
      "Teams switch sides after halftime.",
      "Tie-breaker (Golden Goal) if scores are tied.",
      "Controlled ramming allowed when opponent has the ball.",
      "Corner trapping for over 5 seconds results in a reset.",
      "Total of 1 minute repair time allowed in case of bot malfunctions."
    ],
    judgingCriteria: [
      "Goals Scored: Team with maximum goals wins."
    ],
    teamSize: "1-4 Members",
    fees: "₹500 / Team",
    prizePool: "₹20,000",
    color: "electric-purple"
  },
  {
    id: "line-follower",
    name: "LINE FOLLOWER",
    shortDescription: "Build an autonomous robot to track a black line on a white surface.",
    description: "Test your programming and sensor calibration skills! The Line Follower challenge requires an autonomous bot to navigate a complex track of black lines on a white arena. Expect sharp turns, crossovers, and challenging curves.",
    objectiveQuote: "To design an autonomous robot that follows a predefined line track with high accuracy and stability.",
    structuredSpecs: [
      { label: "MAX WEIGHT", value: "1.5 kg", sub: "Total robot mass" },
      { label: "DIMENSIONS", value: "< 250x220x100 mm", sub: "Compact design" },
      { label: "SENSORS", value: "IR / Optical", sub: "Only sensors allowed" },
      { label: "POWER", value: "Max 11-12V", sub: "With visible ON/OFF switch" }
    ],
    arenaSpecs: [
      { label: "DIMENSIONS", value: "8 ft x 12 ft (approx)" },
      { label: "TRACK", value: "20mm-30mm black line" },
      { label: "SURFACE", value: "Smooth matte finish (no reflections)" }
    ],
    phases: [
      { id: "01", name: "PHASE 01: ATTEMPT 1", subtitle: "OFFLINE // TIMED RUN", desc: "First attempt to navigate the track. Timer starts at the start line and stops at the finish line." },
      { id: "02", name: "PHASE 02: ATTEMPT 2", subtitle: "OFFLINE // TIMED RUN", desc: "Second attempt. The best timing among the two attempts will be considered." }
    ],
    bountyBreakdown: [
      { label: "PRECISION (1ST)", value: "₹12,000" },
      { label: "STABILITY (2ND)", value: "₹5,000" },
      { label: "VELOCITY (3RD)", value: "₹3,000" }
    ],
    eligibility: "Open to all students with a self-built robot. No pre-built carrier boards or kits will be allowed.",
    specs: [
      "Size Limit: Less than 250 mm x 220 mm (L x W), height < 100 mm.",
      "Weight: Maximum 1.5 KG (including battery).",
      "Control: Fully autonomous wireless bots.",
      "Power: Max 11 - 12 V battery.",
      "Sensors: IR or optical sensors only.",
      "Indicator: Must include a visible power ON/OFF switch.",
      "Error: Of only 10% will be considered."
    ],
    rules: [
      "The bot must strictly follow the black line.",
      "Deviating from the line/Off-track: +10 seconds penalty.",
      "Manual touch: +15 seconds penalty per touch.",
      "Skipping section: +30 seconds penalty.",
      "Restart: Allowed with +20 seconds penalty.",
      "Disqualification: Using remote/manual control or unsafe design."
    ],
    judgingCriteria: [
      "Speed: Time taken to complete the track after totaling penalty time.",
      "Accuracy: Stability and maneuverability of the bot.",
      "Completion: Successful navigation of all track segments."
    ],
    teamSize: "1-3 Members",
    fees: "₹600",
    prizePool: "₹20,000",
    color: "neon-cyan"
  },
  {
    id: "robo-sumo",
    name: "ROBO SUMO",
    shortDescription: "Two bots enter the ring, one bot leaves. Pure pushing power.",
    description: "The ultimate test of mechanical design and pushing power. Two robust, heavy-duty bots face off in a square arena. The sole objective is to force the opponent out of the bounds.",
    objectiveQuote: "Design the ultimate heavyweight pushing machine. Survive the Arena.",
    structuredSpecs: [
      { label: "MAX WEIGHT", value: "5 kg", sub: "Heavy duty frame" },
      { label: "DIMENSIONS", value: "300x300x300 mm", sub: "Strict bounds" },
      { label: "POWER", value: "Max 16-17V", sub: "High torque required" },
      { label: "WEAPONS", value: "None", sub: "Pushing & lifting only" }
    ],
    arenaSpecs: [
      { label: "DIMENSIONS", value: "8 ft x 8 ft Square Arena" },
      { label: "FORMAT", value: "1v1 knockout-style" }
    ],
    phases: [
      { id: "01", name: "PHASE 01: WEIGH-IN", subtitle: "OFFLINE // INSPECTION", desc: "Strict weight and dimension checks before entering the bracket." },
      { id: "02", name: "PHASE 02: BRAWL", subtitle: "OFFLINE // 3 MINS", desc: "Direct head-to-head push matches. First bot out loses the round." }
    ],
    bountyBreakdown: [
      { label: "GRAND CHAMPION", value: "₹12,000" },
      { label: "RUNNER UP", value: "₹8,000" },
      { label: "THIRD PLACE", value: "₹5,000" }
    ],
    eligibility: "Open to all students with a self-built robot that meets the event specifications.",
    specs: [
      "Size Limit: 300mm x 300mm x 300mm",
      "Weight: <= 5kg",
      "Control: Wired/wireless",
      "Power: Max 16 - 17V battery (No IC engines)",
      "Kicking mechanisms prohibited.",
      "Clamps must be fully stationary — no motion, no actuation.",
      "Error: Of only 10% will be considered."
    ],
    rules: [
      "Match Format: 3 minutes each.",
      "Timeliness: Late arrivals may face elimination but can rejoin with a penalty.",
      "Teams switch sides after halftime.",
      "Tie-breaker: (Golden Fight) if scores are tied.",
      "1v1 knockout-style matches held in a square arena (8 ft x 8 ft).",
      "Total of 1 minute repair time allowed in case of bot malfunctions."
    ],
    judgingCriteria: [
      "Bot Control & Maneuverability",
      "Aggression & Tactical Strategy",
      "Structural Stability & Responsiveness",
      "Judges' decisions are final."
    ],
    teamSize: "1-4 Members",
    fees: "₹500 / Team",
    prizePool: "₹25,000",
    color: "electric-purple"
  },
  {
    id: "hackathon",
    name: "HACKATHON",
    shortDescription: "A 24-hour hardware and software rapid prototyping challenge.",
    description: "Solve real-world problems using cutting-edge technology. The RANBHOOMI Hackathon is an intensive 24-hour sprint where teams design, prototype, and present innovative robotics, IoT, or AI solutions.",
    objectiveQuote: "Rapidly prototype a hardware or software solution that pushes the boundaries of innovation.",
    structuredSpecs: [
      { label: "DURATION", value: "24 Hours", sub: "Non-stop sprint" },
      { label: "DOMAIN", value: "Open", sub: "IoT, AI, Robotics" },
      { label: "EQUIPMENT", value: "BYOD", sub: "Bring your own devices" },
      { label: "TEAM", value: "2-4", sub: "Collaborative effort" }
    ],
    arenaSpecs: [
      { label: "LOCATION", value: "Main Workshop Hub" },
      { label: "PROVISIONS", value: "Power, Wi-Fi, Coffee" }
    ],
    phases: [
      { id: "01", name: "PHASE 01: IDEATION", subtitle: "OFFLINE // HOUR 1-4", desc: "Finalize problem statement and architecture. Mentor validation required." },
      { id: "02", name: "PHASE 02: DEVELOPMENT", subtitle: "OFFLINE // HOUR 5-20", desc: "Core coding and hardware assembly. Midnight progress check." },
      { id: "03", name: "PHASE 03: PITCH", subtitle: "OFFLINE // HOUR 21-24", desc: "Final touches and presentation to the judging panel." }
    ],
    bountyBreakdown: [
      { label: "BEST OVERALL", value: "₹25,000" },
      { label: "BEST HARDWARE", value: "₹15,000" },
      { label: "BEST SOFTWARE", value: "₹10,000" }
    ],
    eligibility: "Open to all students.",
    specs: [
      "Hardware/Software domains are open.",
      "Teams must bring their own components, laptops, and basic tools.",
      "Basic prototyping materials will be provided."
    ],
    rules: [
      "All code and prototypes must be built during the 24-hour timeframe.",
      "Use of open-source libraries is permitted, but pre-built proprietary solutions are not.",
      "Teams must present a working prototype to the judges."
    ],
    judgingCriteria: [
      "Innovation and Creativity",
      "Technical Complexity",
      "Practical Viability",
      "Presentation and Pitch"
    ],
    teamSize: "2-4 Members",
    fees: "₹800 / Team",
    prizePool: "₹50,000",
    color: "neon-cyan"
  }
];
