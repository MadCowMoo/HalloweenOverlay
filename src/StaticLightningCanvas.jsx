import React, { useEffect, useRef } from 'react';

// Helper to draw random static
function drawStatic(ctx, width, height) {
  const imageData = ctx.createImageData(width, height);
  const buffer = new Uint32Array(imageData.data.buffer);
  for (let i = 0; i < buffer.length; i++) {
    const shade = Math.floor(Math.random() * 256);
    buffer[i] = (255 << 24) | (shade << 16) | (shade << 8) | shade;
  }
  ctx.putImageData(imageData, 0, 0);
}

// Helper to draw a lightning bolt
function drawLightning(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.strokeStyle = '#fff';
  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 3 + Math.random() * 2;
  ctx.beginPath();
  // Start at random x at top
  let x = width * (0.2 + 0.6 * Math.random());
  ctx.moveTo(x, 0);
  let y = 0;
  while (y < height) {
    x += (Math.random() - 0.5) * width * 0.08;
    y += height * (0.08 + Math.random() * 0.12);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

// Stylized SVG for Creature from the Black Lagoon (cartoonish, green, big eyes)
const CREATURE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='140' viewBox='0 0 120 140'>
  <ellipse cx='60' cy='80' rx='50' ry='60' fill='#3a5c2b' stroke='#1e2f16' stroke-width='4'/>
  <ellipse cx='60' cy='110' rx='38' ry='20' fill='#2e4720' />
  <ellipse cx='40' cy='70' rx='13' ry='18' fill='#fff'/>
  <ellipse cx='80' cy='70' rx='13' ry='18' fill='#fff'/>
  <ellipse cx='40' cy='75' rx='6' ry='7' fill='#222'/>
  <ellipse cx='80' cy='75' rx='6' ry='7' fill='#222'/>
  <ellipse cx='60' cy='102' rx='18' ry='8' fill='#222' opacity='0.18'/>
  <ellipse cx='60' cy='90' rx='6' ry='2' fill='#fff' opacity='0.5'/>
  <path d='M10 80 Q20 65 30 80 Q40 95 50 80 Q60 65 70 80 Q80 95 90 80 Q100 65 110 80' stroke='#1e2f16' stroke-width='3' fill='none'/>
  <ellipse cx='20' cy='120' rx='8' ry='4' fill='#3a5c2b' stroke='#1e2f16' stroke-width='2'/>
  <ellipse cx='100' cy='120' rx='8' ry='4' fill='#3a5c2b' stroke='#1e2f16' stroke-width='2'/>
</svg>`;

let creatureImg = null;
function getCreatureImg() {
  if (creatureImg) return creatureImg;
  const blob = new Blob([CREATURE_SVG], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  creatureImg = new window.Image();
  creatureImg.src = url;
  return creatureImg;
}

export default function StaticLightningCanvas({ overlayAlpha = 1 }) {
  const canvasRef = useRef();
  const lightningRef = useRef(false);
  const lightningFade = useRef(0);
  const animFrame = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let running = true;
    let lightningTimeout;
    const ctx = canvas.getContext('2d');
    let lastLightningTime = 0;
    let lightningDuration = 0;
    let fade = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function animate(now) {
      if (!running) return;
      drawStatic(ctx, canvas.width, canvas.height);
      // Lightning logic
      if (lightningRef.current || fade > 0) {
        ctx.save();
        ctx.globalAlpha = fade;
        drawLightning(ctx, canvas.width, canvas.height);
        // Draw the creature SVG image, centered and large (2/3 of screen)
        const img = getCreatureImg();
        const aspect = 120 / 140;
        const scale = 0.66 * Math.min(canvas.width, canvas.height);
        let w, h;
        if (canvas.width < canvas.height) {
          w = scale;
          h = scale / aspect;
        } else {
          h = scale;
          w = scale * aspect;
        }
        const cx = (canvas.width - w) / 2;
        const cy = (canvas.height - h) / 2;
        if (img.complete) {
          ctx.drawImage(img, cx, cy, w, h);
        } else {
          img.onload = () => ctx.drawImage(img, cx, cy, w, h);
        }
        ctx.restore();
        fade -= 0.07;
        if (fade < 0) fade = 0;
      }
      if (!lightningRef.current && Math.random() < 0.01) {
        // 1% chance per frame to trigger lightning
        lightningRef.current = true;
        fade = 1.0;
        setTimeout(() => {
          lightningRef.current = false;
        }, 60 + Math.random() * 100);
      }
      animFrame.current = requestAnimationFrame(animate);
    }
    animFrame.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(animFrame.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        opacity: overlayAlpha,
        zIndex: 2,
        background: 'transparent',
      }}
    />
  );
}
