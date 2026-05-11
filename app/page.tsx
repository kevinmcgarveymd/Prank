"use client";

import { useState } from "react";
import { EthicsPledge } from "@/components/EthicsPledge";
import { PrankBrowser } from "@/components/PrankBrowser";
import { PrankCalls } from "@/components/PrankCalls";
import { getPublishablePranks, PRANK_CATALOG } from "@/lib/catalog";

type Tab = "pranks" | "calls";

export default function Home() {
  const [tab, setTab] = useState<Tab>("pranks");
  const pranks = getPublishablePranks();

  return (
    <main className="container">
      <EthicsPledge />
      <header className="hero">
        <h1>🎉 Prank Lab</h1>
        <p>Kind pranks that make everyone laugh.</p>
      </header>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          className={`tab ${tab === "pranks" ? "active" : ""}`}
          onClick={() => setTab("pranks")}
        >
          Browse Pranks
        </button>
        <button
          role="tab"
          className={`tab ${tab === "calls" ? "active" : ""}`}
          onClick={() => setTab("calls")}
        >
          Prank Calls
        </button>
      </div>

      {tab === "pranks" ? (
        <PrankBrowser pranks={pranks} />
      ) : (
        <PrankCalls calls={PRANK_CATALOG.prank_calls} />
      )}
    </main>
  );
}
