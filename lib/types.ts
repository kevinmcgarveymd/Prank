export type PrankTarget =
  | "self"
  | "sibling"
  | "parent"
  | "family"
  | "anyone";

export type PrankSetting = "home" | "school";

export type PrankCategory =
  | "visual"
  | "sound"
  | "food"
  | "written"
  | "verbal"
  | "physical"
  | "tech"
  | "outfit"
  | "gift"
  | "kindness"
  | "bathroom"
  | "trick"
  | "self";

export interface Prank {
  id: number;
  title: string;
  category: PrankCategory;
  target: PrankTarget[];
  setting: PrankSetting[];
  age_range: string;
  time_of_day: string;
  duration_minutes: number;
  materials: string[];
  ethics_score: number;
  description: string;
  steps: string[];
}

export interface PrankCall {
  id: number;
  title: string;
  script: string;
  reveal_after_seconds: number;
  target: string;
  ethics_score: number;
}

export interface PrankCatalog {
  version: number;
  ethics_rules: string[];
  pranks: Prank[];
  prank_calls: PrankCall[];
  moderation_notes: {
    rejected_categories: string[];
    review_required_before_publishing: boolean;
  };
}
