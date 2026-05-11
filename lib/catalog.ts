import catalog from "@/data/pranks.json";
import type { PrankCatalog } from "./types";

export const PRANK_CATALOG = catalog as unknown as PrankCatalog;

export const MIN_ETHICS_SCORE = 7;

export function getPublishablePranks() {
  return PRANK_CATALOG.pranks.filter((p) => p.ethics_score >= MIN_ETHICS_SCORE);
}
