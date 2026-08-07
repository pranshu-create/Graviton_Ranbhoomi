# Team Photo & Roster Upload Protocol

When your final team rosters and photos are ready to be integrated into the Graviton Robotics website, you will need to provide the data in the following structured format. This ensures that the frontend React components can seamlessly map the photos and names.

## Step 1: Prepare the Images
1. **Aspect Ratio:** Ensure all individual photos are cropped to a **1:1 square ratio** (e.g., 500x500px).
2. **Format:** WebP or JPG preferred for fast loading.
3. **Naming Convention:** Name the files exactly as the member's first name in lowercase (e.g., `pranshu.jpg`, `neer.jpg`, `atharva.jpg`).
4. **Where to place them:** When ready, these images should be placed in the `public/team/` directory of the project.

## Step 2: The Data Format (JSON Array)
You will need to provide the team data in a JSON array format (or just send me the text in this structure). This data will be injected into `src/data/team.js` or directly into the MongoDB if you move to a dynamic CMS.

```javascript
[
  {
    "id": "president",
    "name": "Pranshu Sharma",
    "role": "President",
    "image": "/team/pranshu.jpg",
    "social": {
      "linkedin": "https://linkedin.com/in/pranshusharma",
      "instagram": "https://instagram.com/pranshu"
    }
  },
  {
    "id": "vp",
    "name": "Neer Jain",
    "role": "Vice President",
    "image": "/team/neer.jpg",
    "social": {
      "linkedin": "https://linkedin.com/in/neerjain",
      "instagram": "https://instagram.com/neer"
    }
  },
  // Add Event Heads and other members below...
]
```

## How to Submit to AI
When you have the data ready, simply give me the photos (or upload them yourself to the `public/team/` folder) and paste a list like this:
*   Name: Atharva
*   Role: Core Committee
*   Image: atharva.jpg
*   LinkedIn: ...

I will automatically generate the code and build the "Team Roster" page for you!
