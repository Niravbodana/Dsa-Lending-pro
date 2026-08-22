#!/usr/bin/env python3
"""NeerCred FINAL promo — loud voice guaranteed, VO text on side, full-fit phone."""

from __future__ import annotations

import asyncio
import json
import subprocess
from pathlib import Path

import edge_tts
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = Path("/opt/cursor/artifacts/neercred-promo-video")
SCREENS = OUT / "screenshots"
ASSETS = OUT / "assets"
AUDIO = OUT / "audio"
FRAMES = OUT / "frames"
DOWNLOAD = Path("/opt/cursor/artifacts")

W, H = 1920, 1080
FPS = 30
VOICE = "hi-IN-SwaraNeural"
PHONE_W, PHONE_H = 390, 844

SCENES = [
    {"id": "intro", "screen": "01-homepage.png", "step": "शुरुआत",
     "vo": "NeerCred par aapka swagat hai. Dream Big, Borrow Smart.",
     "vo_hi": "NeerCred par aapka swagat hai.\nDream Big. Borrow Smart.\nIndia ka trusted loan platform."},
    {"id": "home", "screen": "01-homepage.png", "step": "Step 1",
     "vo": "Ek platform har financial goal ke liye. Personal loan 20 lakh tak, fully digital.",
     "vo_hi": "Ek platform, har financial goal.\nPersonal loan ₹20 lakh tak.\n100% digital process."},
    {"id": "how", "screen": "01b-how-it-works.png", "step": "Step 2",
     "vo": "Apply online, eligibility check, offers compare, KYC complete — sab phone se.",
     "vo_hi": "Apply online karein.\nEligibility check karein.\nOffers compare karein.\nKYC — sab phone se."},
    {"id": "apply", "screen": "02-apply.png", "step": "Step 3",
     "vo": "Apply par jaakar apna mobile number daaliye. SMS consent dekar continue kijiye.",
     "vo_hi": "Apply par jaaiye.\nMobile number daaliye.\nSMS consent dekar continue."},
    {"id": "otp", "screen": "03-otp.png", "step": "Step 4",
     "vo": "OTP enter karke verify kijiye. Secure aur fast — ek minute mein aage badhiye.",
     "vo_hi": "OTP enter karein.\nVerify kijiye.\nSecure aur fast — aage badhiye."},
    {"id": "rates", "screen": "04-rates.png", "step": "Step 5",
     "vo": "Interest rates transparent hain, 10.99 percent se shuru. Koi hidden charges nahi.",
     "vo_hi": "Rates transparent hain.\n10.99% se shuru.\nKoi hidden charges nahi."},
    {"id": "offers", "screen": "09-offers.png", "step": "Step 6",
     "vo": "Multiple lenders ke offers ek screen par. Best rate aur EMI compare karke select karein.",
     "vo_hi": "Multiple lenders ke offers.\nEk screen par compare.\nBest rate select karein."},
    {"id": "kyc", "screen": "10-kyc.png", "step": "Step 7",
     "vo": "KYC poori tarah digital. Aadhaar OTP, bank verify, aur eSign ghar baithe.",
     "vo_hi": "KYC 100% digital.\nAadhaar OTP, bank verify.\neSign — ghar baithe."},
    {"id": "trust", "screen": "06-compliance.png", "step": "Trust",
     "vo": "RBI LSP registered, DPDP compliant, 256 bit encryption. Aapka data poori tarah safe.",
     "vo_hi": "RBI LSP registered.\nDPDP compliant.\n256-bit encryption — data safe."},
    {"id": "track", "screen": "07-track.png", "step": "Step 8",
     "vo": "Loan status track kijiye dashboard par. Real time update, sab kuch ek jagah.",
     "vo_hi": "Loan status track karein.\nDashboard par real time update.\nSab ek jagah."},
    {"id": "close", "screen": "01-homepage.png", "step": "Apply Now",
     "vo": "Abhi apply karein NeerCred par. Dream Big, Borrow Smart. Aapka loan aapke haath mein.",
     "vo_hi": "Abhi apply karein NeerCred par.\nDream Big. Borrow Smart.\nAapka loan, aapke haath mein."},
]


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def font(sz, bold=False):
    p = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    return ImageFont.truetype(p, sz) if Path(p).exists() else ImageFont.load_default()


