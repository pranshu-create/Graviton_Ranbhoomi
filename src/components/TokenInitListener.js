"use client";

import { useEffect } from "react";

export default function TokenInitListener() {
  useEffect(() => {
    // Call the init-token API to generate the DDoS guard token
    fetch("/api/system/init-token").catch((err) => {
      console.error("Failed to initialize system guard:", err);
    });
  }, []);

  return null;
}
