export type Hall = {
  slug: string;
  name: string;
  layout: number[]; // seats per block, e.g. [3, 8, 3]
  rows: string[];
  recFrom: number; // first recliner row index
  balFrom: number; // first balcony row index (>= rows.length means no balcony)
  balGap: number;
  balRise: number;
  balWall: number;
  screenW: number;
  screenCurve: number;
  screenH: number;
  screenBottom: number;
  firstRow: number;
  rowPitch: number;
  seatPitch: number;
  aisle: number;
  rise: number;
  eye: number;
  priceStd: number;
  priceRec: number;
  priceBal: number;
};

export type Show = {
  id: string;
  time: string;
  format: string;
  seed: number;
};

export type Seat = {
  id: string;
  l: string; // row letter
  r: number; // row index
  n: number; // seat number
  x: number;
  y: number;
  z: number;
  rec: boolean;
  bal: boolean;
  price: number;
  taken: boolean;
};