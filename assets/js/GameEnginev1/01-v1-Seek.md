---
layout: opencs
title: Hide and Seek
permalink: /gamify/seek
---

<style>
  #gameContainer {
    width: 100%;
    min-height: 600px;
  }
  .embed-mode header,
  .embed-mode footer,
  .embed-mode nav,
  .embed-mode .site-header,
  .embed-mode .site-footer {
    display: none !important;
  }
  .embed-mode .page-content,
  .embed-mode .wrapper {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .embed-mode #gameContainer {
    height: 100vh;
    min-height: 100vh;
  }
</style>

<script>
  (function () {
    const params = new URLSearchParams(window.location.search);
    const isEmbed = params.get('embed') === '1' || window.self !== window.top;
    if (isEmbed) {
      document.documentElement.classList.add('embed-mode');
      document.body.classList.add('embed-mode');
    }
  })();
</script>

<div id="gameContainer">
    <div id="promptDropDown" class="promptDropDown" style="z-index: 9999"></div>
    <!-- GameEnv will create canvas dynamically -->
</div>

<script type="module">
    // Adnventure Game assets locations
    import Core from "{{site.baseurl}}/assets/js/GameEnginev1/essentials/Game.js?v={{ site.time | date: '%s' }}";
    import GameControl from "{{site.baseurl}}/assets/js/GameEnginev1/essentials/GameControl.js?v={{ site.time | date: '%s' }}";
    import GameLevelSeek from "{{site.baseurl}}/assets/js/GameEnginev1/GameLevelSeek.js?v={{ site.time | date: '%s' }}";
    import { pythonURI, javaURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js?v={{ site.time | date: '%s' }}';

    const gameLevelClasses = [GameLevelSeek];

    // Web Server Environment data
    const inferredBase = window.location.pathname.startsWith('/Team-Portfolio/') ? '/Team-Portfolio' : '';
    const path = "{{site.baseurl}}" || inferredBase;

    const environment = {
        path: path,
        pythonURI: pythonURI,
        javaURI: javaURI,
        fetchOptions: fetchOptions,
        gameContainer: document.getElementById("gameContainer"),
        gameLevelClasses: gameLevelClasses

    }
    // Launch Adventure Game using the central core and adventure GameControl
    Core.main(environment, GameControl);
</script>
