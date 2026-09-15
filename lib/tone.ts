import type { BadgeTone } from "@/components/Badge/Badge";
import type { Pace, Visibility } from "./types";

export function toneForPace(pace: Pace): BadgeTone {
  if (pace === "Competitive") return "rust";
  if (pace === "Steady") return "gold";
  return "forest";
}

export function toneForVisibility(visibility: Visibility): BadgeTone {
  return visibility === "Private" ? "rust" : "forest";
}
