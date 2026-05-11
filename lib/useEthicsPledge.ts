"use client";

import { useEffect, useState } from "react";

const KEY = "prank-pledge-v1";

export function useEthicsPledge() {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setAccepted(localStorage.getItem(KEY) === "true");
    } catch {
      setAccepted(false);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(KEY, "true");
    } catch {}
    setAccepted(true);
  };

  return { accepted, accept };
}
