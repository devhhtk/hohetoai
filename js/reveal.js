/**
 * Aumage — Reveal Engine v2.1
 *
 * PUBLIC API:
 *   AumageReveal.play(imageUrl, audioBlob, onComplete)
 *
 * v2.1 fix: Card dimensions are driven by the actual FLUX image
 * so the creature always fills the panel perfectly — no cropping.
 *
 * Sequence:
 *   0.0s  Ambient bg glow activates
 *   0.3s  Vortex spins up
 *   2.5s  Scan line sweeps
 *   3.0s  Vortex condenses inward
 *   3.4s  Glow ring burst + particles
 *   3.6s  Creature materialises desaturated
 *   4.2s  Vortex fades, colour bleeds in
 *   4.8s  Card outer glow
 *   5.4s  Name plate slides up
 *   6.5s  onComplete → app.js shows result
 */

const AumageReveal = (() => {

  const CYAN     = '#00c8dc';
  const CYAN_DIM = '#1a7a8a';

  const T = {
    VORTEX_START : 300,
    SCAN_LINE    : 2500,
    CONDENSE     : 3000,
    BURST        : 3400,
    CREATURE_IN  : 3600,
    COLOR_BLEED  : 4200,
    CARD_GLOW    : 4800,
    NAMEPLATE    : 5400,
    COMPLETE     : 6500,
  };

  let _vortex    = null;
  let _ambientBg = null;
  let _timers    = [];

  function _clearTimers() { _timers.forEach(clearTimeout); _timers = []; }
  function _later(fn, ms) { _timers.push(setTimeout(fn, ms)); }

  // ----------------------------------------------------------
  // DOM BUILDER
  // Card width = min(600px, 90vw) to match .result-image in CSS.
  // Panel height = card width * (imgH / imgW) — exact image ratio.
  // Card height  = panel height + nameplate zone + padding.
  // ----------------------------------------------------------
  const NAMEPLATE_H = 138;
  const PAD         = 14;

  function _buildDOM(imgW, imgH) {
    const container = document.getElementById('step-reveal');
    if (!container) return;

    const maxW   = Math.min(600, window.innerWidth * 0.9);
    const cardW  = Math.round(maxW);
    const panelH = Math.round(cardW * (imgH / imgW));
    const cardH  = panelH + NAMEPLATE_H + PAD * 2;

    container.innerHTML = `
      <canvas id="ar-bg" style="
        position:fixed;inset:0;width:100%;height:100%;
        z-index:0;opacity:0;pointer-events:none;
        transition:opacity 2s ease;"></canvas>

      <div style="
        position:relative;z-index:10;
        display:flex;flex-direction:column;align-items:center;
        padding:16px 0 24px;">

        <div id="ar-card" style="
          position:relative;width:${cardW}px;height:${cardH}px;
          border-radius:18px;
          background:linear-gradient(165deg,#0f3f55 0%,#0b2e3e 45%,#081e2a 100%);
          border:1.5px solid #1e6a7a;overflow:hidden;
          box-shadow:0 0 0 0.5px rgba(0,200,220,0.1),0 24px 80px rgba(0,0,0,0.8);
          transition:box-shadow 1.5s ease;">

          <div id="ar-corners" style="position:absolute;inset:0;z-index:30;pointer-events:none;"></div>

          <!-- Inner panel — exact image ratio -->
          <div id="ar-panel" style="
            position:absolute;
            top:${PAD}px;left:${PAD}px;right:${PAD}px;bottom:${NAMEPLATE_H}px;
            border-radius:10px;background:#e8f2f4;
            border:1.5px solid #2a9db5;overflow:hidden;">

            <div style="position:absolute;inset:3px;border-radius:8px;
              border:0.5px solid rgba(42,157,181,0.2);pointer-events:none;z-index:1;"></div>

            <img id="ar-img" alt="Audiotrope" style="
              position:absolute;inset:0;width:100%;height:100%;
              object-fit:contain;
              opacity:0;filter:saturate(0) brightness(2);
              transition:opacity 2.5s ease,filter 3s ease;z-index:2;" />

            <canvas id="ar-vortex" style="
              position:absolute;inset:0;width:100%;height:100%;
              z-index:3;pointer-events:none;transition:opacity 2s ease;"></canvas>

            <div id="ar-ring" style="
              position:absolute;left:50%;top:50%;
              transform:translate(-50%,-50%);
              width:20px;height:20px;
              border:2px solid rgba(0,200,220,0.9);border-radius:50%;
              z-index:6;opacity:0;pointer-events:none;"></div>

            <div id="ar-particles" style="
              position:absolute;inset:0;z-index:7;
              pointer-events:none;overflow:hidden;"></div>
          </div>

          <!-- Scan line -->
          <div id="ar-scan" style="
            position:absolute;left:${PAD}px;right:${PAD}px;top:${PAD}px;
            height:2px;z-index:25;opacity:0;pointer-events:none;
            background:linear-gradient(90deg,
              transparent 0%,rgba(0,200,220,0.4) 20%,
              rgba(0,200,220,0.9) 50%,rgba(0,200,220,0.4) 80%,
              transparent 100%);"></div>

          <!-- Name plate -->
          <div id="ar-nameplate" style="
            position:absolute;left:${PAD}px;right:${PAD}px;bottom:10px;
            height:${NAMEPLATE_H - 14}px;border-radius:10px;
            background:linear-gradient(180deg,#0d3040 0%,#091e2a 100%);
            border:1.5px solid #1e6a7a;
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            overflow:hidden;transform:translateY(${NAMEPLATE_H + 10}px);
            transition:transform 0.9s cubic-bezier(0.16,1,0.3,1);">

            <div style="position:absolute;top:0;left:20px;right:20px;height:1px;
              background:linear-gradient(90deg,transparent,#1a7a8a,transparent);"></div>

            <div id="ar-name" style="
              font-family:'Cinzel',Georgia,serif;font-weight:700;
              font-size:17px;color:#fff;letter-spacing:0.08em;
              text-transform:uppercase;text-align:center;padding:0 12px;
              opacity:0;text-shadow:0 0 20px rgba(0,200,220,0.5);
              transition:opacity 0.7s ease 0.2s;"></div>

            <div id="ar-divider" style="
              width:55%;height:1px;margin:7px 0;
              background:linear-gradient(90deg,transparent,#1e5a6a,transparent);
              opacity:0;transition:opacity 0.5s ease 0.4s;"></div>

            <div id="ar-flavor" style="
              font-family:'EB Garamond',Georgia,serif;font-style:italic;
              font-size:11px;color:rgba(168,216,224,0.85);
              text-align:center;padding:0 18px;line-height:1.5;
              opacity:0;transition:opacity 0.7s ease 0.5s;"></div>

            <div id="ar-catalog" style="
              position:absolute;bottom:7px;
              font-family:'Cinzel',serif;font-size:7px;
              letter-spacing:0.15em;color:#2a6a7a;">Aumage Bestiary</div>
          </div>
        </div>
      </div>`;
  }

  // ----------------------------------------------------------
  // CORNER SVG
  // ----------------------------------------------------------
  function _buildCorners(W, H) {
    const NS  = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('fill', 'none'); g.setAttribute('stroke-linecap', 'round');

    function xhair(cx, cy, arm=14, r=5) {
      const grp = document.createElementNS(NS, 'g');
      grp.setAttribute('stroke', CYAN);
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx',cx); c.setAttribute('cy',cy);
      c.setAttribute('r',r);   c.setAttribute('stroke-width','1');
      grp.appendChild(c);
      [[cx,cy-r-1,cx,cy-r-arm],[cx,cy+r+1,cx,cy+r+arm],
       [cx-r-1,cy,cx-r-arm,cy],[cx+r+1,cy,cx+r+arm,cy]].forEach(([x1,y1,x2,y2])=>{
        const l=document.createElementNS(NS,'line');
        l.setAttribute('x1',x1);l.setAttribute('y1',y1);
        l.setAttribute('x2',x2);l.setAttribute('y2',y2);
        l.setAttribute('stroke-width','1.2'); grp.appendChild(l);
      });
      return grp;
    }

    function hashes(axis,start,end,fixed,side,count=7,len=5) {
      for(let i=1;i<=count;i++){
        const pos=start+(end-start)/(count+1)*i;
        const l=document.createElementNS(NS,'line');
        if(axis==='x'){l.setAttribute('x1',pos);l.setAttribute('x2',pos);l.setAttribute('y1',fixed);l.setAttribute('y2',side==='top'?fixed+len:fixed-len);}
        else{l.setAttribute('y1',pos);l.setAttribute('y2',pos);l.setAttribute('x1',fixed);l.setAttribute('x2',side==='left'?fixed+len:fixed-len);}
        l.setAttribute('stroke',CYAN_DIM); l.setAttribute('stroke-width','0.8'); g.appendChild(l);
      }
    }

    const p=14;
    g.appendChild(xhair(p+6,p+6));   g.appendChild(xhair(W-p-6,p+6));
    g.appendChild(xhair(p+6,H-p-6)); g.appendChild(xhair(W-p-6,H-p-6));
    hashes('x',p+24,W-p-24,4,'top',8);   hashes('x',p+24,W-p-24,H-4,'bottom',8);
    hashes('y',p+24,H*0.65,4,'left',5);  hashes('y',p+24,H*0.65,W-4,'right',5);

    svg.appendChild(g);
    return svg;
  }

  // ----------------------------------------------------------
  // VORTEX ENGINE
  // ----------------------------------------------------------
  class VortexEngine {
    constructor(canvas) {
      this.canvas=canvas; this.ctx=canvas.getContext('2d');
      this.W=canvas.offsetWidth; this.H=canvas.offsetHeight;
      canvas.width=this.W*(window.devicePixelRatio||1);
      canvas.height=this.H*(window.devicePixelRatio||1);
      this.ctx.scale(window.devicePixelRatio||1,window.devicePixelRatio||1);
      this.t=0; this.phase='idle'; this.alpha=0; this.raf=null;
      this.arms=Array.from({length:9},(_,i)=>({
        angleOffset:(i/9)*Math.PI*2,speed:0.008+Math.random()*0.006,
        radius:0.35+Math.random()*0.18,width:1.2+Math.random()*1.8,
        hue:185+Math.random()*30-15,opacity:0.4+Math.random()*0.35,
        length:2.5+Math.random()*2.0,twist:2.2+Math.random()*1.5,
      }));
      this.blobs=Array.from({length:7},(_,i)=>({
        angle:(i/7)*Math.PI*2+Math.random()*0.5,r:0.28+Math.random()*0.14,
        speed:(Math.random()>0.5?1:-1)*(0.005+Math.random()*0.007),
        size:0.12+Math.random()*0.10,hue:180+Math.random()*40,opacity:0.08+Math.random()*0.08,
      }));
    }
    start(){this.phase='swirling';this.alpha=0;this._loop();}
    condense(){this.phase='condensing';}
    fadeOut(){this.phase='fading';}
    stop(){if(this.raf)cancelAnimationFrame(this.raf);}
    _loop(){this.raf=requestAnimationFrame(()=>this._loop());this._update();this._draw();}
    _update(){
      this.t++;
      if(this.phase==='swirling'){this.alpha=Math.min(1,this.alpha+0.018);}
      else if(this.phase==='condensing'){
        this.arms.forEach(a=>{a.radius=Math.max(0.02,a.radius*0.97);});
        this.blobs.forEach(b=>{b.r=Math.max(0.02,b.r*0.97);b.size*=0.98;});
        this.alpha=Math.min(1.2,this.alpha+0.01);
      }
      else if(this.phase==='fading'){this.alpha=Math.max(0,this.alpha-0.015);}
    }
    _draw(){
      const{ctx,W,H,t,alpha}=this,cx=W/2,cy=H/2;
      ctx.clearRect(0,0,W,H);if(alpha<=0)return;
      ctx.save();ctx.globalAlpha=Math.min(1,alpha);
      const cs=this.phase==='condensing'?80+Math.sin(t*0.05)*20:50+Math.sin(t*0.04)*10;
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,cs);
      cg.addColorStop(0,`hsla(190,100%,80%,${0.18*alpha})`);
      cg.addColorStop(0.4,`hsla(190,90%,60%,${0.09*alpha})`);
      cg.addColorStop(1,'hsla(190,80%,50%,0)');
      ctx.fillStyle=cg;ctx.beginPath();ctx.arc(cx,cy,cs,0,Math.PI*2);ctx.fill();
      this.blobs.forEach(b=>{
        b.angle+=b.speed;
        const bx=cx+Math.cos(b.angle)*b.r*W,by=cy+Math.sin(b.angle)*b.r*H*0.75,bs=b.size*W;
        const bg=ctx.createRadialGradient(bx,by,0,bx,by,bs);
        bg.addColorStop(0,`hsla(${b.hue},80%,65%,${b.opacity*alpha})`);
        bg.addColorStop(0.5,`hsla(${b.hue},70%,55%,${b.opacity*0.5*alpha})`);
        bg.addColorStop(1,'hsla(190,70%,50%,0)');
        ctx.fillStyle=bg;ctx.beginPath();ctx.arc(bx,by,bs,0,Math.PI*2);ctx.fill();
      });
      this.arms.forEach(arm=>{
        arm.angleOffset+=arm.speed;
        ctx.save();
        ctx.strokeStyle=`hsla(${arm.hue},85%,65%,${arm.opacity*Math.min(1,alpha)})`;
        ctx.lineWidth=arm.width;ctx.shadowColor=`hsla(${arm.hue},100%,70%,0.6)`;ctx.shadowBlur=6;
        ctx.beginPath();let first=true;
        for(let s=0;s<80;s++){
          const frac=s/80,r=arm.radius*W*frac*0.55;
          const angle=arm.angleOffset+frac*arm.length*Math.PI+Math.sin(t*0.02+frac*arm.twist)*0.4;
          const px=cx+Math.cos(angle)*r,py=cy+Math.sin(angle)*r*0.75;
          if(first){ctx.moveTo(px,py);first=false;}else ctx.lineTo(px,py);
        }
        ctx.stroke();ctx.restore();
      });
      if(this.phase==='condensing'){
        for(let i=0;i<12;i++){
          const ang=(i/12)*Math.PI*2+t*0.01;
          const x0=cx+Math.cos(ang)*W*0.45,y0=cy+Math.sin(ang)*W*0.45*0.7;
          const x1=cx+Math.cos(ang)*W*0.06,y1=cy+Math.sin(ang)*W*0.06*0.7;
          const lg=ctx.createLinearGradient(x0,y0,x1,y1);
          lg.addColorStop(0,'hsla(190,100%,70%,0)');
          lg.addColorStop(1,`hsla(190,100%,70%,${0.5*alpha})`);
          ctx.save();ctx.strokeStyle=lg;ctx.lineWidth=0.8;
          ctx.shadowColor='rgba(0,200,220,0.6)';ctx.shadowBlur=4;
          ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.restore();
        }
      }
      ctx.restore();
    }
  }

  // ----------------------------------------------------------
  // AMBIENT BG
  // ----------------------------------------------------------
  class AmbientBg {
    constructor(c){this.canvas=c;this.ctx=c.getContext('2d');this.t=0;this.raf=null;this._r();window.addEventListener('resize',()=>this._r());}
    _r(){this.canvas.width=window.innerWidth;this.canvas.height=window.innerHeight;}
    start(){this._loop();}
    stop(){if(this.raf)cancelAnimationFrame(this.raf);}
    _loop(){
      this.raf=requestAnimationFrame(()=>this._loop());this.t++;
      const{ctx,canvas,t}=this,W=canvas.width,H=canvas.height,cx=W/2,cy=H/2;
      ctx.clearRect(0,0,W,H);
      for(let i=0;i<3;i++){
        const a=t*0.003+(i/3)*Math.PI*2;
        const gx=cx+Math.cos(a)*W*0.2,gy=cy+Math.sin(a)*H*0.15;
        const gr=ctx.createRadialGradient(gx,gy,0,gx,gy,W*0.35);
        gr.addColorStop(0,`hsla(${190+i*15},70%,30%,0.06)`);gr.addColorStop(1,'transparent');
        ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
      }
    }
  }

  // ----------------------------------------------------------
  // SCAN LINE
  // ----------------------------------------------------------
  function _runScanLine(el) {
    const card=document.getElementById('ar-card');
    const cardH=card?card.offsetHeight:600;
    const target=cardH-NAMEPLATE_H-2;
    el.style.opacity='0.9';el.style.top=PAD+'px';
    const start=performance.now(),dur=1800;
    function step(now){
      const p=Math.min((now-start)/dur,1),e=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
      el.style.top=(PAD+(target-PAD)*e)+'px';el.style.opacity=String(0.9*(1-p*0.4));
      if(p<1)requestAnimationFrame(step);else el.style.opacity='0';
    }
    requestAnimationFrame(step);
  }

  // ----------------------------------------------------------
  // PARTICLES
  // ----------------------------------------------------------
  function _injectKF(){
    if(document.getElementById('ar-kf'))return;
    const s=document.createElement('style');s.id='ar-kf';
    s.textContent=`
      @keyframes arP{0%{opacity:0.9;transform:translate(0,0) scale(1);}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.2);}}
      @keyframes arRing{0%{width:20px;height:20px;opacity:0.9;border-width:3px;}100%{width:600px;height:600px;opacity:0;border-width:0.5px;}}`;
    document.head.appendChild(s);
  }

  function _spawnParticles(container){
    const W=container.offsetWidth,H=container.offsetHeight,cx=W/2,cy=H*0.45;
    for(let i=0;i<40;i++){
      const p=document.createElement('div');
      const ang=(Math.PI*2*i/40)+(Math.random()-0.5)*0.4;
      const dist=60+Math.random()*Math.min(W,H)*0.4;
      const size=2+Math.random()*4,hue=180+Math.random()*30;
      p.style.cssText=`position:absolute;border-radius:50%;opacity:0;
        left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;
        background:hsla(${hue},90%,70%,0.9);
        box-shadow:0 0 ${size*2}px hsla(${hue},100%,70%,0.6);
        --tx:${Math.cos(ang)*dist}px;--ty:${Math.sin(ang)*dist}px;
        animation:arP ${1.2+Math.random()*1.2}s ease-out ${Math.random()*0.5}s forwards;`;
      container.appendChild(p);
    }
  }

  // ----------------------------------------------------------
  // RESET
  // ----------------------------------------------------------
  function _reset(){
    _clearTimers();
    if(_vortex){_vortex.stop();_vortex=null;}
    if(_ambientBg){_ambientBg.stop();_ambientBg=null;}
    const g=id=>document.getElementById(id);
    const bg=g('ar-bg');if(bg)bg.style.opacity='0';
    const c=g('ar-card');if(c)c.style.boxShadow='0 0 0 0.5px rgba(0,200,220,0.1),0 24px 80px rgba(0,0,0,0.8)';
    const vc=g('ar-vortex');if(vc){vc.style.opacity='1';vc.getContext('2d').clearRect(0,0,vc.width,vc.height);}
    const img=g('ar-img');if(img){img.style.opacity='0';img.style.filter='saturate(0) brightness(2)';img.style.transition='opacity 2.5s ease,filter 3s ease';}
    const sc=g('ar-scan');if(sc){sc.style.opacity='0';sc.style.top=PAD+'px';}
    const rn=g('ar-ring');if(rn){rn.style.animation='none';rn.style.opacity='0';}
    const pt=g('ar-particles');if(pt)pt.innerHTML='';
    const np=g('ar-nameplate');if(np)np.style.transform=`translateY(${NAMEPLATE_H+10}px)`;
    ['ar-name','ar-divider','ar-flavor'].forEach(id=>{const e=g(id);if(e)e.style.opacity='0';});
  }

  // ----------------------------------------------------------
  // PUBLIC API
  // ----------------------------------------------------------
  return {

    play(imageUrl, audioBlob, onComplete) {
      _injectKF();

      // Preload image to get natural dimensions
      const preload = new Image();
      preload.crossOrigin = 'anonymous';

      preload.onload = () => {
        const imgW = preload.naturalWidth  || 1024;
        const imgH = preload.naturalHeight || 1024;

        // Build DOM sized to this image, then reset state
        _buildDOM(imgW, imgH);
        _reset();

        // Set src on the in-DOM img
        const img = document.getElementById('ar-img');
        if (img) img.src = imageUrl;

        // Build corners
        const card    = document.getElementById('ar-card');
        const corners = document.getElementById('ar-corners');
        if (card && corners) {
          corners.innerHTML = '';
          corners.appendChild(_buildCorners(card.offsetWidth, card.offsetHeight));
        }

        // Audio playback
        if (audioBlob) {
          try {
            const audio = document.getElementById('reveal-audio');
            if (audio) { audio.src = URL.createObjectURL(audioBlob); audio.play().catch(()=>{}); }
          } catch(e) {}
        }

        // Phase 0: Ambient bg
        const bgCanvas = document.getElementById('ar-bg');
        if (bgCanvas) {
          _ambientBg = new AmbientBg(bgCanvas);
          _ambientBg.start();
          bgCanvas.style.opacity = '1';
        }

        // Phase 1: Vortex
        _later(() => {
          const vc = document.getElementById('ar-vortex');
          if (vc) { _vortex = new VortexEngine(vc); _vortex.start(); }
        }, T.VORTEX_START);

        // Phase 2: Scan line
        _later(() => {
          const scan = document.getElementById('ar-scan');
          if (scan) _runScanLine(scan);
        }, T.SCAN_LINE);

        // Phase 3: Condense
        _later(() => { if (_vortex) _vortex.condense(); }, T.CONDENSE);

        // Phase 4: Ring + particles
        _later(() => {
          const ring = document.getElementById('ar-ring');
          if (ring) ring.style.animation = 'arRing 1.2s cubic-bezier(0,0.6,0.4,1) forwards';
          const pc = document.getElementById('ar-particles');
          if (pc) _spawnParticles(pc);
        }, T.BURST);

        // Phase 5: Creature materialises
        _later(() => {
          const i = document.getElementById('ar-img');
          if (i) { i.style.transition='opacity 0.8s ease,filter 2.8s ease'; i.style.opacity='1'; }
        }, T.CREATURE_IN);

        // Phase 6: Colour bleeds in
        _later(() => {
          if (_vortex) _vortex.fadeOut();
          const vc = document.getElementById('ar-vortex'); if (vc) vc.style.opacity = '0';
          const i  = document.getElementById('ar-img');    if (i)  i.style.filter = 'saturate(1) brightness(1)';
        }, T.COLOR_BLEED);

        // Phase 7: Card glow
        _later(() => {
          const c = document.getElementById('ar-card');
          if (c) c.style.boxShadow = '0 0 0 0.5px rgba(0,200,220,0.3),0 0 0 3px rgba(0,200,220,0.06),0 0 60px rgba(0,200,220,0.15),0 24px 80px rgba(0,0,0,0.8)';
        }, T.CARD_GLOW);

        // Phase 8: Name plate
        _later(() => {
          const np = document.getElementById('ar-nameplate');
          if (np) np.style.transform = 'translateY(0)';
          setTimeout(() => {
            const n=document.getElementById('ar-name'), d=document.getElementById('ar-divider');
            if(n) n.style.opacity='1'; if(d) d.style.opacity='1';
          }, 300);
          setTimeout(() => { const f=document.getElementById('ar-flavor'); if(f) f.style.opacity='1'; }, 600);
        }, T.NAMEPLATE);

        // Complete
        _later(() => {
          if (_ambientBg) _ambientBg.stop();
          const bg = document.getElementById('ar-bg'); if (bg) bg.style.opacity = '0';
          onComplete?.();
        }, T.COMPLETE);
      };

      preload.onerror = () => {
        console.warn('AumageReveal: image failed to load, skipping reveal');
        onComplete?.();
      };

      preload.src = imageUrl;
    },

    setName(text)      { const e=document.getElementById('ar-name');    if(e) e.textContent=text; },
    setFlavor(text)    { const e=document.getElementById('ar-flavor');  if(e) e.textContent=text; },
    setCatalogId(text) { const e=document.getElementById('ar-catalog'); if(e) e.textContent=text; },
  };

})();

window.AumageReveal = AumageReveal;
