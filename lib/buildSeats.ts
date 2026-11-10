import type { Hall, Seat, Show } from "@/types";

function rng(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export function buildSeats(hall: Hall, show: Show): Seat[] {
  const rand = rng(show.seed * 977 + 13 + hall.rows.length * 101);
  const seats: Seat[] = [];
  hall.rows.forEach((l, r) => {
    const raw: number[] = [];
    let i = 0;
    (hall.rowLayouts?.[r] ?? hall.layout).forEach((n, block) => {
      for (let k = 0; k < n; k++) {
        raw.push(i * hall.seatPitch + block * hall.aisle);
        i++;
      }
    });
    const mid = (raw[0] + raw[raw.length - 1]) / 2;

    raw.forEach((x, c) => {
      const bal = r >= hall.balFrom;
      const rec = !bal && r >= hall.recFrom;
      seats.push({
        id: l + (c + 1),
        l,
        r,
        n: c + 1,
        x: x - mid,
        z: hall.firstRow + r * hall.rowPitch + (bal ? hall.balGap : 0),
        y: r * hall.rise + (bal ? hall.balRise : 0),
        rec,
        bal,
        price: bal ? hall.priceBal : rec ? hall.priceRec : hall.priceStd,
        taken: rand() < 0.36,
      });
    });
  });

  const b4 = seats.find((s) => s.id === "B4");
  if (b4) b4.taken = false; // always keep one seat free for the demo
  return seats;
}