def wrap(text, fnt, max_w):
    lines, cur = [], ""
    m = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    for w in text.replace("\n", " \n ").split():
        if w == "\n":
            if cur: lines.append(cur); cur = ""
            lines.append("")
            continue
        t = f"{cur} {w}".strip()
        if m.textlength(t, font=fnt) <= max_w: cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines or [text]


def load_logo():
    p = ASSETS / "logo.png"
    if not p.exists():
        svg = ROOT / "frontend/public/neercred-logo-header.svg"
        html = ASSETS / "l.html"
        html.write_text(f'<!DOCTYPE html><html><head><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" rel="stylesheet"><style>body{{margin:0;background:#fff;width:500px;height:100px;display:flex;align-items:center;justify-content:center}}</style></head><body>{svg.read_text(encoding="utf-8",errors="replace")}</body></html>')
        run(["npx","playwright","screenshot","--browser","chromium",f"file://{html.resolve()}",str(p),"--viewport-size=500,100"], cwd=ROOT/"frontend")
        img = Image.open(p).convert("RGBA")
        px = img.load()
        for y in range(img.height):
            for x in range(img.width):
                r,g,b,a = px[x,y]
                if r>240 and g>240 and b>240: px[x,y]=(0,0,0,0)
        if img.getbbox(): img = img.crop(img.getbbox())
        img.save(p)
    return Image.open(p).convert("RGBA")


