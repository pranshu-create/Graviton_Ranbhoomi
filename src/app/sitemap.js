export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ranbhoomi.tech";
  const now = new Date();

  const routes = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/register", priority: 0.9, changeFrequency: "daily" },
    { path: "/events", priority: 0.9, changeFrequency: "weekly" },
    { path: "/events/robo-race", priority: 0.8, changeFrequency: "weekly" },
    { path: "/events/robo-soccer", priority: 0.8, changeFrequency: "weekly" },
    { path: "/events/line-follower", priority: 0.8, changeFrequency: "weekly" },
    { path: "/events/robo-sumo", priority: 0.8, changeFrequency: "weekly" },
    { path: "/events/hackathon", priority: 0.8, changeFrequency: "weekly" },
    { path: "/live", priority: 0.8, changeFrequency: "daily" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/gallery", priority: 0.7, changeFrequency: "weekly" },
    { path: "/resources", priority: 0.7, changeFrequency: "monthly" },
    { path: "/sponsors", priority: 0.6, changeFrequency: "monthly" },
    { path: "/team", priority: 0.6, changeFrequency: "monthly" },
    { path: "/comm-center", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.5, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.5, changeFrequency: "yearly" },
    { path: "/refund", priority: 0.5, changeFrequency: "yearly" },
    { path: "/cookies", priority: 0.5, changeFrequency: "yearly" },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
