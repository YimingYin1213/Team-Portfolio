---
layout: post
title: Capstone Ideation Original - DeFlock SD and SD Auto
description: Original ideation notes before slideshow conversion.
permalink: /capstone/ideation-original/
categories: Capstone
tags: [capstone, ideation, nonprofit, web-redesign]
---

- Transportation-mode-specific scoring (biking/walking factor in different risks than driving)
- User-adjustable safety preference (e.g., "max 5 extra minutes for a safer route")
- Saved places with default routing preferences attached

<style>
    .ideation-infographic-wrap {
        margin-top: 2rem;
        margin-left: calc(50% - 50vw + 20px);
        margin-right: calc(50% - 50vw + 20px);
        width: calc(100vw - 40px);
        max-width: none;
        padding: 1rem;
        border-radius: 16px;
        background: linear-gradient(135deg, #fffbe6 0%, #e8f7ff 45%, #f6ecff 100%);
        border: 3px solid #ffd166;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
    }

    .ideation-infographic-wrap h2 {
        margin-top: 0;
        color: #0f3d56;
        font-weight: 800;
        letter-spacing: 0.4px;
    }

    .ideation-infographic {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.96rem;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        table-layout: fixed;
    }

    .ideation-infographic th,
    .ideation-infographic td {
        border: 2px solid #dbe9f4;
        padding: 0.65rem;
        vertical-align: top;
        color: #1b2b34 !important;
        background: #ffffff !important;
        word-wrap: break-word;
    }

    .ideation-infographic thead th {
        color: #102028 !important;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-size: 0.82rem;
    }

    .ideation-infographic thead th:nth-child(1) { background: #ffe08a !important; }
    .ideation-infographic thead th:nth-child(2) { background: #9be7ff !important; }
    .ideation-infographic thead th:nth-child(3) { background: #b6f5c4 !important; }
    .ideation-infographic thead th:nth-child(4) { background: #ffb3c7 !important; }
    .ideation-infographic thead th:nth-child(5) { background: #d6c3ff !important; }

    .ideation-infographic .cat {
        font-weight: 800;
        color: #0f3d56 !important;
    }

    .ideation-infographic .cat-public { background: #fff4cf !important; }
    .ideation-infographic .cat-option { background: #e8f8ff !important; }
    .ideation-infographic .cat-prototype { background: #ecfff1 !important; }
    .ideation-infographic .cat-macro { background: #ffeef4 !important; }
    .ideation-infographic .cat-build { background: #f3ecff !important; }

    @media (max-width: 900px) {
        .ideation-infographic-wrap {
            margin-left: calc(50% - 50vw + 8px);
            margin-right: calc(50% - 50vw + 8px);
            width: calc(100vw - 16px);
            padding: 0.7rem;
        }

        .ideation-infographic {
            font-size: 0.88rem;
        }

        .ideation-infographic th,
        .ideation-infographic td {
            padding: 0.5rem;
        }
    }
</style>

<div class="ideation-infographic-wrap">
    <h2>Ideation Infographic Mega Table (Categorized)</h2>
    <table class="ideation-infographic">
        <thead>
            <tr>
                <th>Category</th>
                <th>Section</th>
                <th>Core Idea</th>
                <th>Evidence / Details</th>
                <th>Scope / Outcome</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="cat cat-public">Public Mission</td>
                <td>Why it matters</td>
                <td>Privacy and road safety are community rights.</td>
                <td>People rely on road systems and public data systems every day.</td>
                <td>Build nonprofit web tools that support informed, practical decisions.</td>
            </tr>
            <tr>
                <td class="cat cat-public">Public Need</td>
                <td>What people need today</td>
                <td>Tools must be transparent, easy to understand, and useful.</td>
                <td>Current systems can show data, but often do not explain impact clearly.</td>
                <td>Create interfaces that explain risk and context, not just display points.</td>
            </tr>
            <tr>
                <td class="cat cat-option">Option 1</td>
                <td>DeFlock SD direction</td>
                <td>Expand/remake ALPR visibility website.</td>
                <td>Map ALPR locations and explain surveillance impact on civic privacy.</td>
                <td>Increase transparency so communities understand where monitoring exists.</td>
            </tr>
            <tr>
                <td class="cat cat-option">Option 1</td>
                <td>DeFlock SD urgency</td>
                <td>Unchecked data collection can erode privacy freedoms over time.</td>
                <td>ALPR collection may exceed what is necessary for safety outcomes.</td>
                <td>Frame privacy cost clearly and accessibly for public-interest action.</td>
            </tr>
            <tr>
                <td class="cat cat-option">Option 2</td>
                <td>SD Auto big issue</td>
                <td>Route users away from historically dangerous intersections.</td>
                <td>Current hazard pins are mostly visual and not integrated into route decisions.</td>
                <td>Integrate crash-risk history into actual routing recommendations.</td>
            </tr>
            <tr>
                <td class="cat cat-option">Option 2</td>
                <td>Problem statement</td>
                <td>Commuters need safer route suggestions, not just post-fact flags.</td>
                <td>Live pin-only design does not reduce exposure to known high-risk segments.</td>
                <td>Shift from passive hazard display to active route guidance.</td>
            </tr>
            <tr>
                <td class="cat cat-option">Option 2</td>
                <td>How it helps</td>
                <td>Use historical city collision data to score route risk.</td>
                <td>Routing engine layers crash-risk scoring onto base optimization.</td>
                <td>Return safer suggestions while preserving user choice.</td>
            </tr>
            <tr>
                <td class="cat cat-option">Option 2</td>
                <td>System logic chain</td>
                <td>Commuter request - base route - risk scoring - safer recommendation.</td>
                <td>Flow explicitly maps to: load historical collision data, score intersections, adjust route exposure.</td>
                <td>Clear technical path from input to explainable output.</td>
            </tr>
            <tr>
                <td class="cat cat-option">Option 2</td>
                <td>Out of scope</td>
                <td>No real-time new danger prediction, no crash-free guarantees.</td>
                <td>No forced route lock; users may still choose flagged routes.</td>
                <td>Informational, evidence-based routing enhancement only.</td>
            </tr>
            <tr>
                <td class="cat cat-prototype">Prototype Design</td>
                <td>Landing and framing</td>
                <td>Explain nonprofit mission and real-world problem first.</td>
                <td>Content-rich structure anchors map and decision features.</td>
                <td>Users understand context before interacting with data layers.</td>
            </tr>
            <tr>
                <td class="cat cat-prototype">Prototype Design</td>
                <td>Interactive map</td>
                <td>Dual path: ALPR visibility or crash-risk route layers.</td>
                <td>DeFlock SD for surveillance context; SD Auto for safety scoring context.</td>
                <td>Visual intelligence tied to practical civic/commuter decisions.</td>
            </tr>
            <tr>
                <td class="cat cat-prototype">Prototype Design</td>
                <td>Decision panel</td>
                <td>Explain why route/area was suggested or flagged.</td>
                <td>Human-readable rationale, not opaque algorithm output.</td>
                <td>Trust and transparency through explainability.</td>
            </tr>
            <tr>
                <td class="cat cat-prototype">Prototype Design</td>
                <td>Scope and evidence</td>
                <td>State non-claims and cite historical data sources.</td>
                <td>Avoid overpromising by defining explicit limitations.</td>
                <td>Responsible communication and realistic user expectations.</td>
            </tr>
            <tr>
                <td class="cat cat-macro">Macro Cosmos Selection</td>
                <td>Chosen product direction</td>
                <td>Safety-Aware Route Decision Engine + Smart Commute Planner.</td>
                <td>Combines safety score routing with arrive-by/leave-by commute planning.</td>
                <td>Transforms site from data viewer to decision engine.</td>
            </tr>
            <tr>
                <td class="cat cat-macro">Macro Cosmos Selection</td>
                <td>User controls</td>
                <td>Fastest, Safest, Balanced route modes.</td>
                <td>Show 2-3 route options with time, distance, and safety score.</td>
                <td>User can compare tradeoffs explicitly.</td>
            </tr>
            <tr>
                <td class="cat cat-macro">Macro Cosmos Selection</td>
                <td>Decision transparency</td>
                <td>Every recommendation includes a short "why this route" explanation.</td>
                <td>Rationale references hazard/crash exposure tradeoffs versus alternatives.</td>
                <td>Improves trust and reduces black-box route behavior.</td>
            </tr>
            <tr>
                <td class="cat cat-macro">Macro Cosmos Selection</td>
                <td>One-sentence pitch</td>
                <td>Use traffic/hazard data to make and explain route decisions.</td>
                <td>Existing route finder, hazard reports, and traffic data are already present.</td>
                <td>New value comes from integrating existing signals into recommendation logic.</td>
            </tr>
            <tr>
                <td class="cat cat-macro">User + Problem</td>
                <td>Primary user</td>
                <td>San Diego commuter (student, parent, daily driver).</td>
                <td>Needs reliable daily routing decisions for school/work destinations.</td>
                <td>Actionable recommendation quality matters more than data quantity.</td>
            </tr>
            <tr>
                <td class="cat cat-macro">User + Problem</td>
                <td>Current gap</td>
                <td>Single unexplained route and static routine-by-hour behavior.</td>
                <td>Hazard/traffic data exists but is not used to select route.</td>
                <td>Need dynamic leave-by calculator using current conditions.</td>
            </tr>
            <tr>
                <td class="cat cat-macro">Feasibility Matrix</td>
                <td>Stakeholder value</td>
                <td>Direct utility for regular commuters in San Diego.</td>
                <td>Connects safety evidence to routine daily choices.</td>
                <td>High practical relevance and visible impact.</td>
            </tr>
            <tr>
                <td class="cat cat-macro">Feasibility Matrix</td>
                <td>Team + learning fit</td>
                <td>Matches transportation interest and algorithmic CS goals.</td>
                <td>Uses scoring formulas, route comparison, and time calculations.</td>
                <td>Strong AP CSP-aligned technical depth.</td>
            </tr>
            <tr>
                <td class="cat cat-macro">Feasibility Matrix</td>
                <td>Safety + originality</td>
                <td>Add informative safety layer without replacing official routing.</td>
                <td>Current system displays hazards separately; new system integrates them.</td>
                <td>Original contribution with transparent guardrails.</td>
            </tr>
            <tr>
                <td class="cat cat-build">Implementation Flow</td>
                <td>User flow step 1-2</td>
                <td>Enter trip, choose mode, compare 2-3 routes.</td>
                <td>Each route includes time, distance, and safety score.</td>
                <td>Selection becomes explicit and evidence-backed.</td>
            </tr>
            <tr>
                <td class="cat cat-build">Implementation Flow</td>
                <td>User flow step 3-4</td>
                <td>Explain recommendation and allow commute save.</td>
                <td>Example saved trip: School, arrive 8:35 AM.</td>
                <td>Supports repeat-use routines and user trust.</td>
            </tr>
            <tr>
                <td class="cat cat-build">Implementation Flow</td>
                <td>User flow step 5-6</td>
                <td>Compute leave-by time and support hazard confirm/clear.</td>
                <td>Old hazards can expire automatically.</td>
                <td>Keeps recommendations timely and cleaner over time.</td>
            </tr>
            <tr>
                <td class="cat cat-build">Implementation Flow</td>
                <td>Success indicators</td>
                <td>Users can choose between routes using visible safety signals.</td>
                <td>Expected checks: route options differ by mode, explanation text updates, leave-by time reacts to conditions.</td>
                <td>Confirms data is influencing decisions, not only display.</td>
            </tr>
            <tr>
                <td class="cat cat-build">Phased Plan</td>
                <td>Phase 1-2</td>
                <td>Foundation audit, dataset prep, then scoring algorithm integration.</td>
                <td>Connect to codebase reality and wire safety scores into backend routes.</td>
                <td>Core decision engine becomes functional.</td>
            </tr>
            <tr>
                <td class="cat cat-build">Phased Plan</td>
                <td>Phase 3-4</td>
                <td>Decision UI, planner logic, hazard lifecycle, full polish.</td>
                <td>Build explanation panel and end-to-end test flow.</td>
                <td>Demo-ready system with visible user value.</td>
            </tr>
            <tr>
                <td class="cat cat-build">Phased Plan</td>
                <td>Primary deliverables</td>
                <td>Scored multi-route API outputs, comparison UI, leave-by planner, hazard lifecycle rules.</td>
                <td>Each deliverable maps to a phase milestone and demo scenario.</td>
                <td>Structured implementation path with measurable completion criteria.</td>
            </tr>
            <tr>
                <td class="cat cat-build">Later Scope</td>
                <td>Future enhancement set</td>
                <td>Mode-specific risk models, user-adjustable safety tolerance, saved-place defaults.</td>
                <td>Examples: biking/walking risk factors, max extra minutes for safer route.</td>
                <td>Deeper personalization if timeline allows.</td>
            </tr>
        </tbody>
    </table>
</div>
