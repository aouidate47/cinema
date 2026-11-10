import type { Hall, Seat } from "@/types";

export type Camera = { x: number; y: number; z: number };
type V2 = [number, number];
type V3 = [number, number, number];
type RGB = [number, number, number];

const W = 400, H = 520, F = 190, YC = H * 0.4;
const BG: RGB = [18, 10, 12];
const DARK: RGB = [52, 28, 22];
const HAIR: RGB[] = [[26, 18, 16], [43, 29, 20], [58, 42, 28], [90, 70, 48], [14, 14, 18]];
const SKIN: RGB[] = [[224, 184, 150], [198, 140, 92], [141, 90, 59], [241, 211, 184]];
const CLOTH: RGB[] = [[59, 74, 107], [107, 59, 59], [59, 107, 79], [107, 90, 59], [74, 59, 107], [85, 85, 85], [34, 34, 40]];

const col = (c: RGB, m: number, f: number) =>
  "rgb(" + c.map((v, i) => Math.round(Math.min(255, v * m) * (1 - f) + BG[i] * f)).join(",") + ")";

/** Draws the screen onto `ctx` and returns SVG markup for the room and the seats. */
export function drawScene(
  hall: Hall, seats: Seat[], cam: Camera, look: number,
  ctx: CanvasRenderingContext2D, film: HTMLCanvasElement
): { room: string; seats: string } {
  const len = Math.hypot(cam.x, cam.z) || 1;
  const bx = -cam.x / len, bz = -cam.z / len, cl = Math.cos(look), sl = Math.sin(look);
  const fx = bx * cl - bz * sl, fz = bz * cl + bx * sl, rx = -fz, rz = fx;

  const P = (x: number, y: number, z: number): V3 => {
    const dx = x - cam.x, dz = z - cam.z, d = Math.max(0.3, dx * fx + dz * fz), l = dx * rx + dz * rz;
    return [W / 2 + (l / d) * F, YC - ((y - cam.y) / d) * F, d];
  };
  const pt = (a: V3[]) => a.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const dd = (p: V3) => (p[0] - cam.x) * fx + (p[2] - cam.z) * fz - 0.3;

  // polygon in world space, clipped at the camera so walls beside or behind you still draw
  const poly = (pts: V3[], fill: string) => {
    const c: V3[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], da = dd(a), db = dd(b);
      if (da >= 0) c.push(a);
      if (da >= 0 !== db >= 0) {
        const t = da / (da - db);
        c.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
      }
    }
    return c.length < 3 ? "" : '<polygon points="' + pt(c.map((p) => P(p[0], p[1], p[2]))) + '" fill="' + fill + '"/>';
  };

  const hasBal = hall.balFrom < hall.rows.length;
  const HX = 7.2, CH = 9;
  const ZB = Math.max(...seats.map((q) => q.z)) + 2.2;
  const ZL = hasBal ? hall.balWall : ZB;
  const ys = 0.18 / hall.rowPitch;
  const yl = (z: number) => (z - hall.firstRow) * ys;
  const yb2 = (z: number) => hall.balRise + (z - hall.balGap - hall.firstRow) * ys;

  const room =
    poly([[-HX, -1, -0.05], [HX, -1, -0.05], [HX, CH, -0.05], [-HX, CH, -0.05]], "#1d1013") +
    poly([[-HX, -1, 0], [-HX, -1, ZB], [-HX, CH, ZB], [-HX, CH, 0]], "#160c0e") +
    poly([[HX, -1, 0], [HX, -1, ZB], [HX, CH, ZB], [HX, CH, 0]], "#180d10") +
    poly([[-HX, -1, ZB], [HX, -1, ZB], [HX, CH, ZB], [-HX, CH, ZB]], "#22121a") +
    poly([[-HX, CH, 0], [HX, CH, 0], [HX, CH, ZB], [-HX, CH, ZB]], "#0c0607") +
    (hasBal ? poly([[-HX, yb2(ZL), ZL], [HX, yb2(ZL), ZL], [HX, yb2(ZB), ZB], [-HX, yb2(ZB), ZB]], "#0e0708") : "") +
    poly([[-HX, yl(0), 0], [HX, yl(0), 0], [HX, yl(ZL), ZL], [-HX, yl(ZL), ZL]], "#0f0809") +
    (hasBal && cam.z < ZL ? poly([[-HX, yl(ZL), ZL], [HX, yl(ZL), ZL], [HX, yb2(ZL), ZL], [-HX, yb2(ZL), ZL]], "#2b161b") : "");

  // curved screen: the film image is cut into thin strips, each placed on the curve
  {
    const K = 2, sw0 = film.width, sh0 = film.height, N = 44;
    const top = hall.screenBottom + hall.screenH, bottom = hall.screenBottom;
    const X = (u: number) => (u - 0.5) * hall.screenW;
    const Zc = (u: number) => hall.screenCurve * Math.pow(2 * u - 1, 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N;
      const A = P(X(u0), top, Zc(u0)), B = P(X(u1), top, Zc(u1));
      const D = P(X(u0), bottom, Zc(u0)), E = P(X(u1), bottom, Zc(u1));
      if (A[2] < 0.32 || B[2] < 0.32 || D[2] < 0.32 || E[2] < 0.32) continue;
      const sx = u0 * sw0, sw = sw0 / N, w = Math.min(sw + 1.5, sw0 - sx);
      ctx.setTransform(
        (K * (B[0] - A[0])) / sw, (K * (B[1] - A[1])) / sw,
        (K * (D[0] - A[0])) / sh0, (K * (D[1] - A[1])) / sh0,
        K * A[0], K * A[1]
      );
      ctx.drawImage(film, sx, 0, w, sh0, 0, 0, w, sh0);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // 3D box: draws only the faces the camera can see
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: RGB, f: number) => {
    let r = "";
    const q = (p: V3[], m: number) => { r += '<polygon points="' + pt(p) + '" fill="' + col(c, m, f) + '"/>'; };
    const V = P;
    if (cam.y > y1) q([V(x0, y1, z0), V(x1, y1, z0), V(x1, y1, z1), V(x0, y1, z1)], 1.3);
    if (cam.z > z1) q([V(x0, y0, z1), V(x1, y0, z1), V(x1, y1, z1), V(x0, y1, z1)], 1);
    if (cam.z < z0) q([V(x0, y0, z0), V(x1, y0, z0), V(x1, y1, z0), V(x0, y1, z0)], 0.8);
    if (cam.x < x0) q([V(x0, y0, z0), V(x0, y0, z1), V(x0, y1, z1), V(x0, y1, z0)], 0.65);
    if (cam.x > x1) q([V(x1, y0, z0), V(x1, y0, z1), V(x1, y1, z1), V(x1, y1, z0)], 0.55);
    return r;
  };

  // rounded profile (rounded rectangle) extruded between two planes
  const rr = (u0: number, u1: number, v0: number, v1: number, rt: number, rb: number): V2[] => {
    const p: V2[] = [];
    const arc = (cu: number, cv: number, q: number, a0: number) => {
      for (let k = 0; k < 3; k++) {
        const a = ((a0 + k * 45) * Math.PI) / 180;
        p.push([cu + q * Math.cos(a), cv + q * Math.sin(a)]);
      }
    };
    arc(u1 - rb, v0 + rb, rb, -90); arc(u1 - rt, v1 - rt, rt, 0);
    arc(u0 + rt, v1 - rt, rt, 90); arc(u0 + rb, v0 + rb, rb, 180);
    return p;
  };
  const ext = (
    prof: V2[], pos: (u: number, v: number, w: number) => V3, cn: [V3, V3],
    side: (a: number, b: number) => V3, c: RGB, f: number
  ) => {
    let r = "";
    const n = prof.length;
    const q = (u: number, v: number, w: number) => { const p = pos(u, v, w); return P(p[0], p[1], p[2]); };
    const vis = (wn: V3, p: V3) => wn[0] * (cam.x - p[0]) + wn[1] * (cam.y - p[1]) + wn[2] * (cam.z - p[2]) > 0;
    const sd = (wn: V3) => 0.55 + 0.75 * Math.max(0, wn[1]) + 0.45 * Math.max(0, wn[2]) + 0.2 * Math.max(0, -wn[2]);
    [0, 1].forEach((w) => {
      if (vis(cn[w], pos(prof[0][0], prof[0][1], w)))
        r += '<polygon points="' + pt(prof.map((a) => q(a[0], a[1], w))) + '" fill="' + col(c, sd(cn[w]), f) + '"/>';
    });
    for (let i = 0; i < n; i++) {
      const a = prof[i], b = prof[(i + 1) % n], eu = b[0] - a[0], ev = b[1] - a[1], l = Math.hypot(eu, ev) || 1;
      const wn = side(ev / l, -eu / l);
      if (!vis(wn, pos(a[0], a[1], 0))) continue;
      r += '<polygon points="' + pt([q(a[0], a[1], 0), q(b[0], b[1], 0), q(b[0], b[1], 1), q(a[0], a[1], 1)]) +
        '" fill="' + col(c, sd(wn), f) + '"/>';
    }
    return r;
  };

  let out = '<g stroke="#1a0507" stroke-opacity=".55" stroke-width=".5" stroke-linejoin="round">';
  seats
    .map((s) => {
      const dx = s.x - cam.x, dz = s.z - cam.z;
      return { s, d: dx * fx + dz * fz, l: dx * rx + dz * rz };
    })
    .filter((q) => q.d > 0.7)
    .sort((a, b) => b.d - a.d)
    .forEach(({ s, d, l }) => {
      const cx = W / 2 + (l * F) / d;
      if (cx < -150 || cx > 550) return;
      const f = Math.min(0.55, Math.max(0, (d - 4) / 22));
      const B: RGB = s.rec ? [122, 63, 176] : s.bal ? [201, 154, 46] : [212, 32, 42];
      const X = s.x, Z = s.z, y = s.y;
      const idx = s.r * 14 + s.n, px = X + ((idx % 3) - 1) * 0.03;

      // people in taken seats: body + head (hair from behind, face from the front)
      const person = () => {
        let q = box(px - 0.23, px + 0.23, y + 0.5, y + 1.15, Z - 0.3, Z - 0.06, CLOTH[(idx * 3 + 1) % 7], f);
        const h = P(px, y + 1.3, Z - 0.16);
        if (h[2] > 0.31)
          q += '<circle cx="' + h[0].toFixed(1) + '" cy="' + h[1].toFixed(1) + '" r="' + ((0.125 * F) / h[2]).toFixed(1) +
            '" fill="' + col(cam.z < Z - 0.16 ? SKIN[idx % 4] : HAIR[idx % 5], 1, f) + '"/>';
        return q;
      };
      const pr = s.taken ? person() : "";
      const withBack = (bk: string) => (cam.z < Z ? bk + pr : pr + bk);

      if (d < 4.5) {
        // near seats: rounded cinema chair
        const zf = (u: number, v: number, w: number): V3 => [u, v, w ? Z + 0.04 : Z - 0.46];
        const xs: [V3, V3] = [[0, 0, -1], [0, 0, 1]];
        const nz = (a: number, b: number): V3 => [a, b, 0];
        out +=
          box(X - 0.05, X + 0.05, y, y + 0.35, Z - 0.3, Z - 0.1, DARK, f) +
          ext(rr(Z - 0.5, Z + 0.04, y + 0.35, y + 0.5, 0.06, 0.02),
            (u, v, w): V3 => [w ? X + 0.25 : X - 0.25, v, u], [[-1, 0, 0], [1, 0, 0]],
            (a, b): V3 => [0, b, a], B, f) +
          ext(rr(X - 0.275, X - 0.21, y + 0.5, y + 0.64, 0.03, 0.01), zf, xs, nz, DARK, f) +
          ext(rr(X + 0.21, X + 0.275, y + 0.5, y + 0.64, 0.03, 0.01), zf, xs, nz, DARK, f) +
          withBack(ext(rr(X - 0.25, X + 0.25, y + 0.35, y + 1.1, 0.15, 0.03),
            (u, v, w): V3 => [u, v, w ? Z + 0.12 : Z - 0.02], xs, nz, B, f));
      } else {
        // far seats: simple blocks
        out +=
          box(X - 0.25, X + 0.25, y + 0.35, y + 0.5, Z - 0.5, Z + 0.04, B, f) +
          (d < 9
            ? box(X - 0.275, X - 0.21, y + 0.5, y + 0.64, Z - 0.46, Z + 0.04, DARK, f) +
              box(X + 0.21, X + 0.275, y + 0.5, y + 0.64, Z - 0.46, Z + 0.04, DARK, f)
            : "") +
          withBack(box(X - 0.25, X + 0.25, y + 0.35, y + 1.1, Z - 0.02, Z + 0.12, B, f));
      }
    });
  out += "</g>";
  return { room, seats: out };
}