def fit_screen(path: Path) -> Image.Image:
    src = Image.open(path).convert("RGB")
    scale = min(PHONE_W/src.width, PHONE_H/src.height)
    nw, nh = int(src.width*scale), int(src.height*scale)
    r = src.resize((nw,nh), Image.Resampling.LANCZOS)
    c = Image.new("RGB", (PHONE_W, PHONE_H), "#F8FAFC")
    c.paste(r, ((PHONE_W-nw)//2, (PHONE_H-nh)//2))
    return c


def draw_phone(base, screen, cx, cy):
    pw, ph = PHONE_W+28, PHONE_H+100
    px, py = cx-pw//2, cy-ph//2
    rgba = base.convert("RGBA")
    sh = Image.new("RGBA",(pw+40,ph+40),(0,0,0,0))
    ImageDraw.Draw(sh).rounded_rectangle([15,15,pw+15,ph+15],radius=48,fill=(0,0,0,70))
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    rgba.paste(sh,(px-12,py+10),sh)
    frame = Image.new("RGBA",(pw,ph),(0,0,0,0))
    fd = ImageDraw.Draw(frame)
    fd.rounded_rectangle([0,0,pw-1,ph-1],radius=44,fill=(18,18,28,255))
    fd.rounded_rectangle([pw//2-58,12,pw//2+58,32],radius=12,fill=(8,8,12,255))
    fd.rounded_rectangle([pw//2-48,ph-16,pw//2+48,ph-8],radius=4,fill=(255,255,255,70))
    mask = Image.new("L",(PHONE_W,PHONE_H),0)
    ImageDraw.Draw(mask).rounded_rectangle([0,0,PHONE_W-1,PHONE_H-1],radius=30,fill=255)
    scr = screen.convert("RGBA"); scr.putalpha(mask)
    frame.paste(scr,(14,68),scr)
    rgba.paste(frame,(px,py),frame)
    base.paste(rgba.convert("RGB"))


def render_left(scene, logo):
    lw = W//2-10
    panel = Image.new("RGB",(lw,H),"#F8FAFC")
    pr = panel.convert("RGBA")
    lg = logo.copy(); lg.thumbnail((210,65), Image.Resampling.LANCZOS)
    pr.paste(lg,(48,38),lg)
    d = ImageDraw.Draw(pr)
    teal,navy,gold = rgb("#0F766E"),rgb("#0B1220"),rgb("#D4A017")
    sf = font(15,True); st=scene["step"]; sw=d.textlength(st,font=sf)
    d.rounded_rectangle([48,118,48+sw+24,150],radius=14,fill=teal)
    d.text((60,124),st,fill=(255,255,255),font=sf)
    bx1,by1,bx2,by2 = 38,165,lw-20,700
    d.rounded_rectangle([bx1,by1,bx2,by2],radius=18,fill="#F0FDFA",outline=teal,width=2)
    d.text((58,by1+16),"🎙️  Voice Guide",fill=teal,font=font(14,True))
    vf = font(30,True); y=by1+58
    for line in wrap(scene["vo_hi"],vf,bx2-bx1-40):
        if not line: y+=14; continue
        d.text((58,y),line,fill=navy,font=vf); y+=44
    d.rounded_rectangle([38,H-88,lw-20,H-48],radius=12,fill="#DBEAFE")
    d.text((52,H-80),"🔒 RBI LSP  ·  256-bit Encryption  ·  DPDP Compliant",fill=navy,font=font(12,True))
    d.rounded_rectangle([38,H-32,150,H-26],radius=3,fill=gold)
    return pr.convert("RGB")


def render_scene(scene, logo):
    c = Image.new("RGB",(W,H),"#F8FAFC")
    d = ImageDraw.Draw(c)
    for y in range(H):
        t=y/H; col=tuple(int(rgb("#E0F2FE")[i]+(rgb("#F8FAFC")[i]-rgb("#E0F2FE")[i])*t) for i in range(3))
        d.line([(W//2,y),(W,y)],fill=col)
    c.paste(render_left(scene,logo),(0,0))
    d=ImageDraw.Draw(c); d.line([(W//2,25),(W//2,H-25)],fill=rgb("#14B8A6"),width=3)
    sf = SCREENS/scene["screen"]
    if not sf.exists():
        sf = next(SCREENS.glob("*.png"))
    draw_phone(c, fit_screen(sf), int(W*0.74), H//2)
    return c


async def make_vo(text, path):
    await edge_tts.Communicate(text, VOICE, rate="+12%", pitch="+5Hz").save(str(path))
    tmp = path.with_suffix(".b.mp3")
    run(["ffmpeg","-y","-i",str(path),"-af","volume=4.0,alimiter=limit=0.98","-ar","44100","-ac","2","-b:a","192k",str(tmp)])
    tmp.replace(path)
    r = run(["ffprobe","-v","quiet","-print_format","json","-show_format",str(path)],capture_output=True,text=True)
    return float(json.loads(r.stdout)["format"]["duration"])


def make_bgm(dur, path):
    notes = [261.63,329.63,392,523.25,440,392,329.63]
    segs=[]
    for i in range(int(dur/1.8)+3):
        f=notes[i%len(notes)]; s=AUDIO/f"b{i}.wav"
        run(["ffmpeg","-y","-f","lavfi","-i",f"sine=f={f}:duration=2",
             "-af","volume=0.12,afade=t=in:d=0.2,afade=t=out:st=1.5:d=0.5","-ar","44100","-ac","2",str(s)])
        segs.append(s)
    inp=[]; 
    for s in segs: inp+=["-i",str(s)]
    n=len(segs); filt="".join(f"[{j}:a]" for j in range(n))+f"concat=n={n}:v=0:a=1[out]"
    raw=AUDIO/"bgm.wav"
    run(["ffmpeg","-y",*inp,"-filter_complex",filt,"-map","[out]",str(raw)])
    run(["ffmpeg","-y","-i",str(raw),"-t",str(dur+1),"-af",f"volume=0.4,afade=t=in:d=2,afade=t=out:st={dur-1}:d=2","-ar","44100","-ac","2",str(path)])
    for s in segs: s.unlink(missing_ok=True)
    raw.unlink(missing_ok=True)


def clip(frame, vo, dur, i):
    out=OUT/f"c{i:02d}.mp4"; t=dur+0.4
    run(["ffmpeg","-y","-loop","1","-i",str(frame),"-i",str(vo),
         "-vf",f"scale={W}:{H},fps={FPS}","-c:v","libx264","-pix_fmt","yuv420p","-crf","16",
         "-c:a","aac","-b:a","256k","-ar","44100","-ac","2","-shortest","-t",f"{t:.2f}",str(out)])
    return out


async def main():
    for d in (ASSETS,AUDIO,FRAMES,SCREENS,DOWNLOAD): d.mkdir(parents=True,exist_ok=True)
    logo=load_logo()
    durs, clips, vo_files = [], [], []

    print("=== VO + Frames ===")
    for i,s in enumerate(SCENES):
        vo=AUDIO/f"vo{i}.mp3"; d=await make_vo(s["vo"],vo)
        durs.append(d); vo_files.append(vo)
        fr=FRAMES/f"f{i}.png"; render_scene(s,logo).save(fr,quality=98)
        clips.append(clip(fr,vo,d,i))
        print(f"  {s['id']}: {d:.1f}s")

    # Concat all VO into one MP3 for download
    vo_list=AUDIO/"volist.txt"
    vo_list.write_text("\n".join(f"file '{v}'" for v in vo_files))
    vo_full=DOWNLOAD/"NeerCred-Voice-Only.mp3"
    run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(vo_list),"-c","copy",str(vo_full)])

    lst=OUT/"list.txt"; lst.write_text("\n".join(f"file '{c}'" for c in clips))
    merged=OUT/"merged.mp4"
    run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(lst),"-c","copy",str(merged)])
    total=sum(durs)+len(SCENES)*0.4
    bgm=AUDIO/"bgm.mp3"; make_bgm(total,bgm)

    h_out=DOWNLOAD/"NeerCred-Promo-FINAL-16x9.mp4"
    # GUARANTEED audio: map video + mixed audio explicitly
    run(["ffmpeg","-y","-i",str(merged),"-i",str(bgm),
         "-filter_complex",
         "[0:a]volume=2.0[va];[1:a]volume=0.3,aloop=loop=-1:size=2e+09[vb];"
         "[va][vb]amix=inputs=2:duration=first[aout]",
         "-map","0:v:0","-map","[aout]",
         "-c:v","copy","-c:a","aac","-b:a","320k","-ar","44100","-ac","2",
         "-movflags","+faststart",str(h_out)])

    v_out=DOWNLOAD/"NeerCred-Promo-FINAL-9x16.mp4"
    run(["ffmpeg","-y","-i",str(h_out),
         "-vf","scale=1080:-2,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xF0F9FF",
         "-c:v","libx264","-crf","16","-pix_fmt","yuv420p",
         "-c:a","copy","-movflags","+faststart",str(v_out)])

    # Also copy to workspace
    for src,dst in [(h_out,"/workspace/artifacts/NeerCred-Promo-FINAL-16x9.mp4"),
                    (v_out,"/workspace/artifacts/NeerCred-Promo-FINAL-9x16.mp4"),
                    (vo_full,"/workspace/artifacts/NeerCred-Voice-Only.mp3")]:
        Path(dst).write_bytes(Path(src).read_bytes())

    # pub
    pub = ROOT / "frontend/public/videos"
    pub.mkdir(parents=True,exist_ok=True)
    for name in ["NeerCred-Promo-FINAL-16x9.mp4","NeerCred-Promo-FINAL-9x16.mp4"]:
        (pub/name).write_bytes((DOWNLOAD/name).read_bytes())

    r=run(["ffmpeg","-y","-i",str(h_out),"-af","volumedetect","-f","null","-"],capture_output=True,text=True)
    for ln in r.stderr.split("\n"):
        if "volume" in ln.lower(): print(" ",ln.strip())
    print(f"\n✅ DOWNLOAD:\n   {h_out}\n   {v_out}\n   {vo_full}")

if __name__=="__main__":
    asyncio.run(main())
