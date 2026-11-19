/* BMW M3 Competition — passeio guiado pela rolagem
   GSAP 3.13 + ScrollTrigger + ScrollSmoother */
(() => {
  "use strict";

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  ScrollTrigger.config({ ignoreMobileResize: true });
  ScrollTrigger.clearScrollMemory("manual");
  window.scrollTo(0, 0);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const raf2 = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  // ---------------------------------------------------------------------------
  // Vídeo: 1920×1080 a partir do original 1280×720 (24 fps), com quadros
  // intermediários interpolados para 60 fps.
  // ---------------------------------------------------------------------------
  const VIDEO = { w: 1920, h: 1080, dur: 15.0, fps: 60 };

  // Rolagem: cada unidade = fração da altura da tela. Valores menores = menos rolagem para o filme andar.
  const UNIT_VH = 0.24;
  const INTRO_HOLD = 1.0;
  const END_HOLD = 4.6;
  const GAP_RATE = 1.0;
  const CARD_UNITS = 3.2;

  // Trilhas: [tempo do vídeo (s), x (%), y (%)] — medidas nos quadros reais do vídeo.
  const HOTSPOTS = [
    {
      id: "lanternas", chapter: "Lanternas", in: 0.05, out: 0.95,
      part: "Lanternas traseiras", title: "Olha essa assinatura",
      text: "Lanternas finas que avançam pelas laterais e marcam a largura do carro, mesmo de longe.",
      specs: [["Largura", "1.903 mm"], ["Bitola traseira", "1.605 mm"], ["Porta-malas", "480 l"]],
      pos: { left: "4%", top: "10%" },
      points: [{ track: [[0, 66, 55.5], [0.4, 72, 55], [0.8, 82.5, 51], [1.0, 87, 47.5]] }]
    },
    {
      id: "rodas", chapter: "Rodas e freios", in: 1.05, out: 2.25,
      part: "Rodas e freios", title: "Para parar tão bem quanto anda",
      text: "Rodas forjadas com medidas diferentes por eixo. Atrás dos raios, freios M Compound seguram os 530 cv.",
      specs: [["Rodas", "19\" diant. / 20\" tras."], ["Pinças dianteiras", "fixas, 6 pistões"], ["Carbon-cerâmico", "opcional, −14 kg"]],
      pos: { left: "4%", top: "10%" },
      points: [{ track: [[0.8, 24.5, 60], [1.0, 22.5, 63], [1.4, 23, 63], [1.8, 29.7, 67], [2.2, 41, 70], [2.4, 46, 69]] }]
    },
    {
      id: "farois", chapter: "Faróis", in: 2.35, out: 4.25,
      part: "Faróis", title: "Cara de poucos amigos",
      text: "LED redesenhados, com luz baixa e alta no mesmo módulo. No opcional adaptativo, o farol alto não ofusca quem vem de frente.",
      specs: [["Faróis", "LED, de série"], ["Opcional", "LED adaptativo"], ["Farol alto", "matricial"]],
      pos: { left: "4%", top: "10%" },
      points: [{ track: [[2.2, 25.5, 54.5], [2.6, 36.5, 54.5], [3.0, 48, 55.5], [3.4, 58, 55], [3.8, 66.5, 55.5], [4.2, 76, 58], [4.4, 80, 58]] }]
    },
    {
      id: "interior", chapter: "Interior", in: 7.3, out: 9.25,
      part: "Bancos e acabamento", title: "Sentou, encaixou",
      text: "Bancos esportivos M em couro Merino, firmes nas laterais. O azul-escuro de bancos e portas contrasta, sem exagero, com o verde da carroceria.",
      specs: [["Bancos", "M, couro Merino"], ["Cores", "4 por tipo de couro"], ["M Carbon bucket", "opcional, −9,6 kg"]],
      pos: { right: "4%", top: "10%" },
      points: [
        { track: [[7.2, 46, 63], [7.5, 46, 63], [8.0, 42, 60], [8.5, 41, 61], [9.0, 38.5, 74], [9.3, 36, 78]] },
        { from: 7.45, to: 8.5, track: [[7.4, 71, 55], [7.5, 71, 54], [8.0, 72, 54], [8.5, 73, 54], [9.0, 90, 59], [9.3, 97, 60]] }
      ]
    },
    {
      id: "volante", chapter: "Volante", in: 9.4, out: 11.35,
      part: "Volante", title: "Tudo na sua mão",
      text: "Três raios, comandos nas duas mãos e os botões vermelhos no alcance dos polegares. No M3 Competition, as aletas de troca são de fibra de carbono.",
      specs: [["Câmbio", "M Steptronic, 8 marchas"], ["Direção", "14,6:1, variável"], ["Aletas", "fibra de carbono"]],
      pos: { right: "4%", top: "10%" },
      points: [{ track: [[9.0, 24.5, 33], [9.5, 30, 44], [10.0, 33, 47], [10.5, 34, 49], [11.0, 28, 52], [11.5, 19, 60]] }]
    },
    {
      id: "multimidia", chapter: "Multimídia", in: 12.6, out: 14.35,
      part: "Multimídia", title: "Uma tela só, do painel ao centro",
      text: "O BMW Curved Display junta instrumentos e central numa só tela curva, inclinada para o motorista.",
      specs: [["Tela", "BMW Curved Display"], ["Sistema", "Operating System 8.5"], ["Opcional", "Head-Up Display"]],
      pos: { right: "3%", bottom: "6%" },
      points: [{ track: [[11.0, 66, 58], [11.5, 70, 64], [12.0, 70, 55], [12.5, 60, 48], [13.0, 55, 45], [13.5, 53, 43], [14.0, 51, 43], [14.5, 50, 42], [15.0, 50, 42]] }]
    }
  ];
  const OUTRO_IN = 14.45;

  // Foco horizontal da câmera (0–1) para enquadrar a peça em telas estreitas.
  const FOCUS = [
    [0, .66], [0.95, .85], [1.05, .25], [1.4, .25], [1.8, .3], [2.25, .4], [2.35, .27], [3.0, .48],
    [3.4, .56], [3.8, .62], [4.25, .7], [5.0, .6], [7.0, .55], [7.5, .58], [8.0, .57], [8.5, .57],
    [9.25, .45], [9.4, .3], [10.5, .34], [11.35, .26], [12.0, .6], [12.6, .6], [13.0, .55], [15.0, .5]
  ];

  // ---------------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------------
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function sample(track, t) {
    if (t <= track[0][0]) return track[0].slice(1);
    for (let i = 1; i < track.length; i++) {
      if (t <= track[i][0]) {
        const a = track[i - 1], b = track[i];
        const k = (t - a[0]) / (b[0] - a[0]);
        return a.slice(1).map((v, j) => v + (b[j + 1] - v) * k);
      }
    }
    return track[track.length - 1].slice(1);
  }

  const windows = HOTSPOTS.map(h => [h.in, h.out, CARD_UNITS / (h.out - h.in)]);
  const breaks = [...new Set([0, VIDEO.dur, ...HOTSPOTS.flatMap(h => [h.in, h.out])])].sort((a, b) => a - b);
  const pieces = [];
  let acc = INTRO_HOLD;
  for (let i = 0; i < breaks.length - 1; i++) {
    const a = breaks[i], b = breaks[i + 1];
    const w = windows.find(([s, e]) => a >= s && b <= e);
    const units = (b - a) * (w ? w[2] : GAP_RATE);
    pieces.push({ a, b, T0: acc, units });
    acc += units;
  }
  const VIDEO_END_T = acc;
  const TOTAL = acc + END_HOLD;
  function T(t) {
    for (const p of pieces) if (t <= p.b) return p.T0 + (t - p.a) / (p.b - p.a) * p.units;
    return VIDEO_END_T;
  }

  // ---------------------------------------------------------------------------
  // DOM do passeio
  // ---------------------------------------------------------------------------
  const stage = document.querySelector(".stage");
  const video = document.getElementById("film");
  const svg = document.getElementById("lines");
  const dotsLayer = document.getElementById("dots");
  const cardsLayer = document.getElementById("cards");
  const rail = document.getElementById("rail");
  const progressFill = document.getElementById("progressFill");
  const SVGNS = "http://www.w3.org/2000/svg";

  HOTSPOTS.forEach((h, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.setAttribute("aria-label", h.part);
    Object.assign(card.style, h.pos);
    card.innerHTML = `
      <div class="card__head"><span class="card__index">${String(i + 1).padStart(2, "0")}</span><span>${h.part}</span></div>
      <h3>${h.title}</h3>
      <p class="card__text">${h.text}</p>
      <dl class="card__specs">${h.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
      <span class="card__progress" aria-hidden="true"><i></i></span>`;
    cardsLayer.appendChild(card);
    h.card = card;
    h.cardParts = card.querySelectorAll(".card__head, h3, .card__text, .card__specs div");
    h.cardProgress = card.querySelector(".card__progress i");

    h.points.forEach(p => {
      p.pos = document.createElement("div");
      p.pos.className = "dot-pos";
      p.dot = document.createElement("div");
      p.dot.className = "dot";
      p.dot.innerHTML = '<span class="dot__pulse"></span><span class="dot__ring"></span><span class="dot__core"></span>';
      p.pos.appendChild(p.dot);
      dotsLayer.appendChild(p.pos);
      p.shadow = document.createElementNS(SVGNS, "path");
      p.shadow.setAttribute("class", "shadow");
      p.path = document.createElementNS(SVGNS, "path");
      p.node = document.createElementNS(SVGNS, "circle");
      p.node.setAttribute("class", "node");
      p.node.setAttribute("r", "2.5");
      p.draw = 0;
      svg.append(p.shadow, p.path, p.node);
    });

    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = `<span>${h.chapter}</span><i aria-hidden="true"></i>`;
    btn.setAttribute("aria-label", `Ir para ${h.chapter.toLowerCase()}`);
    btn.addEventListener("click", () => goToTimeline((T(h.in) + T(h.out)) / 2));
    rail.appendChild(btn);
    h.btn = btn;
  });

  // ---------------------------------------------------------------------------
  // Layout do vídeo
  // ---------------------------------------------------------------------------
  const view = { W: 0, H: 0, s: 1, dw: 0, dh: 0, ox: 0, oy: 0, portrait: false, pan: null };

  function layout() {
    view.W = stage.clientWidth;
    view.H = stage.clientHeight;
    view.portrait = view.W / view.H < 1;
    const mediaH = view.portrait ? view.H * 0.6 : view.H;
    view.s = Math.max(view.W / VIDEO.w, mediaH / VIDEO.h);
    view.dw = VIDEO.w * view.s;
    view.dh = VIDEO.h * view.s;
    view.oy = view.portrait ? 0 : (view.H - view.dh) / 2;
    stage.style.setProperty("--media-h", (mediaH / view.H * 100).toFixed(2) + "%");
    video.style.width = view.dw + "px";
    video.style.height = view.dh + "px";
    view.pan = null;
  }

  function targetPan(t) {
    const minX = view.W - view.dw;
    if (minX >= 0) return minX / 2;
    return clamp(view.W / 2 - sample(FOCUS, t)[0] * view.dw, minX, 0);
  }

  const toScreen = (x, y) => [view.ox + x / 100 * view.dw, view.oy + y / 100 * view.dh];

  function connector(px, py, card) {
    const L = card.offsetLeft, Tp = card.offsetTop, R = L + card.offsetWidth, B = Tp + card.offsetHeight;
    const pad = 28, E = 30;
    let ax, ay, ex, ey;
    if (py > B + 14) { ax = clamp(px, L + pad, R - pad); ay = B; ex = ax; ey = ay + Math.min(E, (py - B) * 0.5); }
    else if (py < Tp - 14) { ax = clamp(px, L + pad, R - pad); ay = Tp; ex = ax; ey = ay - Math.min(E, (Tp - py) * 0.5); }
    else if (px < L) { ax = L; ay = clamp(py, Tp + pad, B - pad); ex = ax - E; ey = ay; }
    else { ax = R; ay = clamp(py, Tp + pad, B - pad); ex = ax + E; ey = ay; }
    const dx = ex - px, dy = ey - py, len = Math.hypot(dx, dy) || 1;
    const sx = px + dx / len * 11, sy = py + dy / len * 11;
    return [`M${sx.toFixed(1)} ${sy.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}L${ax.toFixed(1)} ${ay.toFixed(1)}`, ax, ay];
  }

  // ---------------------------------------------------------------------------
  // Timeline principal (scrubbed pela rolagem)
  // ---------------------------------------------------------------------------
  const state = { t: 0 };
  const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });
  tl.set({}, {}, TOTAL);
  pieces.forEach(p => tl.to(state, { t: p.b, duration: p.units }, p.T0));

  tl.to("#intro", { autoAlpha: 0, y: -40, duration: 0.7, ease: "power1.in" }, 0.25);
  tl.fromTo(rail, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.7);

  gsap.set(".dot", { scale: 0.4, opacity: 0 });
  HOTSPOTS.forEach(h => {
    const tin = T(h.in), tout = T(h.out);
    h.points.forEach((p, k) => {
      const pin = p.from ? T(p.from) : tin;
      const pout = p.to ? T(p.to) : tout;
      tl.to(p.dot, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2.2)" }, pin)
        .to(p, { draw: 1, duration: 0.5, ease: "power2.inOut" }, pin + 0.12)
        .to(p, { draw: 0, duration: 0.35, ease: "power2.in" }, pout - 0.5 + k * 0.05)
        .to(p.dot, { scale: 0.4, opacity: 0, duration: 0.25, ease: "power2.in" }, pout - 0.25);
    });
    const from = h.pos.bottom ? "inset(100% 0% 0% 0% round 12px)" : "inset(0% 0% 100% 0% round 12px)";
    gsap.set(h.card, { autoAlpha: 0 });
    gsap.set(h.cardParts, { opacity: 0 });
    tl.fromTo(h.card, { autoAlpha: 1, clipPath: from },
      { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0% round 12px)", duration: 0.45, ease: "power3.out", immediateRender: false }, tin + 0.5)
      .fromTo(h.cardParts, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.045, ease: "power2.out", immediateRender: false }, tin + 0.58)
      .fromTo(h.cardProgress, { scaleX: 0 }, { scaleX: 1, duration: tout - tin - 1.1, ease: "none", immediateRender: false }, tin + 0.5)
      .to(h.card, { autoAlpha: 0, y: -10, duration: 0.38, ease: "power2.in" }, tout - 0.62);
  });

  const tOutro = T(OUTRO_IN);
  gsap.set("#outro", { autoAlpha: 0 });
  tl.to("#veil", { opacity: 1, duration: 0.8, ease: "power1.inOut" }, tOutro - 0.2)
    .fromTo("#outro", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", immediateRender: false }, tOutro);

  // Saída: o filme recolhe para uma janela e a landing sobe.
  const tExit = VIDEO_END_T + 1.4;
  tl.to(rail, { autoAlpha: 0, duration: 0.4 }, tExit)
    .to(".progress", { autoAlpha: 0, duration: 0.4 }, tExit)
    .to("#outro", { autoAlpha: 0, y: -24, duration: 0.5, ease: "power2.in" }, tExit)
    .to("#veil", { opacity: 0.35, duration: 1.5, ease: "power2.inOut" }, tExit + 0.2)
    .fromTo("#frame", { clipPath: "inset(0% 0% 0% 0% round 0px)" },
      { clipPath: "inset(10% 6% 10% 6% round 24px)", duration: 2.2, ease: "power3.inOut", immediateRender: false }, tExit + 0.2);

  // ---------------------------------------------------------------------------
  // Render por quadro
  // ---------------------------------------------------------------------------
  let ready = false;
  const SMOOTH_TAU = 0.085;
  let shown = 0;
  let lastTick = performance.now();
  let seeking = false, wantFrame = -1, shownFrame = -1;
  const maxFrame = () => Math.floor((video.duration || VIDEO.dur) * VIDEO.fps) - 1;

  function requestFrame(frame) {
    wantFrame = frame;
    if (!ready || seeking || frame === shownFrame) return;
    seeking = true;
    shownFrame = frame;
    video.currentTime = (frame + 0.5) / VIDEO.fps;
  }
  video.addEventListener("seeked", () => {
    seeking = false;
    if (wantFrame !== shownFrame) requestFrame(wantFrame);
  });

  function render() {
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastTick) / 1000);
    lastTick = now;
    const k = 1 - Math.exp(-dt / SMOOTH_TAU);
    shown += (state.t - shown) * k;
    if (Math.abs(state.t - shown) < 0.0005) shown = state.t;
    const t = shown;
    if (stage.clientWidth !== view.W || stage.clientHeight !== view.H) layout();

    const target = targetPan(t);
    view.pan = view.pan === null ? target : view.pan + (target - view.pan) * Math.min(1, k * 1.2);
    view.ox = view.pan;
    video.style.transform = `translate3d(${view.ox.toFixed(2)}px, ${view.oy.toFixed(2)}px, 0)`;

    requestFrame(Math.max(0, Math.min(maxFrame(), Math.round(t * VIDEO.fps))));

    for (const h of HOTSPOTS) {
      for (const p of h.points) {
        const [x, y] = toScreen(...sample(p.track, t));
        p.pos.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        const on = p.draw > 0.001;
        const vis = on ? "visible" : "hidden";
        if (p.path.style.visibility !== vis) p.path.style.visibility = p.shadow.style.visibility = p.node.style.visibility = vis;
        if (!on) continue;
        const [d, ax, ay] = connector(x, y, h.card);
        p.path.setAttribute("d", d);
        p.shadow.setAttribute("d", d);
        const len = p.path.getTotalLength();
        const off = (len * (1 - p.draw)).toFixed(2);
        for (const el of [p.path, p.shadow]) {
          el.style.strokeDasharray = `${len} ${len}`;
          el.style.strokeDashoffset = off;
        }
        p.node.setAttribute("cx", ax.toFixed(1));
        p.node.setAttribute("cy", ay.toFixed(1));
        p.node.style.opacity = clamp((p.draw - 0.85) / 0.15, 0, 1).toFixed(2);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Scroll
  // ---------------------------------------------------------------------------
  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: reduce ? 0 : 1,
    smoothTouch: reduce ? 0 : 0.1,
    effects: false
  });
  smoother.paused(true);

  const st = ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: () => "+=" + Math.round(TOTAL * UNIT_VH * stage.clientHeight),
    pin: true,
    scrub: true,
    animation: tl,
    invalidateOnRefresh: true,
    onUpdate: () => {
      const time = tl.time();
      progressFill.style.transform = `scaleX(${clamp(time / VIDEO_END_T, 0, 1).toFixed(4)})`;
      let rightCard = false;
      HOTSPOTS.forEach(h => {
        const on = time >= T(h.in) && time <= T(h.out);
        h.btn.classList.toggle("is-active", on);
        if (on && h.pos.right) rightCard = true;
      });
      rail.classList.toggle("is-hidden", rightCard); // nunca sobrepõe cartões do lado direito
    }
  });

  function goToTimeline(time) {
    smoother.scrollTo(st.start + (time / TOTAL) * (st.end - st.start), true);
  }

  document.querySelectorAll("[data-scroll-to]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const sel = a.getAttribute("data-scroll-to");
      if (sel === "#top") smoother.scrollTo(0, true);
      else smoother.scrollTo(sel, true, "top top");
    });
  });

  // ---------------------------------------------------------------------------
  // Landing
  // ---------------------------------------------------------------------------
  // Manifesto: as palavras acendem conforme a rolagem
  const manifesto = document.getElementById("manifesto");
  manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(" ");
  gsap.to("#manifesto .w", {
    opacity: 1, stagger: 0.1, ease: "none",
    scrollTrigger: { trigger: manifesto, start: "top 78%", end: "bottom 42%", scrub: true }
  });

  // Imagens que se revelam
  document.querySelectorAll(".reveal").forEach(fig => {
    gsap.fromTo(fig, { clipPath: "inset(12% 8% 12% 8% round 24px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 18px)", ease: "none",
      scrollTrigger: { trigger: fig, start: "top 92%", end: "center 55%", scrub: true }
    });
    gsap.fromTo(fig.querySelector("img"), { scale: 1.15 }, {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: fig, start: "top 92%", end: "bottom 30%", scrub: true }
    });
  });

  // Engenharia: o item no centro da tela define a imagem
  const engItems = [...document.querySelectorAll(".eng-item")];
  const engImgs = [...document.querySelectorAll(".engineering__frame img")];
  const engSteps = [...document.querySelectorAll(".engineering__steps li")];
  function setEng(i) {
    engItems.forEach((el, j) => el.classList.toggle("is-active", j === i));
    engImgs.forEach((el, j) => el.classList.toggle("is-active", j === i));
    engSteps.forEach((el, j) => el.classList.toggle("is-active", j === i));
  }
  setEng(0);
  engItems.forEach((el, i) => ScrollTrigger.create({
    trigger: el, start: "top 60%", end: "bottom 60%",
    onToggle: self => self.isActive && setEng(i)
  }));

  // A imagem da engenharia fica presa enquanto a lista passa (sticky não funciona dentro do ScrollSmoother).
  const mm = gsap.matchMedia();
  mm.add("(min-width: 861px)", () => {
    const s = ScrollTrigger.create({ trigger: ".engineering", start: "top top", end: "bottom bottom", pin: ".engineering__media", pinSpacing: false });
    return () => s.kill();
  });
  mm.add("(max-width: 860px)", () => {
    const s = ScrollTrigger.create({ trigger: ".engineering__media", start: "top 60px", endTrigger: ".engineering", end: "bottom bottom", pin: true, pinSpacing: false });
    return () => s.kill();
  });

  // Galeria horizontal
  mm.add("(min-width: 641px)", () => {
    const track = document.getElementById("galleryTrack");
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -distance(), ease: "none",
      scrollTrigger: { trigger: "#galeria", start: "top top", end: () => "+=" + distance(), pin: true, scrub: true, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    return () => tween.scrollTrigger && tween.scrollTrigger.kill();
  });

  // Versões: barras de aceleração crescem ao entrar
  ScrollTrigger.create({ trigger: ".versions__table", start: "top 80%", onEnter: () => document.querySelector(".versions").classList.add("is-in") });

  // Encerramento: leve aproximação da imagem
  gsap.fromTo(".closing__bg", { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".closing", start: "top bottom", end: "bottom top", scrub: true } });

  // Abas da ficha técnica (teclado: setas, Home, End)
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
    ScrollTrigger.refresh();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", e => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); selectTab(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
      if (e.key === "Home") { e.preventDefault(); selectTab(tabs[0], true); }
      if (e.key === "End") { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
    });
  });

  window.__m3 = { go: t => goToTimeline(T(t)), T, tl, st, smoother, HOTSPOTS, sample, toScreen, targetPan, view, VIDEO_END_T, TOTAL };

  layout();
  gsap.ticker.add(render);
  window.addEventListener("resize", layout);
  ScrollTrigger.addEventListener("refresh", layout);

  // ---------------------------------------------------------------------------
  // Entrada: conta-giros acompanha o carregamento; janela abre para o filme
  // ---------------------------------------------------------------------------
  const loader = document.getElementById("loader");
  const countEl = document.getElementById("loaderCount");
  const needle = document.getElementById("tachNeedle");
  const fill = document.getElementById("tachFill");

  // Desenha o conta-giros: 0–8 mil rpm em 240°, faixa vermelha a partir de 7.
  const C = 120, R = 92, A0 = -120, SWEEP = 240, MAXR = 8;
  const pt = (deg, r) => { const a = deg * Math.PI / 180; return [C + r * Math.sin(a), C - r * Math.cos(a)]; };
  const angleOf = rpm => A0 + rpm / MAXR * SWEEP;
  const arc = (r, d0, d1) => { const [x0, y0] = pt(d0, r), [x1, y1] = pt(d1, r); return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${d1 - d0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };
  const ticks = document.getElementById("tachTicks");
  let tickSVG = "";
  for (let r = 0; r <= MAXR; r += 0.5) {
    const major = Number.isInteger(r), red = r >= 7;
    const [x0, y0] = pt(angleOf(r), R - (major ? 9 : 5)), [x1, y1] = pt(angleOf(r), R);
    tickSVG += `<line class="tach__tick${major ? " tach__tick--major" : ""}${red ? " tach__tick--red" : ""}" x1="${x0.toFixed(2)}" y1="${y0.toFixed(2)}" x2="${x1.toFixed(2)}" y2="${y1.toFixed(2)}"/>`;
    if (major) { const [tx, ty] = pt(angleOf(r), R - 19); tickSVG += `<text class="tach__num${red ? " tach__num--red" : ""}" x="${tx.toFixed(2)}" y="${ty.toFixed(2)}">${r}</text>`; }
  }
  ticks.innerHTML = tickSVG;
  document.getElementById("tachTrack").setAttribute("d", arc(R + 6, A0, A0 + SWEEP));
  fill.setAttribute("d", arc(R + 6, A0, A0 + SWEEP));
  const fillLen = fill.getTotalLength();
  fill.style.strokeDasharray = `${fillLen} ${fillLen}`;

  const LOAD_RPM = 7.4; // 100% carregado = ponteiro já na faixa vermelha
  const gauge = { p: 0 };
  function drawGauge() {
    const rpm = gauge.p * LOAD_RPM;
    gsap.set(needle, { rotation: angleOf(rpm), svgOrigin: "120 120" });
    fill.style.strokeDashoffset = (fillLen * (1 - rpm / MAXR)).toFixed(2);
    countEl.textContent = String(Math.round(gauge.p * 100)).padStart(3, "0");
  }
  drawGauge();

  gsap.set(".topbar__name, .topbar__logo, .topbar__link", { opacity: 0, y: -8 });
  gsap.set(".hero__line, .hero__lead, .scrollhint", { opacity: 0, y: 26 });

  // Progresso exibido: acompanha o buffer real, mas nunca mais rápido que um ritmo mínimo.
  const MIN_LOAD = reduce ? 0.3 : 1.7;
  const startTime = performance.now();
  let realP = 0;
  function bufferP() {
    if (!video.duration || !video.buffered.length) return 0;
    return video.buffered.end(video.buffered.length - 1) / video.duration;
  }
  let finished = false;
  function loadTick() {
    if (finished) return;
    realP = Math.max(realP, video.readyState >= 4 ? 1 : bufferP());
    const paced = Math.min(realP, (performance.now() - startTime) / 1000 / MIN_LOAD);
    gauge.p += (paced - gauge.p) * 0.12;
    if (paced >= 1 && gauge.p > 0.995) { gauge.p = 1; drawGauge(); finished = true; openSite(); return; }
    drawGauge();
  }
  gsap.ticker.add(loadTick);
  setTimeout(() => { realP = 1; }, 9000); // segurança: nunca prende o visitante

  async function openSite() {
    gsap.ticker.remove(loadTick);
    ready = true;
    shownFrame = -1;
    // Trabalho pesado antes da abertura, ainda com a tela preta: medidas e primeiro quadro.
    layout();
    ScrollTrigger.refresh();
    smoother.scrollTop(0);
    requestFrame(0);
    // espera o primeiro quadro estar decodificado (no máximo 1,5 s)
    const t0 = performance.now();
    while ((video.readyState < 2 || seeking) && performance.now() - t0 < 1500) await raf2();
    await raf2();

    const W = window.innerWidth, H = window.innerHeight;
    const winW = Math.min(W * (W < 700 ? 0.7 : 0.34), 480), winH = winW * 9 / 16;
    // no retrato o vídeo ocupa só a faixa de cima: a janela abre sobre ele, não sobre o chão
    const cy = view.portrait ? view.dh / 2 : H / 2;
    const dy = cy - H / 2;
    gsap.set("#media", { transformOrigin: `50% ${(cy / H * 100).toFixed(1)}%` });
    const bars = {
      top: ".loader__bar--top", bottom: ".loader__bar--bottom",
      left: ".loader__bar--left", right: ".loader__bar--right"
    };
    const done = () => {
      loader.style.display = "none";
      document.body.classList.remove("is-loading");
      smoother.paused(false);
    };

    if (reduce) {
      gsap.timeline({ onComplete: done })
        .to(loader, { opacity: 0, duration: 0.4 })
        .to(".topbar__name, .topbar__logo, .topbar__link, .hero__line, .hero__lead, .scrollhint", { opacity: 1, y: 0, duration: 0.3 }, 0);
      return;
    }

    const rev = { p: 1 };
    gsap.timeline({ onComplete: done, defaults: { ease: "expo.inOut" } })
      // o ponteiro dá uma acelerada até o limite e volta
      .to(rev, { p: 7.9 / LOAD_RPM, duration: 0.22, ease: "power2.out", onUpdate: () => { gauge.p = rev.p; drawGauge(); countEl.textContent = "100"; } })
      .to(rev, { p: 0, duration: 0.5, ease: "power3.inOut", onUpdate: () => { gauge.p = rev.p; drawGauge(); countEl.textContent = "100"; } })
      .to(".loader__ui, .loader__meta", { opacity: 0, y: -8, duration: 0.35, ease: "power2.in", stagger: 0.02 }, 0.4)
      // abre a janela 16:9 com o filme
      .to(bars.top, { y: dy - winH / 2, duration: 0.8, ease: "expo.out" }, 0.8)
      .to(bars.bottom, { y: dy + winH / 2, duration: 0.8, ease: "expo.out" }, 0.8)
      .to(bars.left, { x: -winW / 2, duration: 0.8, ease: "expo.out" }, 0.8)
      .to(bars.right, { x: winW / 2, duration: 0.8, ease: "expo.out" }, 0.8)
      // expande para a tela inteira
      .to(bars.top, { y: -H / 2 - 4, duration: 1.15 }, 1.75)
      .to(bars.bottom, { y: H / 2 + 4, duration: 1.15 }, 1.75)
      .to(bars.left, { x: -W / 2 - 4, duration: 1.15 }, 1.75)
      .to(bars.right, { x: W / 2 + 4, duration: 1.15 }, 1.75)
      .fromTo("#media", { scale: 1.18 }, { scale: 1, duration: 1.6, ease: "expo.out" }, 1.75)
      .to(".topbar__name, .topbar__logo, .topbar__link", { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }, 2.45)
      .to(".hero__line", { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" }, 2.35)
      .to(".hero__lead, .scrollhint", { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 2.55);
  }

  video.load();

  // iOS só permite buscar quadros depois de uma interação com o vídeo
  const unlock = () => {
    const p = video.play();
    if (p && p.then) p.then(() => video.pause()).catch(() => {});
    window.removeEventListener("touchstart", unlock);
  };
  window.addEventListener("touchstart", unlock, { passive: true });
})();
