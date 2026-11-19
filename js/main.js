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
  const END_HOLD = 5.2;
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
    layoutMosaic();
  }

  // Mosaico do fim: cada foto ocupa uma célula do tamanho da tela, em volta do filme.
  const zoomEl = document.getElementById("zoom");
  const frameEl = document.getElementById("frame");
  const shadeEl = document.querySelector(".stage__shade");
  const tiles = [...document.querySelectorAll("#mosaic img")].map(el => ({ el, c: el.dataset.cell.split(",").map(Number) }));
  const Z = { s: 0.4, bandH: 0, gap: 0 };
  function layoutMosaic() {
    Z.bandH = view.portrait ? Math.min(view.dh, view.H) : view.H;
    Z.s = view.portrait ? 0.62 : 0.38;
    Z.gap = 14 / Z.s;
    tiles.forEach(({ el }) => { el.style.width = view.W + "px"; el.style.height = Z.bandH + "px"; });
    zoomEl.style.transformOrigin = `${view.W / 2}px ${Z.bandH / 2}px`;
    lastZ = -1;
  }
  const exitState = { p: 0 };
  const still = document.getElementById("still");
  let stillOn = false;
  let lastZ = -1;
  function renderZoom() {
    const p = exitState.p;
    if (p === lastZ) return;
    lastZ = p;
    // no recuo, o último quadro em imagem substitui o vídeo: escalar imagem é bem mais leve
    const zooming = p > 0;
    if (zooming !== stillOn) {
      stillOn = zooming;
      still.style.width = video.style.width;
      still.style.height = video.style.height;
      still.style.transform = video.style.transform;
      still.style.visibility = zooming ? "visible" : "hidden";
      video.style.visibility = zooming ? "hidden" : "visible";
    }
    // no retrato o mosaico termina centrado na tela, não na faixa do vídeo
    const dy = view.portrait ? (view.H - Z.bandH) / 2 * p : 0;
    zoomEl.style.transform = zooming ? `translate3d(0, ${dy.toFixed(1)}px, 0) scale(${(1 + (Z.s - 1) * p).toFixed(4)})` : "";
    frameEl.style.clipPath = view.portrait && p > 0 ? `inset(0px 0px ${((view.H - Z.bandH) * Math.min(1, p * 2)).toFixed(1)}px 0px)` : "";
    shadeEl.style.opacity = (1 - p).toFixed(3);
    // as fotos chegam um pouco mais rápido que o recuo: sensação de profundidade
    const spread = 1 + 0.12 * (1 - p);
    // no retrato, a linha de baixo vem de fora da tela (abaixo da área escura sob o vídeo)
    const below = view.portrait ? (view.H - Z.bandH) * (1 - p) : 0;
    for (const { el, c: [i, j] } of tiles) {
      const x = i * (view.W + Z.gap) * spread, y = j * (Z.bandH + Z.gap) * spread + (j > 0 ? below : 0);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.visibility = zooming ? "visible" : "hidden";
    }
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

  // Saída: a câmera recua e o filme vira o centro de um mosaico de fotos.
  const tExit = VIDEO_END_T + 1.2;
  tl.to(rail, { autoAlpha: 0, duration: 0.4 }, tExit)
    .to(".progress", { autoAlpha: 0, duration: 0.4 }, tExit)
    .to("#outro", { autoAlpha: 0, y: -24, duration: 0.5, ease: "power2.in" }, tExit)
    .to("#veil", { opacity: 0, duration: 1.2, ease: "power1.inOut" }, tExit + 0.1)
    .to(exitState, { p: 1, duration: 3.1, ease: "power2.inOut" }, tExit + 0.2);

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
    renderZoom();

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
  const mm = gsap.matchMedia();

  // Manifesto: as palavras acendem e as fotos se abrem entre elas
  const manifesto = document.getElementById("manifesto");
  [...manifesto.childNodes].forEach(n => {
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.append(part); return; }
      const w = document.createElement("span");
      w.className = "w";
      w.textContent = part;
      frag.append(w);
    });
    n.replaceWith(frag);
  });
  const manTl = gsap.timeline({ scrollTrigger: { trigger: manifesto, start: "top 80%", end: "bottom 40%", scrub: true } });
  manifesto.querySelectorAll(".w, .chip").forEach((el, i) => {
    if (el.classList.contains("chip")) {
      manTl.to(el, { clipPath: "inset(0% 0% 0% 0% round 999px)", duration: 2.4, ease: "power3.out" }, i * 0.5)
        .fromTo(el.querySelector("img"), { scale: 1.6 }, { scale: 1, duration: 3, ease: "power2.out" }, i * 0.5);
    } else {
      manTl.to(el, { opacity: 1, duration: 0.6 }, i * 0.5);
    }
  });

  // Desenho: a foto parte de uma janela pequena e a câmera se aproxima até a tela cheia
  mm.add({ narrow: "(max-width: 760px)", wide: "(min-width: 761px)" }, ctx => {
    const from = ctx.conditions.narrow ? "inset(52% 6% 16% 6%)" : "inset(22% 5% 14% 46%)";
    const dtl = gsap.timeline({ scrollTrigger: { trigger: ".dolly", start: "top top", end: "+=170%", pin: true, scrub: true } });
    dtl.fromTo(".dolly__frame", { clipPath: from }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.inOut" }, 0)
      .fromTo(".dolly__frame img", { scale: 1.35 }, { scale: 1, duration: 1.2, ease: "power1.out" }, 0)
      .to(".dolly__head", { y: -60, opacity: 0, filter: "blur(6px)", duration: 0.45, ease: "power1.in" }, 0.35)
      .fromTo(".dolly__frame", { "--shade": 0 }, { "--shade": 1, duration: 0.3 }, 0.85)
      .fromTo(".dolly__facts > div", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.06, ease: "power2.out" }, 0.95)
      .to({}, { duration: 0.25 });
  });

  // Engenharia: a foto nova entra como cortina e o contador rola
  const engItems = [...document.querySelectorAll(".eng-item")];
  const engImgs = [...document.querySelectorAll(".engineering__frame img")];
  const engSteps = [...document.querySelectorAll(".engineering__steps li")];
  let engCur = 0;
  gsap.set(engImgs, { clipPath: "inset(100% 0% 0% 0%)" });
  gsap.set(engImgs[0], { clipPath: "inset(0% 0% 0% 0%)", zIndex: 1 });
  engItems[0].classList.add("is-active");
  engSteps[0].classList.add("is-active");
  function setEng(i) {
    if (i === engCur) return;
    const down = i > engCur, prev = engCur;
    engCur = i;
    engItems.forEach((el, j) => el.classList.toggle("is-active", j === i));
    engSteps.forEach((el, j) => el.classList.toggle("is-active", j === i));
    engImgs.forEach((el, j) => { el.style.zIndex = j === i ? 2 : j === prev ? 1 : 0; });
    gsap.fromTo(engImgs[i], { clipPath: down ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05, ease: "expo.inOut", overwrite: true });
    gsap.fromTo(engImgs[i], { scale: 1.18 }, { scale: 1, duration: 1.5, ease: "expo.out" });
    gsap.to("#engNum", { yPercent: -25 * i, duration: 0.9, ease: "expo.inOut", overwrite: true });
  }
  engItems.forEach((el, i) => ScrollTrigger.create({
    trigger: el, start: "top 60%", end: "bottom 60%",
    onToggle: self => self.isActive && setEng(i)
  }));
  mm.add("(min-width: 861px)", () => {
    const s = ScrollTrigger.create({ trigger: ".engineering", start: "top top", end: "bottom bottom", pin: ".engineering__media", pinSpacing: false });
    return () => s.kill();
  });
  mm.add("(max-width: 860px)", () => {
    const s = ScrollTrigger.create({ trigger: ".engineering__media", start: "top 60px", endTrigger: ".engineering", end: "bottom bottom", pin: true, pinSpacing: false });
    return () => s.kill();
  });

  // Galeria em túnel: as fotos vêm do fundo em direção à câmera
  const tItems = [...document.querySelectorAll("#tunnelSpace li")].map(el => ({ el, x: +el.dataset.x, y: +el.dataset.y, cap: el.dataset.cap }));
  const tIndex = document.getElementById("tunnelIndex"), tText = document.getElementById("tunnelText");
  const DEPTH = 1100, NEAR = 400, TRAVEL = NEAR + (tItems.length - 1) * DEPTH;
  let tCur = 0;
  function renderTunnel(p) {
    const cam = p * TRAVEL;
    tItems.forEach((it, i) => {
      const z = -NEAR - i * DEPTH + cam;
      let o = clamp((z + 3600) / 1300, 0, 1) * clamp((640 - z) / 380, 0, 1);
      it.el.style.opacity = o.toFixed(3);
      it.el.style.visibility = o > 0.001 ? "visible" : "hidden";
      if (o > 0.001) it.el.style.transform = `translate(-50%, -50%) translate3d(${it.x}vw, ${it.y}vh, ${z.toFixed(1)}px)`;
    });
    const idx = clamp(Math.round((cam - NEAR) / DEPTH + 0.35), 0, tItems.length - 1);
    if (idx !== tCur) {
      tCur = idx;
      gsap.timeline()
        .to(".tunnel__caption", { opacity: 0, y: -6, duration: 0.18, ease: "power1.in" })
        .add(() => { tIndex.textContent = String(idx + 1).padStart(2, "0"); tText.textContent = tItems[idx].cap; })
        .fromTo(".tunnel__caption", { y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
  }
  renderTunnel(0);
  ScrollTrigger.create({
    trigger: ".tunnel", start: "top top", end: () => "+=" + Math.round(tItems.length * 0.62 * window.innerHeight),
    pin: true, scrub: true, invalidateOnRefresh: true,
    onUpdate: self => renderTunnel(self.progress)
  });

  // Cabine: a página clareia ao entrar e volta a escurecer ao sair; fotos em velocidades diferentes
  const cabin = document.querySelector(".cabin");
  const dark = { "--light": 0, "--ink": "#ecefed", "--ink-2": "#b9c1bc", "--ink-hair": "rgba(255,255,255,0.08)" };
  const light = { "--light": 1, "--ink": "#0c0e0d", "--ink-2": "#4b5450", "--ink-hair": "rgba(12,14,13,0.16)" };
  gsap.set(cabin, dark);
  const topbar = document.getElementById("topbar");
  ScrollTrigger.create({ trigger: cabin, start: "top 35%", end: "bottom 65%", toggleClass: { targets: topbar, className: "is-light" } });
  gsap.timeline({ scrollTrigger: { trigger: cabin, start: "top 70%", end: "bottom 30%", scrub: true } })
    .to(cabin, { ...light, duration: 0.18, ease: "power1.inOut" }, 0)
    .to(cabin, { ...dark, duration: 0.18, ease: "power1.inOut" }, 0.82);
  gsap.fromTo(".cabin__main img", { yPercent: -9 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".cabin__main", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(".cabin__side", { y: 120 }, { y: -120, ease: "none", scrollTrigger: { trigger: cabin, start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(".cabin__side img", { yPercent: 0 }, { yPercent: -12, ease: "none", scrollTrigger: { trigger: cabin, start: "top bottom", end: "bottom top", scrub: true } });

  // Versões: linhas entram uma a uma e as barras crescem
  gsap.from(".versions__row:not(.versions__row--head)", {
    y: 26, opacity: 0, duration: 0.8, stagger: 0.12, ease: "power3.out",
    scrollTrigger: { trigger: ".versions__table", start: "top 80%", once: true, onEnter: () => document.querySelector(".versions").classList.add("is-in") }
  });

  // Encerramento: a foto abre pela mesma fenda da entrada
  gsap.timeline({ scrollTrigger: { trigger: ".closing", start: "top top", end: "+=110%", pin: true, scrub: true } })
    .fromTo(".closing__media", { clipPath: "inset(49.6% 0% 49.6% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.inOut" }, 0)
    .fromTo(".closing__bg", { scale: 1.3 }, { scale: 1, duration: 1.2, ease: "power2.out" }, 0)
    .fromTo(".closing__content > *", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.1, ease: "power2.out" }, 0.8);

  // Abas da ficha técnica  // Abas da ficha técnica (teclado: setas, Home, End)
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

  // fontes e imagens podem mudar alturas depois do primeiro cálculo
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  window.__m3 = { go: t => goToTimeline(T(t)), T, tl, st, smoother, HOTSPOTS, sample, toScreen, targetPan, view, VIDEO_END_T, TOTAL };

  layout();
  gsap.ticker.add(render);
  window.addEventListener("resize", layout);
  ScrollTrigger.addEventListener("refresh", layout);

  // ---------------------------------------------------------------------------
  // Entrada: o nome entra do desfoque, a linha enche com o carregamento real,
  // atravessa a tela e abre como uma fenda para o filme.
  // ---------------------------------------------------------------------------
  const loader = document.getElementById("loader");
  const seam = document.getElementById("loaderSeam");
  const word = document.getElementById("loaderWord");
  word.innerHTML = [...word.textContent].map(c => `<span class="ch">${c === " " ? "&nbsp;" : c}</span>`).join("");
  const chars = word.querySelectorAll(".ch");

  // Durante o carregamento a linha fica no centro; na abertura ela desliza até o centro do vídeo.
  const seamTarget = () => (view.portrait ? view.dh / 2 : window.innerHeight / 2);
  loader.style.setProperty("--seam", (window.innerHeight / 2).toFixed(1) + "px");

  gsap.set(".topbar__name, .topbar__logo, .topbar__link", { opacity: 0, y: -8 });
  gsap.set(".hero__line, .hero__lead, .scrollhint", { opacity: 0, y: 26 });

  const introIn = gsap.timeline()
    .fromTo(".loader__logo", { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }, 0.1)
    .fromTo(chars, { opacity: 0, yPercent: 70, filter: "blur(12px)" },
      { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 1, stagger: 0.04, ease: "power3.out" }, 0.3);

  // A linha começa curta (a largura do nome) e cresce com o buffer real, num ritmo mínimo.
  const MIN_LOAD = reduce ? 0.3 : 1.6;
  const startTime = performance.now();
  const load = { p: 0 };
  let realP = 0, finished = false;
  const seamBase = () => Math.min(1, (word.offsetWidth + 40) / window.innerWidth);
  function bufferP() {
    if (!video.duration || !video.buffered.length) return 0;
    return video.buffered.end(video.buffered.length - 1) / video.duration;
  }
  let lastLoad = performance.now();
  function loadTick() {
    if (finished) return;
    const now = performance.now(), dt = Math.min(0.1, (now - lastLoad) / 1000);
    lastLoad = now;
    realP = Math.max(realP, video.readyState >= 4 ? 1 : bufferP());
    const paced = Math.min(realP, (now - startTime) / 1000 / MIN_LOAD);
    load.p += (paced - load.p) * (1 - Math.exp(-dt / 0.18));
    if (paced >= 1 && paced - load.p < 0.01) load.p = 1;
    seam.style.transform = `scaleX(${(load.p * seamBase()).toFixed(4)})`;
    if (load.p === 1 && !introIn.isActive()) { finished = true; openSite(); }
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
    const t0 = performance.now();
    while ((video.readyState < 2 || seeking) && performance.now() - t0 < 1500) await raf2();
    await raf2();

    const cy = seamTarget();
    gsap.set("#media", { transformOrigin: `50% ${cy.toFixed(1)}px` });
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

    gsap.timeline({ onComplete: done })
      .to(chars, { opacity: 0, yPercent: -60, filter: "blur(10px)", duration: 0.5, stagger: 0.02, ease: "power2.in" }, 0)
      .to(".loader__logo", { opacity: 0, y: -10, duration: 0.45, ease: "power2.in" }, 0.05)
      .to(loader, { "--seam": cy.toFixed(1) + "px", duration: 0.8, ease: "expo.inOut" }, 0.2)
      .to(seam, { scaleX: 1, duration: 0.8, ease: "expo.inOut" }, 0.25)
      .to(".loader__panel--top", { yPercent: -100, duration: 1.3, ease: "expo.inOut" }, 0.9)
      .to(".loader__panel--bottom", { yPercent: 100, duration: 1.3, ease: "expo.inOut" }, 0.9)
      .to(seam, { opacity: 0, duration: 0.35, ease: "power1.out" }, 1.0)
      .fromTo("#media", { scale: 1.16 }, { scale: 1, duration: 2, ease: "expo.out" }, 0.9)
      .to(".topbar__name, .topbar__logo, .topbar__link", { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ease: "power3.out" }, 1.55)
      .to(".hero__line", { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out" }, 1.45)
      .to(".hero__lead, .scrollhint", { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" }, 1.65);
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
