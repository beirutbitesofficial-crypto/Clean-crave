"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import type { PromoCode } from "@/lib/content";

/**
 * A printable poster for a partner: the CleanCrave logo, a QR code that opens the site with the
 * partner's code already applied, and the code itself for anyone who would rather type it.
 * Drawn on a canvas in the browser, so it downloads as a plain PNG.
 */
const W = 1200;
const H = 1880;
const INK = "#070605";
const GOLD = "#ddb65e";
const IVORY = "#f6f0e4";

const fontVar = (name: string, fallback: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `${v}, ${fallback}` : fallback;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Writes text centred, shrinking it until it fits the width. */
function fitText(ctx: CanvasRenderingContext2D, text: string, y: number, size: number, family: string, maxW: number, weight = "") {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${family}`.trim();
    s -= 2;
  } while (ctx.measureText(text).width > maxW && s > 12);
  ctx.fillText(text, W / 2, y);
}

async function drawPoster(canvas: HTMLCanvasElement, link: string, code: PromoCode) {
  await document.fonts.ready;
  const display = fontVar("--font-anton", "Impact, sans-serif");
  const cond = fontVar("--font-barlow", "'Arial Narrow', sans-serif");
  const arabic = fontVar("--font-ar-text", "sans-serif");

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(221,182,94,0.55)";
  ctx.lineWidth = 3;
  roundRect(ctx, 36, 36, W - 72, H - 72, 36);
  ctx.stroke();

  const logo = await loadImage("/brand/logo.webp");
  const lw = 520;
  ctx.drawImage(logo, (W - lw) / 2, 70, lw, (lw * logo.height) / logo.width);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = GOLD;
  ctx.font = `600 46px ${cond}`;
  ctx.letterSpacing = "10px";
  ctx.fillText("SCAN TO ORDER", W / 2, 470);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = IVORY;
  ctx.font = `40px ${arabic}`;
  ctx.direction = "rtl";
  ctx.fillText("امسح الرمز واطلب", W / 2, 528);
  ctx.direction = "ltr";

  // The QR sits on white with a wide margin, so every phone camera reads it.
  const box = 700;
  const bx = (W - box) / 2;
  const by = 570;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, bx, by, box, box, 32);
  ctx.fill();
  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, link, { errorCorrectionLevel: "M", margin: 0, width: box - 90, color: { dark: "#000000", light: "#ffffff" } });
  ctx.drawImage(qr, bx + 45, by + 45, box - 90, box - 90);

  ctx.fillStyle = IVORY;
  ctx.font = `600 34px ${cond}`;
  ctx.letterSpacing = "8px";
  ctx.fillText("OR USE THE CODE", W / 2, by + box + 80);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = GOLD;
  fitText(ctx, code.code, by + box + 205, 130, display, W - 200);

  let y = by + box + 300;
  if (code.discount > 0) {
    ctx.fillStyle = IVORY;
    ctx.font = `700 44px ${cond}`;
    ctx.fillText(`${code.discount}% OFF YOUR ORDER`, W / 2, y);
    ctx.font = `38px ${arabic}`;
    ctx.direction = "rtl";
    ctx.fillText(`خصم ${code.discount}% على طلبك`, W / 2, y + 56);
    ctx.direction = "ltr";
    y += 56;
  }
  if (code.partner) {
    ctx.fillStyle = "rgba(246,240,228,0.6)";
    fitText(ctx, `with ${code.partner}`, y + 62, 36, cond, W - 200, "600");
  }

  ctx.fillStyle = "rgba(246,240,228,0.55)";
  ctx.font = `600 30px ${cond}`;
  ctx.letterSpacing = "4px";
  ctx.fillText(new URL(link).host.toUpperCase(), W / 2, H - 78);
  ctx.letterSpacing = "0px";
}

function download(canvas: HTMLCanvasElement, name: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }, "image/png");
}

export default function QrPoster({ code, link, onClose }: { code: PromoCode; link: string; onClose: () => void }) {
  const poster = useRef<HTMLCanvasElement>(null);
  const [src, setSrc] = useState("");
  const [failed, setFailed] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const canvas = poster.current;
    if (!canvas) return;
    drawPoster(canvas, link, code).then(
      () => setSrc(canvas.toDataURL("image/png")),
      () => setFailed(true)
    );
  }, [code, link]);

  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, []);

  async function qrOnly() {
    const c = document.createElement("canvas");
    await QRCode.toCanvas(c, link, { errorCorrectionLevel: "M", margin: 4, width: 1200 });
    download(c, `cleancrave-${code.code}-qr.png`);
  }

  const btn = "inline-flex min-h-12 flex-1 items-center justify-center rounded-full px-5 text-sm font-bold";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="qr-title" className="flex max-h-[100dvh] w-full max-w-md flex-col rounded-t-3xl bg-ink-2 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 id="qr-title" className="font-serif text-2xl text-ivory">
            QR code · <span className="text-gold">{code.code}</span>
          </h2>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full text-ivory/70 hover:bg-ivory/10 hover:text-ivory">
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          <canvas ref={poster} className="hidden" />
          {src ? (
            <img src={src} alt={`Poster with the QR code for ${code.code}`} className="mx-auto w-full max-w-[340px] rounded-2xl" />
          ) : (
            <p className="py-24 text-center text-ivory/60">{failed ? "Couldn’t draw the poster. Try again." : "Drawing…"}</p>
          )}
          <p className="mt-3 text-center text-[13px] leading-relaxed text-ivory/55">
            Scanning opens <span dir="ltr">{link.replace(/^https?:\/\//, "")}</span> with the code already applied.
          </p>
        </div>
        <div className="flex gap-2 border-t border-ivory/10 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button type="button" disabled={!src} onClick={() => poster.current && download(poster.current, `cleancrave-${code.code}-poster.png`)} className={`${btn} btn-gold disabled:opacity-40`}>
            Download poster
          </button>
          <button type="button" onClick={qrOnly} className={`${btn} border border-ivory/20 text-ivory/90 hover:border-gold/60 hover:text-gold`}>
            QR only
          </button>
        </div>
      </div>
    </div>
  );
}
