import type { Show } from "@/types";

export const SHOWS: Show[] = [
  { id: "1730", time: "17:30", format: "2D", seed: 3 },
  { id: "1945", time: "19:45", format: "IMAX", seed: 7 },
  { id: "2215", time: "22:15", format: "2D", seed: 11 },
];

export const getShow = (id: string) => SHOWS.find((s) => s.id === id);