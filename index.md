---
layout: null
permalink: /
---

<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enter Team Space</title>
  <link rel="canonical" href="{{ site.url }}{{ site.baseurl }}/team-space-portal">
  <style>
    :root {
      --bg-1: #021a27;
      --bg-2: #05354a;
      --bg-3: #0a5f73;
      --accent: #7af3ff;
      --accent-2: #69ffd1;
      --panel: rgba(3, 31, 44, 0.78);
      --text: #eefcff;
      --muted: #a5d7dd;
      --success: #9af0c2;
      --sand: #f3d7a4;
      --kelp: #103f38;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      min-height: 100%;
      font-family: "Trebuchet MS", "Avenir Next", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at top, rgba(122, 243, 255, 0.2), transparent 26%),
        radial-gradient(circle at 78% 16%, rgba(105, 255, 209, 0.16), transparent 24%),
        linear-gradient(180deg, var(--bg-3) 0%, var(--bg-2) 42%, var(--bg-1) 100%);
      overflow: hidden;
    }

    body {
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cg fill='none' stroke='%23ecfcff' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='7.5'/%3E%3Cpath d='M7 7 L17 17' opacity='.85'/%3E%3Cpath d='M7 12 H17' opacity='.75'/%3E%3Cpath d='M12 7 V17' opacity='.75'/%3E%3Cpath d='M9 5.5 C13 4.6 16.8 6.1 18.5 9.2' opacity='.65'/%3E%3Cpath d='M17.5 17.5 L27 27'/%3E%3Cpath d='M22.5 22.5 L25.5 29'/%3E%3C/svg%3E") 8 8, auto;
    }

    body.launching .launch-overlay {
      opacity: 1;
      pointer-events: auto;
    }

    body.launching .scene {
      transform: scale(1.04);
      filter: blur(3px);
    }

    .scene {
      position: relative;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      transition: transform 900ms ease, filter 900ms ease;
    }

    .scene::before,
    .scene::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      pointer-events: none;
    }

    .scene::before {
      bottom: 0;
      height: 24vh;
      background:
        radial-gradient(circle at 8% 100%, rgba(14, 64, 57, 0.95) 0 22%, transparent 23%),
        radial-gradient(circle at 18% 100%, rgba(11, 82, 75, 0.9) 0 18%, transparent 19%),
        radial-gradient(circle at 82% 100%, rgba(18, 70, 62, 0.95) 0 22%, transparent 23%),
        radial-gradient(circle at 92% 100%, rgba(14, 98, 86, 0.9) 0 16%, transparent 17%),
        linear-gradient(180deg, transparent, rgba(2, 18, 26, 0.85));
      z-index: 1;
    }

    .scene::after {
      bottom: 0;
      height: 18vh;
      background:
        linear-gradient(180deg, rgba(243, 215, 164, 0), rgba(243, 215, 164, 0.16) 58%, rgba(243, 215, 164, 0.32));
      z-index: 1;
    }

    .stars,
    .stars::before,
    .stars::after {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 15% 30%, rgba(255,255,255,.9) 0 3px, transparent 4px),
        radial-gradient(circle at 75% 20%, rgba(122,243,255,.8) 0 4px, transparent 5px),
        radial-gradient(circle at 45% 80%, rgba(255,255,255,.75) 0 2px, transparent 3px),
        radial-gradient(circle at 60% 55%, rgba(105,255,209,.55) 0 3px, transparent 4px),
        radial-gradient(circle at 30% 60%, rgba(255,255,255,.65) 0 5px, transparent 6px);
      background-size: 340px 340px;
      content: "";
      animation: drift 22s linear infinite;
      opacity: 0.55;
      filter: blur(0.2px);
    }

    .stars::before {
      transform: scale(1.2);
      animation-duration: 28s;
      opacity: 0.35;
    }

    .stars::after {
      transform: scale(1.4);
      animation-duration: 42s;
      opacity: 0.24;
    }

    @keyframes drift {
      from { transform: translateY(0); }
      to { transform: translateY(-54px); }
    }

    .content {
      position: relative;
      z-index: 3;
      width: min(960px, 100%);
      display: grid;
      gap: 24px;
      justify-items: center;
    }

    .jelly-wrap {
      position: relative;
      width: 240px;
      height: 280px;
      display: grid;
      place-items: center;
      filter: drop-shadow(0 0 34px rgba(122, 243, 255, 0.22));
      animation: float 4.4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(-1deg); }
      50% { transform: translateY(-16px) rotate(1deg); }
    }

    .jelly-glow {
      position: absolute;
      inset: auto 30px 18px;
      height: 48px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(122,243,255,0.45), transparent 72%);
      filter: blur(12px);
    }

    .jellyfish {
      position: relative;
      width: 150px;
      height: 220px;
    }

    .jelly-bell {
      position: absolute;
      left: 16px;
      right: 16px;
      top: 18px;
      height: 110px;
      border-radius: 58% 58% 42% 42% / 72% 72% 32% 32%;
      background: linear-gradient(180deg, rgba(212, 255, 255, 0.98) 0%, rgba(128, 240, 255, 0.72) 45%, rgba(91, 187, 214, 0.42) 100%);
      border: 2px solid rgba(255,255,255,0.48);
      overflow: hidden;
      box-shadow: inset 0 14px 28px rgba(255,255,255,0.28), 0 0 26px rgba(122,243,255,0.28);
    }

    .jelly-bell::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
      transform: translateX(-120%);
      animation: shimmer 3s linear infinite;
    }

    .jelly-bell::after {
      content: "";
      position: absolute;
      left: 18%;
      top: 18%;
      width: 64%;
      height: 36%;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.55), transparent 70%);
      opacity: 0.75;
    }

    @keyframes shimmer {
      to { transform: translateX(120%); }
    }

    .jelly-core {
      position: absolute;
      left: 50%;
      top: 58px;
      width: 44px;
      height: 44px;
      margin-left: -22px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #ffffff, #a9fbff 48%, #20748c 100%);
      border: 3px solid rgba(255,255,255,0.65);
      box-shadow: 0 0 18px rgba(122,243,255,.55);
    }

    .jelly-ring {
      position: absolute;
      top: 112px;
      left: 28px;
      right: 28px;
      height: 12px;
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(122,243,255,0.65), rgba(105,255,209,0.82), rgba(122,243,255,0.4));
      box-shadow: 0 0 12px rgba(122,243,255,0.34);
    }

    .jelly-tentacles {
      position: absolute;
      left: 28px;
      right: 28px;
      top: 118px;
      bottom: 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .jelly-tentacles span {
      width: 8px;
      height: 92px;
      border-radius: 50%;
      background: linear-gradient(180deg, rgba(172, 251, 255, 0.95), rgba(122,243,255,0.38) 50%, transparent 100%);
      transform-origin: top center;
      animation: tentacleWave 3.4s ease-in-out infinite;
      filter: blur(0.2px);
    }

    .jelly-tentacles span:nth-child(2n) {
      height: 108px;
      animation-delay: -0.6s;
    }

    .jelly-tentacles span:nth-child(3n) {
      width: 6px;
      animation-delay: -1.2s;
    }

    @keyframes tentacleWave {
      0%, 100% { transform: translateX(0) rotate(5deg); opacity: 0.72; }
      50% { transform: translateX(6px) rotate(-8deg); opacity: 1; }
    }

    .panel {
      width: min(720px, 100%);
      padding: 28px;
      border-radius: 28px;
      background: var(--panel);
      border: 1px solid rgba(122,243,255,0.22);
      box-shadow: 0 20px 80px rgba(0,0,0,0.38), inset 0 0 0 1px rgba(255,255,255,0.04);
      backdrop-filter: blur(20px);
      text-align: center;
    }

    .eyebrow {
      display: inline-block;
      padding: 7px 14px;
      border-radius: 999px;
      border: 1px solid rgba(122,243,255,0.35);
      color: var(--accent);
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-size: 0.75rem;
      margin-bottom: 14px;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.2rem, 4vw, 4.4rem);
      line-height: 1.05;
    }

    .gradient {
      background: linear-gradient(90deg, #fff, #9ef7ff 40%, #85ffcf 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .subtitle {
      margin: 16px auto 0;
      max-width: 58ch;
      color: var(--muted);
      font-size: 1.05rem;
      line-height: 1.7;
    }

    .status-bar {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      margin: 24px 0;
    }

    .status-pill {
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: var(--muted);
      font-size: 0.92rem;
    }

    .status-pill strong {
      color: var(--success);
    }

    .controls {
      display: flex;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
      margin-top: 18px;
    }

    .enter-btn,
    .direct-link {
      appearance: none;
      border: none;
      cursor: inherit;
      text-decoration: none;
      border-radius: 16px;
      padding: 16px 22px;
      font-weight: 700;
      font-size: 1rem;
      transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
    }

    .enter-btn {
      color: #032430;
      background: linear-gradient(90deg, #7af3ff, #69ffd1);
      box-shadow: 0 14px 36px rgba(122,243,255,0.28);
    }

    .enter-btn:hover,
    .direct-link:hover {
      transform: translateY(-2px);
    }

    .direct-link {
      color: var(--text);
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
    }

    .launch-overlay {
      position: fixed;
      inset: 0;
      z-index: 6;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at center, rgba(122,243,255,0.16), transparent 20%),
        linear-gradient(180deg, rgba(2, 28, 36, 0.3), rgba(1, 16, 22, 0.96));
      opacity: 0;
      pointer-events: none;
      transition: opacity 700ms ease;
    }

    .swim-transition {
      position: relative;
      width: min(82vw, 760px);
      height: 260px;
      overflow: hidden;
    }

    .swim-transition::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 28px;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 35%),
        radial-gradient(circle at 18% 20%, rgba(255,255,255,0.14), transparent 16%),
        radial-gradient(circle at 84% 14%, rgba(122,243,255,0.12), transparent 18%),
        linear-gradient(180deg, rgba(7, 45, 58, 0.28), rgba(2, 18, 26, 0.76));
      border: 1px solid rgba(122,243,255,0.22);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(122,243,255,0.14);
    }

    .swimmer {
      position: absolute;
      width: 118px;
      height: 176px;
      top: 28px;
      left: -140px;
      filter: drop-shadow(0 0 20px rgba(122,243,255,0.22));
      animation: swimAcross 4.8s linear infinite;
    }

    .swimmer.two {
      top: 72px;
      transform: scale(0.84);
      animation-duration: 5.8s;
      animation-delay: -1.7s;
    }

    .swimmer.three {
      top: 14px;
      transform: scale(1.06);
      animation-duration: 6.6s;
      animation-delay: -3.1s;
    }

    .swim-jelly {
      position: absolute;
      inset: 0;
    }

    .swim-bell {
      position: absolute;
      left: 16px;
      right: 16px;
      top: 10px;
      height: 82px;
      border-radius: 58% 58% 42% 42% / 74% 74% 28% 28%;
      background: linear-gradient(180deg, rgba(233,255,255,0.96), rgba(140,241,255,0.74) 45%, rgba(92,184,214,0.42) 100%);
      border: 2px solid rgba(255,255,255,0.42);
      box-shadow: inset 0 10px 20px rgba(255,255,255,0.2);
      overflow: hidden;
      animation: pulseBell 1.7s ease-in-out infinite;
    }

    .swim-bell::after {
      content: "";
      position: absolute;
      left: 20%;
      top: 16%;
      width: 60%;
      height: 28%;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.56), transparent 70%);
    }

    .swim-core {
      position: absolute;
      left: 50%;
      top: 44px;
      width: 30px;
      height: 30px;
      margin-left: -15px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #ffffff, #a9fbff 52%, #20748c 100%);
      border: 2px solid rgba(255,255,255,0.56);
      box-shadow: 0 0 12px rgba(122,243,255,0.5);
    }

    .swim-tentacles {
      position: absolute;
      left: 24px;
      right: 24px;
      top: 88px;
      bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .swim-tentacles span {
      width: 6px;
      height: 74px;
      border-radius: 50%;
      background: linear-gradient(180deg, rgba(186,252,255,0.9), rgba(122,243,255,0.34) 54%, transparent 100%);
      animation: sway 2.8s ease-in-out infinite;
      transform-origin: top center;
    }

    .swim-tentacles span:nth-child(2n) {
      height: 90px;
      animation-delay: -0.5s;
    }

    .swim-tentacles span:nth-child(3n) {
      width: 4px;
      animation-delay: -1.1s;
    }

    .launch-text {
      position: absolute;
      bottom: 14px;
      width: 100%;
      text-align: center;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #d9fbff;
      font-size: 0.84rem;
    }

    @keyframes swimAcross {
      0% { transform: translateX(0) translateY(20px) rotate(-5deg); }
      25% { transform: translateX(24vw) translateY(-8px) rotate(2deg); }
      50% { transform: translateX(46vw) translateY(16px) rotate(-2deg); }
      75% { transform: translateX(64vw) translateY(-14px) rotate(4deg); }
      100% { transform: translateX(84vw) translateY(10px) rotate(-3deg); }
    }

    @keyframes pulseBell {
      0%, 100% { transform: translateY(0) scaleY(1); }
      50% { transform: translateY(6px) scaleY(0.9); }
    }

    @keyframes sway {
      0%, 100% { transform: translateX(0) rotate(4deg); opacity: 0.75; }
      50% { transform: translateX(6px) rotate(-7deg); opacity: 1; }
    }

    @media (max-width: 640px) {
      .panel {
        padding: 22px;
      }

      .jelly-wrap {
        transform: scale(0.9);
      }
    }
  </style>
</head>
<body>
  <div class="launch-overlay" id="launchOverlay" aria-hidden="true">
    <div class="swim-transition">
      <div class="swimmer one">
        <div class="swim-jelly">
          <div class="swim-bell"></div>
          <div class="swim-core"></div>
          <div class="swim-tentacles"><span></span><span></span><span></span><span></span><span></span></div>
        </div>
      </div>
      <div class="swimmer two">
        <div class="swim-jelly">
          <div class="swim-bell"></div>
          <div class="swim-core"></div>
          <div class="swim-tentacles"><span></span><span></span><span></span><span></span><span></span></div>
        </div>
      </div>
      <div class="swimmer three">
        <div class="swim-jelly">
          <div class="swim-bell"></div>
          <div class="swim-core"></div>
          <div class="swim-tentacles"><span></span><span></span><span></span><span></span><span></span></div>
        </div>
      </div>
      <div class="launch-text">Diving to Team Space</div>
    </div>
  </div>

  <main class="scene" id="scene">
    <div class="stars"></div>

    <section class="content">
      <div class="jelly-wrap" aria-hidden="true">
        <div class="jelly-glow"></div>
        <div class="jellyfish">
          <div class="jelly-bell"></div>
          <div class="jelly-core"></div>
          <div class="jelly-ring"></div>
          <div class="jelly-tentacles">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="eyebrow">teamspace.opencodingsociety.com</div>
        <h1>Dive into <span class="gradient">Team Space</span></h1>
        <p class="subtitle">
          Your reef gate is ready. Tap below to slip beneath the surface, follow the bubbles,
          and enter an underwater Team Space experience built around reefs, currents, and jellyfish.
        </p>

        <div class="status-bar">
          <div class="status-pill"><strong>Current:</strong> calm</div>
          <div class="status-pill"><strong>Reef gate:</strong> open</div>
          <div class="status-pill"><strong>Destination:</strong> Team Space</div>
        </div>

        <div class="controls">
          <button class="enter-btn" id="enterPortalBtn" type="button">Dive In</button>
          <a class="direct-link" href="{{ site.baseurl }}/legacy-home">Legacy Home</a>
        </div>
      </div>
    </section>
  </main>

  <script>
    const enterBtn = document.getElementById('enterPortalBtn');
    const destination = '{{ site.baseurl }}/team-space-portal';
    let isLaunching = false;
    let launchTimer = null;

    function resetLaunchState() {
      if (launchTimer) {
        window.clearTimeout(launchTimer);
        launchTimer = null;
      }

      isLaunching = false;
      document.body.classList.remove('launching');
      enterBtn.disabled = false;
      enterBtn.textContent = 'Dive In';
    }

    function launchPortal() {
      if (isLaunching) return;
      isLaunching = true;
      document.body.classList.add('launching');
      enterBtn.disabled = true;
      enterBtn.textContent = 'Diving…';

      launchTimer = window.setTimeout(() => {
        window.location.href = destination;
      }, 1650);
    }

    resetLaunchState();

    enterBtn.addEventListener('click', launchPortal);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !isLaunching) {
        launchPortal();
      }
    });

    window.addEventListener('pageshow', () => {
      resetLaunchState();
    });
  </script>
</body>
</html>
