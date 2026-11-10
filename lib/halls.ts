import type { Hall } from "@/types";

// Replace these placeholders with measured values per real cinema (metres, DH).
export const HALLS: Hall[] = [
  {
    slug: "hall-3", name: "Hall 3", layout: [3, 8, 3],
    rowLayouts: [
      [2, 8, 2], [2, 9, 2], [3, 8, 3], [3, 9, 3], [4, 8, 4],
      [4, 9, 4], [5, 8, 5], [6, 8, 6], [6, 8, 6], [6, 8, 6], [6, 8, 6], [6, 8, 6],
    ],
    rows: "ABCDEFGHIJKL".split(""), recFrom: 7, balFrom: 9,
    balGap: 1.6, balRise: 1.4, balWall: 15,
    screenW: 11.4, screenCurve: 0.7, screenH: 4.95, screenBottom: 1.6,
    firstRow: 5, rowPitch: 1.1, seatPitch: 0.55, aisle: 1, rise: 0.24, eye: 1.15,
    priceStd: 45, priceRec: 70, priceBal: 50,
  },
];

export const getHall = (slug: string) => HALLS.find((h) => h.slug === slug);
