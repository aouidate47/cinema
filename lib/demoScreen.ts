export const FILM_W = 1200;
export const FILM_H = 520;

export function createFilmCanvas(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = FILM_W;
  c.height = FILM_H;
  paintDemo(c);
  return c;
}

export function paintDemo(c: HTMLCanvasElement) {
  const g = c.getContext("2d");
  if (!g) return;
  const W = FILM_W, H = FILM_H;
  let q: CanvasGradient = g.createLinearGradient(0, 0, 0, H);
  q.addColorStop(0, "#2a2a52"); q.addColorStop(0.45, "#c8644c");
  q.addColorStop(0.7, "#f2b97a"); q.addColorStop(1, "#f6d9a4");
  g.fillStyle = q; g.fillRect(0, 0, W, H);

  q = g.createRadialGradient(780, 300, 6, 780, 300, 260);
  q.addColorStop(0, "rgba(255,244,214,1)"); q.addColorStop(0.12, "rgba(255,226,170,.9)");
  q.addColorStop(1, "rgba(255,200,140,0)");
  g.fillStyle = q; g.fillRect(0, 0, W, H);

  const dy = (y: number, a: number, x: number) => y + a * Math.sin(x / 170 + y) + a * 0.5 * Math.sin(x / 61 + y * 2);
  const dune = (y: number, a: number, color: string) => {
    g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 20) g.lineTo(x, dy(y, a, x));
    g.lineTo(W, H); g.closePath(); g.fillStyle = color; g.fill();
  };
  dune(330, 28, "#b9744a"); dune(380, 34, "#9a5a3a");
  const wy = dy(380, 34, 470);
  g.fillStyle = "#1a0d0a"; g.beginPath(); g.arc(470, wy - 34, 5, 0, 7); g.fill(); g.fillRect(465, wy - 30, 10, 32);
  dune(430, 30, "#6e3a2c"); dune(480, 22, "#3a1d1a");

  q = g.createLinearGradient(0, 300, 0, H);
  q.addColorStop(0, "rgba(255,200,150,.18)"); q.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = q; g.fillRect(0, 300, W, 220);
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = "rgba(0,0,0,.06)";
    g.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
  }
}

export function drawCover(c: HTMLCanvasElement, im: HTMLImageElement) {
  const g = c.getContext("2d");
  if (!g) return;
  const k = Math.max(FILM_W / im.width, FILM_H / im.height);
  const w = im.width * k, h = im.height * k;
  g.fillStyle = "#000"; g.fillRect(0, 0, FILM_W, FILM_H);
  g.drawImage(im, (FILM_W - w) / 2, (FILM_H - h) / 2, w, h);
}