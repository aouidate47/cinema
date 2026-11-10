"use client";

import { useEffect, useRef } from "react";
import type { Hall, Seat } from "@/types";

type Props = {
  hall: Hall;
  seats: Seat[];
  seat: Seat;
  film: HTMLCanvasElement;
  onArrive: () => void;
  skipRef: React.MutableRefObject<boolean>;
  lookRef: React.MutableRefObject<number>;
};

export default function CinemaScene3D({ hall, seats, seat, film, onArrive, skipRef, lookRef }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let renderer: import("three").WebGLRenderer | undefined;
    let raf = 0;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const boot = async () => {
      const THREE = await import("three");
      const { RoundedBoxGeometry } = await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
      if (!host.current || disposed) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#09090d");
      scene.fog = new THREE.FogExp2("#09090d", 0.012);
      const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 180);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
      renderer.setSize(host.current.clientWidth, host.current.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.domElement.className = "absolute inset-0 h-full w-full";
      renderer.domElement.setAttribute("aria-label", "Interactive 3D cinema auditorium");
      host.current.appendChild(renderer.domElement);

      const mat = (color: string, roughness = 0.78, metalness = 0) =>
        new THREE.MeshStandardMaterial({ color, roughness, metalness });
      const carpet = mat("#17151a"), wall = mat("#21191d"), wallAlt = mat("#302127");
      const black = mat("#100f13", 0.45), metal = mat("#28272a", 0.34, 0.72);
      const red = mat("#8f171d", 0.9), redLight = mat("#b52a31", 0.86);
      const redDark = mat("#5d0d13", 0.92), gold = mat("#a77d4c", 0.42, 0.55);
      const aisleLight = new THREE.MeshStandardMaterial({ color: "#e5a76d", emissive: "#c35b25", emissiveIntensity: 1.2 });
      const addBox = (parent: THREE.Object3D, w: number, h: number, d: number, material: THREE.Material,
        x: number, y: number, z: number, radius = 0.04, cast = true) => {
        const geo = new RoundedBoxGeometry(w, h, d, 3, Math.min(radius, w/3, h/3, d/3));
        const mesh = new THREE.Mesh(geo, material);
        mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh); return mesh;
      };

      const maxZ = Math.max(...seats.map(s => s.z), 16) + 3;
      const width = 15;
      // Architectural shell: carpeted floor, acoustic side walls, ceiling and rear wall.
      addBox(scene, width, 0.35, maxZ + 3, carpet, 0, -0.28, maxZ/2, 0.02, false);
      addBox(scene, 0.35, 8.5, maxZ + 2, wall, -width/2, 4, maxZ/2, 0.08, false);
      addBox(scene, 0.35, 8.5, maxZ + 2, wall, width/2, 4, maxZ/2, 0.08, false);
      addBox(scene, width, 0.35, maxZ + 2, black, 0, 8.25, maxZ/2, 0.08, false);
      addBox(scene, width, 0.5, 0.7, black, 0, 0.1, -0.25, 0.05, false);

      // Repeated acoustic wall ribs and soft indirect lighting.
      for (let z = 0.7; z < maxZ; z += 1.15) {
        for (const side of [-1, 1]) {
          addBox(scene, 0.11, 5.8, 0.08, wallAlt, side * 7.28, 3.6, z, 0.025, false);
          addBox(scene, 0.035, 5.3, 0.025, gold, side * 7.07, 3.55, z, 0.008, false);
        }
      }
      // Ceiling coffers with recessed warm light strips.
      for (let z = 1.2; z < maxZ; z += 3.2) {
        addBox(scene, 10.5, 0.12, 0.08, wallAlt, 0, 7.82, z, 0.03, false);
        addBox(scene, 8.8, 0.025, 0.035, aisleLight, 0, 7.72, z, 0.01, false);
      }

      // Screen wall, curved widescreen, frame and lower stage.
      const screenTexture = new THREE.CanvasTexture(film);
      screenTexture.colorSpace = THREE.SRGBColorSpace;
      screenTexture.minFilter = THREE.LinearFilter;
      const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture, side: THREE.DoubleSide });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(hall.screenW, hall.screenH, 32, 1), screenMaterial);
      screen.position.set(0, hall.screenBottom + hall.screenH/2, 0.02);
      screen.rotation.y = 0;
      // A shallow curved screen is built from a segmented surface.
      const pos = screen.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        pos.setZ(i, hall.screenCurve * Math.pow(x/(hall.screenW/2), 2));
      }
      screen.geometry.computeVertexNormals(); scene.add(screen);
      addBox(scene, hall.screenW + 0.38, 0.16, 0.22, metal, 0, hall.screenBottom - 0.12, 0, 0.05, false);
      addBox(scene, hall.screenW + 0.3, 0.13, 0.2, gold, 0, hall.screenBottom + hall.screenH + 0.12, 0, 0.05, false);
      addBox(scene, width, 0.55, 1.1, black, 0, -0.02, -0.25, 0.08, false);

      // Tiered carpeted floor, aisle stair nosings and subtle path lights.
      const first = hall.firstRow;
      const stepCount = Math.max(8, hall.rows.length + 1);
      for (let i = 0; i < stepCount; i++) {
        const z = first + i * hall.rowPitch - 0.4;
        const y = i * hall.rise;
        addBox(scene, width - 1.4, Math.max(0.12, hall.rise), hall.rowPitch + 0.02, carpet, 0, y - 0.08, z, 0.025, false);
        for (const side of [-1, 1]) {
          addBox(scene, 0.035, 0.035, 0.72, aisleLight, side * 6.55, y + 0.02, z, 0.01, false);
        }
      }
      // Dedicated side stairs with dark risers, anti-slip treads and handrails.
      for (const side of [-1, 1]) {
        for (let i = 0; i < stepCount; i++) {
          const z = first + i * hall.rowPitch;
          const y = i * hall.rise;
          addBox(scene, 1.05, 0.12, hall.rowPitch, wallAlt, side * 6.2, y - 0.02, z, 0.025, false);
          addBox(scene, 0.025, 0.025, 0.82, aisleLight, side * 6.2, y + 0.055, z, 0.008, false);
        }
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,maxZ-first,12), metal);
        rail.rotation.x = Math.PI/2; rail.position.set(side*6.75,1.05,(maxZ+first)/2); scene.add(rail);
      }

      // Fully upholstered cinema chairs: back shell, lumbar pad, seat cushion,
      // two padded armrests, metal cup holders, side panels, pedestal and foot.
      const buildSeat = (s: Seat) => {
        const g = new THREE.Group(); g.position.set(s.x, s.y, s.z);
        const fabric = s.taken ? mat("#3d3030") : s.rec ? mat("#713e88") : s.bal ? mat("#a47a35") : red;
        const piping = s.taken ? mat("#514749") : redLight;
        const cushion = (w:number,h:number,d:number,x:number,y:number,z:number,r:number,material:THREE.Material) =>
          addBox(g,w,h,d,material,x,y,z,r);
        // Heavy upholstered side shells.
        cushion(0.13,0.55,0.66,-0.31,0.37,0.02,0.055,redDark);
        cushion(0.13,0.55,0.66,0.31,0.37,0.02,0.055,redDark);
        // Seat pan and front waterfall edge.
        cushion(0.56,0.19,0.59,0,0.48,-0.16,0.085,fabric);
        cushion(0.52,0.12,0.12,0,0.42,-0.43,0.055,piping);
        // Tall backrest with thick shoulder wings and lumbar pad.
        cushion(0.58,0.86,0.23,0,0.91,0.18,0.105,fabric);
        cushion(0.48,0.42,0.09,0,0.88,0.055,0.075,piping);
        cushion(0.42,0.16,0.09,0,1.28,0.07,0.065,fabric);
        // Padded arm rests and cup-holder inserts.
        for (const side of [-1,1]) {
          cushion(0.17,0.13,0.61,side*0.39,0.7,-0.12,0.065,black);
          cushion(0.13,0.06,0.48,side*0.39,0.77,-0.12,0.055,metal);
          const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.05,0.018,24), black);
          cup.position.set(side*0.39,0.812,-0.28); g.add(cup);
          // Visible brushed-metal foot / pedestal.
          cushion(0.12,0.3,0.12,side*0.19,0.17,0.02,0.025,metal);
        }
        cushion(0.36,0.1,0.28,0,0.06,0.04,0.025,black);
        // Seat number plaque on the back, facing the audience behind it.
        const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.07,0.012), gold);
        plaque.position.set(0,1.2,0.305); g.add(plaque);
        const status = new THREE.Mesh(new THREE.BoxGeometry(0.14,0.018,0.014), s.taken ? black : aisleLight);
        status.position.set(0,1.2,0.315); g.add(status);
        g.userData.seatId = s.id;
        return g;
      };
      const seatGroups = new Map<string, THREE.Group>();
      seats.forEach(s => { const g = buildSeat(s); scene.add(g); seatGroups.set(s.id,g); });

      // Selected seat gets a refined illuminated floor marker.
      const selected = seatGroups.get(seat.id);
      if (selected) {
        const halo = new THREE.Mesh(new THREE.RingGeometry(0.38,0.49,48), new THREE.MeshBasicMaterial({color:"#ff7777",transparent:true,opacity:0.8,side:THREE.DoubleSide}));
        halo.rotation.x = -Math.PI/2; halo.position.set(seat.x,seat.y+0.02,seat.z-0.18); scene.add(halo);
      }

      // Cinematic lighting: screen spill, warm wall sconces and aisle guides.
      scene.add(new THREE.AmbientLight("#b8a6a0",0.65));
      const key = new THREE.DirectionalLight("#fff0e6",2.0); key.position.set(-4,8,5); key.castShadow=true; key.shadow.mapSize.set(1024,1024); scene.add(key);
      const screenGlow = new THREE.PointLight("#ffb7a2",35,24,2); screenGlow.position.set(0,4.5,1.2); scene.add(screenGlow);
      for (const side of [-1,1]) {
        for (let z=3; z<maxZ; z+=5) {
          const light = new THREE.PointLight("#d58a69",3.5,7,2); light.position.set(side*6.7,3.2,z); scene.add(light);
        }
      }

      const target = new THREE.Vector3(seat.x, seat.y+0.9, seat.z-1.1);
      const start = new THREE.Vector3(seat.x*0.3, 9, maxZ+8);
      const hover = new THREE.Vector3(seat.x, seat.y+4.2, seat.z+3.6);
      const eye = new THREE.Vector3(seat.x, seat.y+hall.eye, seat.z+1.5);
      const startAt = performance.now();
      const ease = (t:number) => 1-Math.pow(1-t,3);
      let arrived = false, yaw = 0, dragging = false, lastX = 0, lastY = 0, pitch = 0;
      const onDown = (e:PointerEvent) => { dragging=true; lastX=e.clientX; lastY=e.clientY; renderer!.domElement.setPointerCapture(e.pointerId); };
      const onMove = (e:PointerEvent) => { if(!dragging)return; yaw -= (e.clientX-lastX)*0.004; pitch=Math.max(-0.55,Math.min(0.45,pitch+(e.clientY-lastY)*0.003)); lastX=e.clientX; lastY=e.clientY; };
      const onUp = () => { dragging=false; };
      renderer.domElement.addEventListener("pointerdown",onDown);
      renderer.domElement.addEventListener("pointermove",onMove);
      renderer.domElement.addEventListener("pointerup",onUp);
      renderer.domElement.addEventListener("pointercancel",onUp);

      const resize = () => {
        if(!host.current || !renderer)return;
        const w=host.current.clientWidth,h=host.current.clientHeight;
        camera.aspect=w/Math.max(1,h); camera.updateProjectionMatrix(); renderer.setSize(w,h);
      };
      const observer = new ResizeObserver(resize); observer.observe(host.current);
      cleanup = () => {
        observer.disconnect();
        renderer?.domElement.removeEventListener("pointerdown",onDown);
        renderer?.domElement.removeEventListener("pointermove",onMove);
        renderer?.domElement.removeEventListener("pointerup",onUp);
        renderer?.domElement.removeEventListener("pointercancel",onUp);
        scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(v=>v.dispose());else m.dispose();}});
        screenTexture.dispose();
      };
      const animate = (now:number) => {
        if(disposed || !renderer)return;
        const t=Math.min(1,(now-startAt)/3800);
        const e=ease(t);
        let p:THREE.Vector3;
        if(t<0.5) p=start.clone().lerp(hover,ease(t*2));
        else p=hover.clone().lerp(eye,ease((t-0.5)*2));
        if(skipRef.current) p.copy(eye);
        camera.position.copy(p);
        const direction = new THREE.Vector3(Math.sin(yaw),pitch,-Math.cos(yaw));
        camera.lookAt(p.clone().add(direction).add(target.clone().sub(p).multiplyScalar(0.18)));
        if(t>=1 || skipRef.current){ if(!arrived){arrived=true;onArrive();} }
        // A very subtle breathing pulse keeps the selected floor marker legible.
        if(selected) {
          const h=scene.children.find(o=>o instanceof THREE.Mesh && (o as THREE.Mesh).geometry instanceof THREE.RingGeometry) as THREE.Mesh|undefined;
          if(h) (h.material as THREE.MeshBasicMaterial).opacity=0.62+0.18*Math.sin(now/320);
        }
        renderer.render(scene,camera);
        raf=requestAnimationFrame(animate);
      };
      raf=requestAnimationFrame(animate);
      resize();
    };
    boot().catch(err=>console.error("Cinema 3D scene failed to initialize",err));
    return () => { disposed=true; cancelAnimationFrame(raf); cleanup?.(); renderer?.dispose(); if(renderer?.domElement.parentElement) renderer.domElement.remove(); };
  }, [hall,seats,seat,film,onArrive,skipRef,lookRef]);

  return <div ref={host} className="absolute inset-0 overflow-hidden bg-[#09090d]" />;
}
