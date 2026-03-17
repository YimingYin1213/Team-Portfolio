---
layout: opencs
title: Hide and Seek
permalink: /gamify/seek
---

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
    const environment = {
        path:"{{site.baseurl}}",
        pythonURI: pythonURI,
        javaURI: javaURI,
        fetchOptions: fetchOptions,
        gameContainer: document.getElementById("gameContainer"),
        gameLevelClasses: gameLevelClasses

    }
    // Launch Adventure Game using the central core and adventure GameControl
    Core.main(environment, GameControl);
</script>
