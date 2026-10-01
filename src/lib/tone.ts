import type { BadgeTone } from "@/components/Badge/Badge";
import type { Pace } from "./types";

export function toneForPace(pace: Pace): BadgeTone {
  if (pace === "Competitive") return "rust";
  if (pace === "Steady") return "gold";
  return "forest";
}

export function toneForCompetitiveOrCasual(value: string): BadgeTone {
  return value === "Competitive" ? "rust" : "forest";
}

export function toneForVerified(verified: boolean): BadgeTone {
  return verified ? "forest" : "ink";
}
