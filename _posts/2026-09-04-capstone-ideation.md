---
layout: post
title: Capstone Ideation - DeFlock SD and SD Auto
description: Ideation notes for two nonprofit website remake paths and scope definition.
permalink: /capstone/ideation/
categories: Capstone
tags: [capstone, ideation, nonprofit, web-redesign]
---

<style>
    .traffic-deck {
        --road-900: #111417;
        --road-800: #1d2329;
        --road-700: #2b323a;
        --lane-yellow: #f4c542;
        --signal-red: #e64b3c;
        --signal-green: #37b24d;
        --signal-amber: #f59f00;
        --sky-1: #78b3f0;
        --sky-2: #d8ecff;
        --panel: #f8fbff;
        --ink: #102028;
        --font-head: "Trebuchet MS", "Segoe UI", sans-serif;
        --font-body: "Avenir Next", "Segoe UI", sans-serif;
        position: relative;
        margin: 1.5rem auto;
        max-width: 960px;
        border: 3px solid var(--road-700);
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(17, 20, 23, 0.28);
        background: linear-gradient(180deg, var(--sky-2) 0%, var(--sky-1) 42%, var(--road-800) 42%, var(--road-900) 100%);
        min-height: 580px;
    }

    .traffic-controls {
        position: absolute;
        inset: 0 auto auto 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.6rem 0.9rem;
        font-family: var(--font-body);
        font-size: 0.85rem;
        color: #ecf6ff;
        background: rgba(16, 32, 40, 0.68);
        backdrop-filter: blur(2px);
        z-index: 3;
    }

    .traffic-controls kbd {
        font-family: inherit;
        font-size: 0.85rem;
        background: #fff;
        color: #1c2329;
        border: 1px solid #bec8d1;
        border-bottom: 3px solid #99a7b3;
        border-radius: 6px;
        padding: 0.05rem 0.35rem;
        margin: 0 0.2rem;
    }

    .traffic-stage {
        position: relative;
        padding: 3.2rem 1.1rem 6.5rem;
        z-index: 1;
    }

    .traffic-slide {
        display: none;
        background: var(--panel);
        color: var(--ink);
        border: 2px solid #d7e5f1;
        border-radius: 14px;
        padding: 1.1rem 1rem;
        box-shadow: 0 8px 24px rgba(16, 32, 40, 0.12);
        animation: fadeSlide 420ms ease;
    }

    .traffic-slide,
    .traffic-slide h2,
    .traffic-slide h3,
    .traffic-slide p,
    .traffic-slide li,
    .traffic-slide strong,
    .traffic-slide td,
    .traffic-slide th {
        color: var(--ink) !important;
    }

    .traffic-slide a {
        color: #0a5ea8 !important;
    }

    .traffic-slide.active {
        display: block;
    }

    .traffic-slide h2,
    .traffic-slide h3 {
        margin-top: 0;
        font-family: var(--font-head);
        letter-spacing: 0.3px;
    }

    .traffic-slide p,
    .traffic-slide li,
    .traffic-slide td,
    .traffic-slide th {
        font-family: var(--font-body);
        line-height: 1.45;
    }

    .traffic-slide ul,
    .traffic-slide ol {
        margin: 0.5rem 0;
        padding-left: 1.1rem;
    }

    .traffic-slide table {
        width: 100%;
        border-collapse: collapse;
        background: #ffffff;
    }

    .traffic-slide th,
    .traffic-slide td {
        border: 1px solid #d2e0ec;
        padding: 0.45rem;
        text-align: left;
        background: #ffffff !important;
        color: var(--ink) !important;
    }

    .traffic-slide th {
        background: #e9f3fc !important;
    }

    .traffic-slide tbody tr:nth-child(odd) td {
        background: #f8fcff !important;
    }

    .traffic-slide tbody tr:nth-child(even) td {
        background: #ffffff !important;
    }

    .traffic-badge {
        display: inline-block;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        border-radius: 999px;
        padding: 0.2rem 0.55rem;
        margin-bottom: 0.55rem;
        color: #fff;
        background: var(--signal-amber);
    }

    .traffic-road {
        position: absolute;
        inset: auto 0 0 0;
        height: 112px;
        background:
            repeating-linear-gradient(
                90deg,
                var(--road-900) 0,
                var(--road-900) 36px,
                var(--road-800) 36px,
                var(--road-800) 72px
            );
        border-top: 4px solid #808992;
        overflow: hidden;
        z-index: 2;
    }

    .lane-divider {
        position: absolute;
        top: 38px;
        left: 0;
        width: 100%;
        height: 8px;
        background: repeating-linear-gradient(
            90deg,
            transparent 0,
            transparent 22px,
            var(--lane-yellow) 22px,
            var(--lane-yellow) 44px
        );
        opacity: 0.95;
    }

    .car {
        position: absolute;
        bottom: 4px;
        left: -120px;
        width: 128px;
        height: 128px;
        background-image: url("{{ site.baseurl }}/images/gray%20modern%20car.png");
        background-repeat: no-repeat;
        background-size: 500% 500%;
        background-position: 0% 0%;
    }

    .car.drive {
        animation: driveAcross 2200ms cubic-bezier(0.31, 0.07, 0.57, 0.96), spriteFrames 2200ms steps(1) 1;
    }

    .traffic-original-link {
        position: absolute;
        right: 0.9rem;
        bottom: 0.8rem;
        z-index: 4;
        display: inline-block;
        text-decoration: none;
        font-family: var(--font-body);
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: #13232d;
        background: #f7f0cf;
        border: 2px solid #b3902e;
        border-radius: 999px;
        padding: 0.28rem 0.72rem;
        box-shadow: 0 5px 12px rgba(0, 0, 0, 0.22);
    }

    .traffic-original-link:hover,
    .traffic-original-link:focus {
        background: #fff7d8;
        color: #102028;
        transform: translateY(-1px);
    }

    @keyframes driveAcross {
        0% {
            left: -130px;
            transform: translateY(0) scale(1);
        }
        40% {
            transform: translateY(-2px) scale(1.01);
        }
        100% {
            left: calc(100% + 20px);
            transform: translateY(0) scale(1);
        }
    }

    @keyframes spriteFrames {
        0% { background-position: 0% 0%; }
        4% { background-position: 25% 0%; }
        8% { background-position: 50% 0%; }
        12% { background-position: 75% 0%; }
        16% { background-position: 100% 0%; }
        20% { background-position: 0% 25%; }
        24% { background-position: 25% 25%; }
        28% { background-position: 50% 25%; }
        32% { background-position: 75% 25%; }
        36% { background-position: 100% 25%; }
        40% { background-position: 0% 50%; }
        44% { background-position: 25% 50%; }
        48% { background-position: 50% 50%; }
        52% { background-position: 75% 50%; }
        56% { background-position: 100% 50%; }
        60% { background-position: 0% 75%; }
        64% { background-position: 25% 75%; }
        68% { background-position: 50% 75%; }
        72% { background-position: 75% 75%; }
        76% { background-position: 100% 75%; }
        80% { background-position: 0% 100%; }
        84% { background-position: 25% 100%; }
        88% { background-position: 50% 100%; }
        92% { background-position: 75% 100%; }
        100% { background-position: 100% 100%; }
    }

    @keyframes fadeSlide {
        from {
            opacity: 0;
            transform: translateY(6px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 700px) {
        .traffic-deck {
            min-height: 620px;
        }

        .traffic-controls {
            font-size: 0.78rem;
            padding: 0.5rem 0.65rem;
            gap: 0.4rem;
            flex-wrap: wrap;
        }

        .traffic-stage {
            padding: 3.6rem 0.7rem 6.8rem;
        }

        .traffic-slide {
            padding: 0.9rem 0.8rem;
        }
    }
</style>

<div class="traffic-deck" id="trafficDeck">
    <div class="traffic-controls">
        <div>Traffic Ideation Slideshow</div>
        <div>Press <kbd>N</kbd> next, <kbd>B</kbd> back</div>
        <div id="trafficProgress">Slide 1 / 9</div>
    </div>

    <div class="traffic-stage">
        <section class="traffic-slide active">
            <span class="traffic-badge">Start</span>
            <h2>Capstone Ideation Overview</h2>
            <p>We are deciding between two nonprofit-centered website remakes:</p>
            <ol>
                <li>DeFlock SD</li>
                <li>SD Auto</li>
            </ol>
            <p>This project focuses on civic value, daily commuter impact, and explainable decision support.</p>
        </section>

        <section class="traffic-slide">
            <span class="traffic-badge" style="background:#e64b3c;">Why It Matters</span>
            <h2>Privacy and Safety as Public Rights</h2>
            <p>Communities depend on roads and data systems every day, so people need tools that are clear, practical, and transparent.</p>
            <ul>
                <li>DeFlock SD: explain ALPR visibility and privacy concerns.</li>
                <li>SD Auto: route around historically dangerous roads, not just live pins.</li>
            </ul>
        </section>

        <section class="traffic-slide">
            <span class="traffic-badge" style="background:#f59f00;">Option 1</span>
            <h2>DeFlock SD Direction</h2>
            <p>Expand or remake a site that maps ALPR locations and communicates civic impact.</p>
            <ul>
                <li>Highlight where readers are active.</li>
                <li>Explain the difference between safety claims and privacy costs.</li>
                <li>Support informed community action with understandable data views.</li>
            </ul>
        </section>

        <section class="traffic-slide">
            <span class="traffic-badge" style="background:#37b24d;">Option 2</span>
            <h2>SD Auto Core Problem</h2>
            <h3>Route commuters away from historically dangerous intersections</h3>
            <p>Current hazard reporting shows pins but does not influence route recommendation logic.</p>
            <p>Goal: add historical crash-risk scoring into route generation so suggestions reduce exposure to high-risk segments.</p>
        </section>

        <section class="traffic-slide">
            <span class="traffic-badge">Scope Lines</span>
            <h2>Out of Scope (Traffic Sign Rules)</h2>
            <ul>
                <li>No prediction of brand-new danger in real time.</li>
                <li>No guarantee of crash-free travel.</li>
                <li>No forced route lock; users can still choose flagged alternatives.</li>
            </ul>
            <p>We provide evidence-based guidance, not strict control.</p>
        </section>

        <section class="traffic-slide">
            <span class="traffic-badge" style="background:#37b24d;">Prototype</span>
            <h2>Website Experience Plan</h2>
            <ol>
                <li>Landing overview of mission and real-world issue.</li>
                <li>Interactive map for ALPR visibility or crash-risk route layers.</li>
                <li>Decision panel explaining why a route/area is flagged.</li>
                <li>Scope limits section with explicit non-claims.</li>
                <li>Evidence notes linked to historical collision data and transparency goals.</li>
            </ol>
        </section>

        <section class="traffic-slide">
            <span class="traffic-badge" style="background:#e64b3c;">Macro Cosmos</span>
            <h2>Selected Direction: Safety-Aware Route Decision Engine</h2>
            <ul>
                <li>Safety Score Routing: compare multiple routes with clear safety scores.</li>
                <li>Smart Commute Planner: convert arrive-by goals into leave-by time guidance.</li>
                <li>Modes: Fastest, Safest, Balanced.</li>
            </ul>
            <p><strong>Pitch:</strong> Turn traffic and hazard data from passive display into active route decisions.</p>
        </section>

        <section class="traffic-slide">
            <span class="traffic-badge" style="background:#f59f00;">Feasibility Check</span>
            <h2>Why This Direction Works</h2>
            <table>
                <thead>
                    <tr>
                        <th>Criterion</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Stakeholder Value</td>
                        <td>Helps real San Diego commuters make safer daily choices.</td>
                    </tr>
                    <tr>
                        <td>Technical Learning</td>
                        <td>Uses real datasets, scoring formulas, and route comparison logic.</td>
                    </tr>
                    <tr>
                        <td>Feasibility</td>
                        <td>Builds on existing route finder and hazard data foundation.</td>
                    </tr>
                    <tr>
                        <td>Originality</td>
                        <td>Makes hazard data determine recommendation outcomes.</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section class="traffic-slide">
            <span class="traffic-badge" style="background:#37b24d;">Roadmap</span>
            <h2>Phased Build Plan</h2>
            <ol>
                <li><strong>Phase 1:</strong> Run codebase, audit feature reality, clean San Diego crash data.</li>
                <li><strong>Phase 2:</strong> Build Safety Score and Fastest/Safest/Balanced weighting.</li>
                <li><strong>Phase 3:</strong> Multi-route UI, reasoning panel, arrive-by to leave-by logic.</li>
                <li><strong>Phase 4:</strong> Hazard confirmation and expiration, polish, end-to-end test, demo prep.</li>
            </ol>
            <p>End of slideshow. Press <kbd>N</kbd> to loop back to Slide 1.</p>
        </section>
    </div>

    <div class="traffic-road">
        <div class="lane-divider"></div>
        <div class="car" id="trafficCar" aria-hidden="true"></div>
        <a class="traffic-original-link" href="{{ site.baseurl }}/capstone/ideation-original/">Use Original Ideation Page</a>
    </div>
</div>

<script>
    (function () {
        const deck = document.getElementById("trafficDeck");
        if (!deck) return;

        const slides = Array.from(deck.querySelectorAll(".traffic-slide"));
        const progress = document.getElementById("trafficProgress");
        const car = document.getElementById("trafficCar");
        let index = 0;

        function updateSlide(nextIndex) {
            slides[index].classList.remove("active");
            index = nextIndex;
            slides[index].classList.add("active");
            progress.textContent = "Slide " + (index + 1) + " / " + slides.length;

            // Restart drive animation so each transition has a visible car movement.
            car.classList.remove("drive");
            void car.offsetWidth;
            car.classList.add("drive");
        }

        document.addEventListener("keydown", function (event) {
            const key = event.key.toLowerCase();
            if (key === "n") {
                const next = (index + 1) % slides.length;
                updateSlide(next);
                return;
            }

            if (key === "b") {
                const prev = (index - 1 + slides.length) % slides.length;
                updateSlide(prev);
            }
        });

        // Trigger first animation on load.
        car.classList.add("drive");
    })();
</script>
