import type { Hall, Seat } from "@/types";

export type Camera = { x: number; y: number; z: number };
type V2 = [number, number];
type V3 = [number, number, number];
type RGB = [number, number, number];

const W = 400, H = 520, F = 190, YC = H * 0.4;
const BG: RGB = [18, 10, 12];
const DARK: RGB = [52, 28, 22];

const col = (c: RGB, m: number, f: number) =>
  "rgb(" + c.map((v, i) => Math.round(Math.min(255, v * m) * (1 - f) + BG[i] * f)).join(",") + ")";

/** Draws the screen onto ctx and returns SVG markup for the room and the seats. */
export function drawScene(
  hall: Hall, seats: Seat[], cam: Camera, look: number,
  ctx: CanvasRenderingContext2D, film: HTMLCanvasElement,
  opts: { zoom?: number; mark?: { seat: Seat; a: number; pulse: number } } = {}
): { room: string; seats: string } {
  const len = Math.hypot(cam.x, cam.z) || 1;
  const bx = -cam.x / len, bz = -cam.z / len, cl = Math.cos(look), sl = Math.sin(look);
  const fx = bx * cl - bz * sl, fz = bz * cl + bx * sl, rx = -fz, rz = fx;
  const Fz = F * (opts.zoom ?? 1);
  const P = (x: number, y: number, z: number): V3 => {
    const dx = x - cam.x, dz = z - cam.z, d = Math.max(0.3, dx * fx + dz * fz), l = dx * rx + dz * rz;
    return [W / 2 + (l / d) * Fz, YC - ((y - cam.y) / d) * Fz, d];
  };
  const pt = (a: V3[]) => a.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const dd = (p: V3) => (p[0] - cam.x) * fx + (p[2] - cam.z) * fz - 0.3;

  const poly = (pts: V3[], fill: string) => {
    const c: V3[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], da = dd(a), db = dd(b);
      if (da >= 0) c.push(a);
      if ((da >= 0) !== (db >= 0)) {
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
  const entrance = seats.find((seat) => seat.id === "I20");
  const door = entrance ? (() => {
    const x = HX - 0.02, z = entrance.z, y = entrance.y;
    const frame = poly([[x,y,z-.82],[x,y+2.35,z-.82],[x,y+2.35,z+.82],[x,y,z+.82]], "#a36b45");
    const opening = poly([[x-.01,y+.08,z-.68],[x-.01,y+2.2,z-.68],[x-.01,y+2.2,z+.68],[x-.01,y+.08,z+.68]], "#090708");
    const panel = poly([[x-.02,y+.12,z-.61],[x-.02,y+2.12,z-.61],[x-.02,y+2.12,z+.58],[x-.02,y+.12,z+.58]], "#492a29");
    const knob = P(x-.03,y+1.05,z-.43), sign = P(x-.03,y+2.58,z);
    return frame + opening + panel +
      '<circle cx="' + knob[0].toFixed(1) + '" cy="' + knob[1].toFixed(1) + '" r="2.5" fill="#d0a45f"/>' +
      '<text x="' + sign[0].toFixed(1) + '" y="' + sign[1].toFixed(1) + '" text-anchor="middle" font-size="9" font-weight="700" font-family="Inter,system-ui,sans-serif" fill="#f4ede1">EXIT</text>';
  })() : "";

  const stairs = [-1, 1].map((side) => {
    const x0 = side < 0 ? -HX + 0.15 : HX - 0.85, x1 = side < 0 ? -HX + 0.85 : HX - 0.15;
    let markup = "";
    const step = (z0: number, z1: number, y0: number, y1: number) => {
      if (z1 <= z0 || y1 <= y0) return;
      markup += poly([[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]], "#38272a");
      markup += poly([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]], "#594247");
    };
    const lowerRows = Math.min(hall.balFrom, hall.rows.length);
    for (let row = 0; row < lowerRows; row++) {
      const z0 = hall.firstRow + row * hall.rowPitch;
      step(z0, z0 + hall.rowPitch, row * hall.rise, (row + 1) * hall.rise);
    }
    if (hasBal && hall.balFrom > 0) {
      const lastLower = seats.find((seat) => seat.r === hall.balFrom - 1);
      const firstBalcony = seats.find((seat) => seat.r === hall.balFrom);
      if (lastLower && firstBalcony) {
        const count = 8, startZ = hall.firstRow + hall.balFrom * hall.rowPitch;
        for (let i = 0; i < count; i++) step(
          startZ + (firstBalcony.z - startZ) * (i / count),
          startZ + (firstBalcony.z - startZ) * ((i + 1) / count),
          lastLower.y + (firstBalcony.y - lastLower.y) * (i / count),
          lastLower.y + (firstBalcony.y - lastLower.y) * ((i + 1) / count)
        );
      }
      for (let row = hall.balFrom; row < hall.rows.length; row++) {
        const current = seats.find((seat) => seat.r === row);
        if (!current) continue;
        const next = seats.find((seat) => seat.r === row + 1);
        step(current.z, current.z + hall.rowPitch, current.y, next?.y ?? current.y + hall.rise);
      }
    }
    return markup;
  }).join("");

  const room =
    poly([[-HX,-1,-.05],[HX,-1,-.05],[HX,CH,-.05],[-HX,CH,-.05]], "#1d1013") +
    poly([[-HX,-1,0],[-HX,-1,ZB],[-HX,CH,ZB],[-HX,CH,0]], "#160c0e") +
    poly([[HX,-1,0],[HX,-1,ZB],[HX,CH,ZB],[HX,CH,0]], "#180d10") +
    poly([[-HX,-1,ZB],[HX,-1,ZB],[HX,CH,ZB],[-HX,CH,ZB]], "#22121a") +
    poly([[-HX,CH,0],[HX,CH,0],[HX,CH,ZB],[-HX,CH,ZB]], "#0c0607") +
    (hasBal ? poly([[-HX,yb2(ZL),ZL],[HX,yb2(ZL),ZL],[HX,yb2(ZB),ZB],[-HX,yb2(ZB),ZB]], "#0e0708") : "") +
    poly([[-HX,yl(0),0],[HX,yl(0),0],[HX,yl(ZL),ZL],[-HX,yl(ZL),ZL]], "#0f0809") +
    (hasBal && cam.z < ZL ? poly([[-HX,yl(ZL),ZL],[HX,yl(ZL),ZL],[HX,yb2(ZL),ZL],[-HX,yb2(ZL),ZL]], "#2b161b") : "") +
    stairs + door;

  // Curved cinema screen, rendered as narrow perspective-mapped strips.
  {
    const K = 2, sw0 = film.width, sh0 = film.height, N = 44;
    const top = hall.screenBottom + hall.screenH, bottom = hall.screenBottom;
    const X = (u: number) => (u - 0.5) * hall.screenW;
    const Zc = (u: number) => hall.screenCurve * Math.pow(2 * u - 1, 2);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    for (let i = 0; i < N; i++) {
      const u0 = i/N, u1 = (i+1)/N;
      const A = P(X(u0),top,Zc(u0)), B = P(X(u1),top,Zc(u1));
      const D = P(X(u0),bottom,Zc(u0)), E = P(X(u1),bottom,Zc(u1));
      if (A[2] < .32 || B[2] < .32 || D[2] < .32 || E[2] < .32) continue;
      const sx = u0*sw0, sw = sw0/N, w = Math.min(sw+1.5,sw0-sx);
      ctx.setTransform((K*(B[0]-A[0]))/sw,(K*(B[1]-A[1]))/sw,(K*(D[0]-A[0]))/sh0,(K*(D[1]-A[1]))/sh0,K*A[0],K*A[1]);
      ctx.drawImage(film,sx,0,w,sh0,0,0,w,sh0);
    }
    ctx.setTransform(1,0,0,1,0,0);
  }

  const box = (x0:number,x1:number,y0:number,y1:number,z0:number,z1:number,c:RGB,f:number) => {
    let r = "";
    const q = (p:V3[],m:number) => { r += '<polygon points="' + pt(p.map(v => P(v[0],v[1],v[2]))) + '" fill="' + col(c,m,f) + '"/>'; };
    const V = (x:number,y:number,z:number):V3 => [x,y,z];
    if (cam.y > y1) q([V(x0,y1,z0),V(x1,y1,z0),V(x1,y1,z1),V(x0,y1,z1)],1.3);
    if (cam.z > z1) q([V(x0,y0,z1),V(x1,y0,z1),V(x1,y1,z1),V(x0,y1,z1)],1);
    if (cam.z < z0) q([V(x0,y0,z0),V(x1,y0,z0),V(x1,y1,z0),V(x0,y1,z0)],.8);
    if (cam.x < x0) q([V(x0,y0,z0),V(x0,y0,z1),V(x0,y1,z1),V(x0,y1,z0)],.65);
    if (cam.x > x1) q([V(x1,y0,z0),V(x1,y0,z1),V(x1,y1,z1),V(x1,y1,z0)],.55);
    return r;
  };

  // Rounded upholstered profiles, extruded to give each chair real volume.
  const rr = (u0:number,u1:number,v0:number,v1:number,rt:number,rb:number):V2[] => {
    const p:V2[] = [];
    const arc = (cu:number,cv:number,q:number,a0:number) => {
      for (let k=0;k<3;k++) { const a=((a0+k*45)*Math.PI)/180; p.push([cu+q*Math.cos(a),cv+q*Math.sin(a)]); }
    };
    arc(u1-rb,v0+rb,rb,-90); arc(u1-rt,v1-rt,rt,0);
    arc(u0+rt,v1-rt,rt,90); arc(u0+rb,v0+rb,rb,180);
    return p;
  };
  const ext = (prof:V2[],pos:(u:number,v:number,w:number)=>V3,cn:[V3,V3],side:(a:number,b:number)=>V3,c:RGB,f:number) => {
    let r = ""; const n=prof.length;
    const q = (u:number,v:number,w:number) => { const p=pos(u,v,w); return P(p[0],p[1],p[2]); };
    const vis = (wn:V3,p:V3) => wn[0]*(cam.x-p[0])+wn[1]*(cam.y-p[1])+wn[2]*(cam.z-p[2])>0;
    const sd = (wn:V3) => .55+.75*Math.max(0,wn[1])+.45*Math.max(0,wn[2])+.2*Math.max(0,-wn[2]);
    [0,1].forEach(w => { if (vis(cn[w],pos(prof[0][0],prof[0][1],w))) r += '<polygon points="' + pt(prof.map(a=>q(a[0],a[1],w))) + '" fill="' + col(c,sd(cn[w]),f) + '"/>'; });
    for (let i=0;i<n;i++) {
      const a=prof[i],b=prof[(i+1)%n],eu=b[0]-a[0],ev=b[1]-a[1],l=Math.hypot(eu,ev)||1,wn=side(ev/l,-eu/l);
      if (!vis(wn,pos(a[0],a[1],0))) continue;
      r += '<polygon points="' + pt([q(a[0],a[1],0),q(b[0],b[1],0),q(b[0],b[1],1),q(a[0],a[1],1)]) + '" fill="' + col(c,sd(wn),f) + '"/>';
    }
    return r;
  };

  let out = '<g stroke="#1a0507" stroke-opacity=".55" stroke-width=".5" stroke-linejoin="round">';
  seats.map(s => {
    const dx=s.x-cam.x,dz=s.z-cam.z;
    return {s,d:dx*fx+dz*fz,l:dx*rx+dz*rz};
  }).filter(q=>q.d>.7).sort((a,b)=>b.d-a.d).forEach(({s,d,l}) => {
    const cx=W/2+(l*Fz)/d;
    if (cx < -150 || cx > 550) return;
    const f=Math.min(.55,Math.max(0,(d-4)/22));
    const B:RGB=s.rec?[122,63,176]:s.bal?[201,154,46]:[212,32,42];
    const X=s.x,Z=s.z,y=s.y;
    const zf=(u:number,v:number,w:number):V3=>[u,v,w?Z+.055:Z-.47];
    const xs:[V3,V3]=[[0,0,-1],[0,0,1]];
    const nz=(a:number,b:number):V3=>[a,b,0];

    // Every row uses the same upholstered chair model: padded back, thick seat,
    // substantial black armrests, and a dark central pedestal/base.
    const pedestal = box(X-.065,X+.065,y+.02,y+.36,Z-.28,Z-.08,DARK,f);
    const backShell = ext(rr(X-.27,X+.27,y+.38,y+1.13,.16,.035),
      (u,v,w):V3=>[u,v,w?Z+.14:Z+.015],xs,nz,B,f);
    const seatCushion = ext(rr(Z-.51,Z+.055,y+.34,y+.53,.075,.035),
      (u,v,w):V3=>[w?X+.265:X-.265,v,u],[[0,0,-1],[0,0,1]],
      (a,b):V3=>[0,b,a],B,f);
    const armL = ext(rr(X-.31,X-.205,y+.49,y+.68,.045,.025),zf,xs,nz,DARK,f);
    const armR = ext(rr(X+.205,X+.31,y+.49,y+.68,.045,.025),zf,xs,nz,DARK,f);
    const armTopL = box(X-.31,X-.205,y+.64,y+.69,Z-.42,Z-.02,[70,43,35],f);
    const armTopR = box(X+.205,X+.31,y+.64,y+.69,Z-.42,Z-.02,[70,43,35],f);
    const lowerTrim = box(X-.245,X+.245,y+.34,y+.39,Z+.105,Z+.17,DARK,f);
    out += pedestal + seatCushion + armL + armR + armTopL + armTopR + backShell + lowerTrim;
  });
  out += "</g>";

  if (opts.mark && opts.mark.a > .01) {
    const {seat:m,a,pulse}=opts.mark, r=.42+.14*pulse, cz=m.z-.2;
    const base=P(m.x,m.y+.02,cz),top=P(m.x,m.y+3.2,cz);
    if (base[2]>.7) {
      const ring=Array.from({length:28},(_,k)=>{const t=k/28*Math.PI*2;return P(m.x+Math.cos(t)*r,m.y+.02,cz+Math.sin(t)*r);});
      out += '<g opacity="' + a.toFixed(2) + '"><polygon points="' + pt(ring) + '" fill="rgba(255,77,85,.3)" stroke="#FF4D55" stroke-width="2"/>' +
        '<line x1="' + base[0].toFixed(1) + '" y1="' + base[1].toFixed(1) + '" x2="' + top[0].toFixed(1) + '" y2="' + top[1].toFixed(1) + '" stroke="#FF4D55" stroke-width="1.5" stroke-dasharray="4 3"/>' +
        '<circle cx="' + top[0].toFixed(1) + '" cy="' + top[1].toFixed(1) + '" r="13" fill="#FF4D55"/>' +
        '<text x="' + top[0].toFixed(1) + '" y="' + (top[1]+4).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="700" font-family="Inter,system-ui,sans-serif" fill="#fff">' + m.id + "</text></g>";
    }
  }
  return {room,seats:out};
}
