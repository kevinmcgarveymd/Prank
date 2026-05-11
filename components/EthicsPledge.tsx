"use client";

import { useEthicsPledge } from "@/lib/useEthicsPledge";
import { PRANK_CATALOG } from "@/lib/catalog";

export function EthicsPledge() {
  const { accepted, accept } = useEthicsPledge();

  if (accepted === null || accepted) return null;

  return (
    <div className="pledge-overlay" role="dialog" aria-modal="true">
      <div className="pledge-card">
        <h2>The Prank Pledge</h2>
        <p>Before you start pranking, agree to the rules of kind pranking.</p>
        <ul>
          {PRANK_CATALOG.ethics_rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <button className="pledge-btn" onClick={accept}>
          I Promise — Let&apos;s Prank!
        </button>
      </div>
    </div>
  );
}
