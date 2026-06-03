"use strict";

var canvas;
var gl;
var program;

var NumVertices = 36;

var pointsArray = [];
var normalsArray = [];

var modelViewMatrix;
var projectionMatrix;
var modelViewMatrixLoc;
var projectionMatrixLoc;
var colorLoc;
var lightPositionLoc;
var ambientStrengthLoc;
var diffuseStrengthLoc;
var rimStrengthLoc;
var instanceMatrix;

var stack = [];
var figure = [];

var torsoId = 0;
var headId = 1;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var leftHandId = 4;
var rightUpperArmId = 5;
var rightLowerArmId = 6;
var rightHandId = 7;
var leftUpperLegId = 8;
var leftLowerLegId = 9;
var leftFootId = 10;
var rightUpperLegId = 11;
var rightLowerLegId = 12;
var rightFootId = 13;
var numNodes = 14;

var TORSO_HEIGHT = 1.2;
var TORSO_WIDTH = 0.8;
var TORSO_DEPTH = 0.4;

var HEAD_HEIGHT = 0.74;
var HEAD_WIDTH = 0.74;
var HEAD_DEPTH = 0.74;

var UPPER_ARM_HEIGHT = 0.56;
var LOWER_ARM_HEIGHT = 0.41;
var HAND_HEIGHT = 0.23;
var ARM_WIDTH = 0.4;
var ARM_DEPTH = 0.4;
var SLEEVE_HEIGHT = 0.27;

var UPPER_LEG_HEIGHT = 0.58;
var LOWER_LEG_HEIGHT = 0.48;
var FOOT_HEIGHT = 0.16;
var LEG_WIDTH = 0.38;
var LEG_DEPTH = 0.4;
var FOOT_DEPTH = 0.43;

var JOINT_OVERLAP = 0.045;
var WALK_HIP_OVERLAP = 0.04;
var CROUCH_JOINT_OVERLAP = 0.05;
var CROUCH_HIP_OVERLAP = 0.20;
var CROUCH_HEAD_OVERLAP = 0.045;
var FRONT_PATCH_DEPTH = 0.003;
var SIDE_PATCH_WIDTH = 0.003;
var TOP_PATCH_HEIGHT = 0.003;

var theta = [];
var walking = true;
var crouching = false;
var autoRotate = false;
var paused = false;
var time = 0.0;
var lastFrameTime = 0.0;
var frameScale = 1.0;
var canvasDisplayWidth = 0;
var canvasDisplayHeight = 0;
var sceneLightingMode = "";
var sceneClearMode = "";
var currentDrawColor = null;
var cameraPopupVisible = false;
var playerNameTagVisible = false;
var lastNameTagLeft = "";
var lastNameTagTop = "";
var bodyRotation = 180.0;
var crouchAmount = 0.0;
var bodyBounce = 0.0;
var bodyPitch = 0.0;
var bodyShiftZ = 0.0;
var playerX = 0.0;
var playerY = 0.0;
var playerZ = 0.0;
var moveSpeed = 0.040;
var moving = false;
var keys = {};
var jumping = false;
var jumpFrame = 0.0;
var JUMP_PREP_DURATION = 8.0;
var JUMP_AIR_DURATION = 30.0;
var JUMP_DURATION = JUMP_PREP_DURATION + JUMP_AIR_DURATION;
var JUMP_HEIGHT = 0.65;
var cameraYaw = 180.0;
var cameraPitch = 18.0;
var cinematicEye = vec3(5.0, 2.8, 6.2);
var cinematicYaw = -140.0;
var cinematicPitch = -16.0;
var cinematicMode = "fixed";
var freeCameraSpeed = 0.10;
var mouseDragging = false;
var mouseOverCanvas = false;
var lastMouseX = 0;
var lastMouseY = 0;
var mouseSensitivity = 0.22;
var cameraMode = "third";
var gameState = "menu";
var optionReturnState = "menu";
var playerName = "Steve";
var playerNameTag;
var cameraModePopup;
var cameraPopupTimer = 0;
var showPlayerNameTag = true;
var nightMode = false;
var nightCreeperTimer = 0.0;
var NIGHT_CREEPER_DELAY = 3600.0;
var nightCreeperEnabled = true;
var nightCreeperSpawned = false;
var armSwingFrame = 0.0;
var armSwingActive = false;
var armSwingHeld = false;
var armSwingReturnFrame = 0.0;
var armSwingUpperSideAngle = 0.0;
var armSwingSideAngle = 0.0;
var ARM_SWING_DURATION = 16.0;
var ARM_SWING_RETURN_DURATION = 8.0;
var targetBlock = {
    x: 0.0,
    y: -0.294,
    z: -3.2,
    hits: 0,
    broken: false
};
var BLOCK_BREAK_HITS = 10;
var BLOCK_INTERACTION_DISTANCE = 2.2;
var explosionBreakRadius = 4.2;
var worldBlocks = [
    { x: 0.0, y: -0.294, z: -4.8, broken: false },
    { x: -1.6, y: -0.294, z: -3.2, broken: false },
    { x: 1.6, y: -0.294, z: -3.2, broken: false }
];

var creeperVisible = false;
var creeperX = -16.0;
var creeperY = 1.54;
var creeperZ = 16.0;
var creeperSpeed = 0.025;
var creeperYaw = 0.0;
var creeperFuseActive = false;
var creeperFuseFrame = 0.0;
var CREEPER_FUSE_DURATION = 62.0;
var explosionActive = false;
var explosionFrame = 0.0;
var EXPLOSION_DURATION = 34.0;
var explosionX = 0.0;
var explosionY = 0.0;
var explosionZ = 0.0;
var steveFallDelayFrame = 0.0;
var STEVE_FALL_DELAY = 30.0;
var steveFallen = false;
var delayedExplosionBreakPending = false;
var endingTriggered = false;
var gameSounds = {};
var soundsReady = false;
var colors = {
    skin: vec4(0.63, 0.46, 0.36, 1.0),
    skinLight: vec4(0.72, 0.53, 0.42, 1.0),
    skinDark: vec4(0.48, 0.32, 0.25, 1.0),
    hair: vec4(0.15, 0.09, 0.03, 1.0),
    hairLight: vec4(0.26, 0.15, 0.06, 1.0),
    beard: vec4(0.18, 0.10, 0.04, 1.0), 
    shirt: vec4(0.00, 0.62, 0.65, 1.0),
    shirtLight: vec4(0.04, 0.72, 0.73, 1.0),
    shirtDark: vec4(0.00, 0.46, 0.50, 1.0),
    pants: vec4(0.22, 0.19, 0.66, 1.0),
    pantsLight: vec4(0.28, 0.25, 0.76, 1.0),
    pantsDark: vec4(0.13, 0.12, 0.46, 1.0),
    shoe: vec4(0.19, 0.19, 0.20, 1.0),
    eyeWhite: vec4(0.88, 0.90, 0.94, 1.0),
    eyeBlue: vec4(0.35, 0.25, 0.65, 1.0), 
    mouth: vec4(0.70, 0.45, 0.40, 1.0), 
    nose: vec4(0.55, 0.38, 0.28, 1.0), 

    greenGrass: vec4(0.30, 0.44, 0.26, 1.0),
    greenLight: vec4(0.34, 0.50, 0.30, 1.0),
    greenDark: vec4(0.23, 0.37, 0.19, 1.0),

    brownGrey: vec4(0.31, 0.32, 0.33, 1.0),
    brownLight: vec4(0.42, 0.3, 0.23, 1.0),
    brownSoil: vec4(0.30, 0.20, 0.13, 1.0),
    brownDark: vec4(0.22, 0.14, 0.09, 1.0),
    greyDark: vec4(0.39, 0.39, 0.39, 1.0),
    blueLight: vec4(0.09, 0.79, 0.75, 1.0),
    blueDia: vec4(0.15, 0.80, 0.80, 1.0),
    blueDark: vec4(0.13, 0.58, 0.57, 1.0),
    crack: vec4(0.08, 0.08, 0.09, 1.0),
    black: vec4(0.0, 0.0, 0.0, 1.0),
    creeperGreen: vec4(0.25, 0.65, 0.19, 1.0),
    creeperFlash: vec4(0.96, 0.96, 0.90, 1.0),
    explosionWhite: vec4(0.94, 0.94, 0.90, 0.72),
    explosionSmoke: vec4(0.34, 0.34, 0.33, 0.52),
    cloud: vec4(0.92, 0.94, 0.96, 0.72),
    cloudShadow: vec4(0.72, 0.76, 0.80, 0.48),
    cloudNight: vec4(0.45, 0.50, 0.62, 0.38),
    cloudNightShadow: vec4(0.20, 0.24, 0.34, 0.28),
    moon: vec4(0.92, 0.90, 0.72, 1.0),
    moonLight: vec4(1.0, 0.95, 0.58, 1.0),
    moonDark: vec4(0.74, 0.70, 0.48, 1.0),
    wood: vec4(0.36, 0.22, 0.12, 1.0),
    woodLight: vec4(0.48, 0.30, 0.17, 1.0),
    woodDark: vec4(0.22, 0.13, 0.07, 1.0),
    leaves: vec4(0.14, 0.42, 0.16, 1.0),
    leavesLight: vec4(0.20, 0.52, 0.20, 1.0),
    leavesDark: vec4(0.08, 0.28, 0.10, 1.0)
};

function initSounds()
{
    if (soundsReady) {
        return;
    }

    gameSounds.walk = new Audio("sounds/walk.mp3");
    gameSounds.jump = new Audio("sounds/jump.mp3");
    gameSounds.mining = new Audio("sounds/mining.mp3");
    gameSounds.blockPop = new Audio("sounds/get_block_pop.mp3");
    gameSounds.click = new Audio("sounds/click.mp3");
    gameSounds.creeperFuse = new Audio("sounds/creeper_before_explosion.mp3");
    gameSounds.creeperExplosion = new Audio("sounds/creeper_explosion.mp3");

    gameSounds.walk.loop = true;
    gameSounds.creeperFuse.loop = true;

    gameSounds.walk.volume = 0.24;
    gameSounds.jump.volume = 0.42;
    gameSounds.mining.volume = 0.48;
    gameSounds.blockPop.volume = 0.45;
    gameSounds.click.volume = 0.35;
    gameSounds.creeperFuse.volume = 0.38;
    gameSounds.creeperExplosion.volume = 0.58;

    soundsReady = true;
}

function playSound(name)
{
    initSounds();

    var sound = gameSounds[name];
    if (!sound) {
        return;
    }

    sound.currentTime = 0.0;
    var playResult = sound.play();
    if (playResult && playResult.catch) {
        playResult.catch(function () {});
    }
}

function playLoopingSound(name)
{
    initSounds();

    var sound = gameSounds[name];
    if (!sound || !sound.paused) {
        return;
    }

    var playResult = sound.play();
    if (playResult && playResult.catch) {
        playResult.catch(function () {});
    }
}

function stopSound(name)
{
    var sound = gameSounds[name];
    if (!sound) {
        return;
    }

    sound.pause();
    sound.currentTime = 0.0;
}

function stopAllSounds()
{
    stopSound("walk");
    stopSound("mining");
    stopSound("creeperFuse");
    stopSound("creeperExplosion");
}

function syncWalkingSound()
{
    if (gameState === "playing" && !paused && walking && moving && !steveFallen &&
        !(cameraMode === "cinematic" && cinematicMode === "free")) {
        playLoopingSound("walk");
    }
    else {
        stopSound("walk");
    }
}

var vertices = [
    vec4(-0.5, -0.5,  0.5, 1.0),
    vec4(-0.5,  0.5,  0.5, 1.0),
    vec4( 0.5,  0.5,  0.5, 1.0),
    vec4( 0.5, -0.5,  0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5,  0.5, -0.5, 1.0),
    vec4( 0.5,  0.5, -0.5, 1.0),
    vec4( 0.5, -0.5, -0.5, 1.0)
];

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    playerNameTag = document.getElementById("PlayerNameTag");
    cameraModePopup = document.getElementById("CameraModePopup");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    for (var i = 0; i < numNodes; i++) {
        theta[i] = 0.0;
        figure[i] = createNode(null, null, null, null);
    }

    colorCube();

    gl.clearColor(0.68, 0.83, 0.96, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    colorLoc = gl.getUniformLocation(program, "uColor");
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    ambientStrengthLoc = gl.getUniformLocation(program, "ambientStrength");
    diffuseStrengthLoc = gl.getUniformLocation(program, "diffuseStrength");
    rimStrengthLoc = gl.getUniformLocation(program, "rimStrength");

    resizeCanvas();
    gl.uniform4fv(lightPositionLoc, flatten(vec4(2.0, 4.0, 3.0, 0.0)));
    window.addEventListener("resize", resizeCanvas);

    document.getElementById("RotateButton").onclick = function () {
        autoRotate = !autoRotate;
    };

    document.getElementById("CameraModeButton").onclick = function () {
        toggleCameraMode();
    };

    document.getElementById("CineResetButton").onclick = function () {
        resetCinematicCamera();
    };

    document.getElementById("ResetButton").onclick = function () {
        resetPose();
    };

    document.getElementById("GuideToggleButton").onclick = function () {
        toggleBottomToolPanel("GuidePanel");
    };

    document.getElementById("DevToggleButton").onclick = function () {
        toggleBottomToolPanel("DevPanel");
    };

    document.getElementById("SpawnCreeperButton").onclick = function () {
        spawnCreeper();
    };

    document.getElementById("NicknameButton").onclick = function () {
        var name = prompt("Enter Player Name", playerName);

        if (name !== null) {
            name = name.trim();
            playerName = name.length > 0 ? name : "Steve";
            document.getElementById("NicknameButton").textContent = "Player Name: " + playerName;
            playerNameTag.textContent = playerName;
            document.getElementById("MenuMessage").textContent = "Ready, " + playerName + ".";
        }
    };

    document.getElementById("SinglePlayerButton").onclick = function () {
        startGame();
    };

    document.getElementById("SettingsButton").onclick = function () {
        openOptions("menu");
    };

    document.getElementById("OptionCameraButton").onclick = function () {
        toggleCameraMode();
        document.getElementById("OptionsMessage").textContent =
            cameraMode === "third" ? "Third person camera selected." : "Cinematic camera selected.";
    };

    document.getElementById("OptionNameTagButton").onclick = function () {
        showPlayerNameTag = !showPlayerNameTag;
        syncNameTagButton();
        document.getElementById("OptionsMessage").textContent =
            showPlayerNameTag ? "Name tag enabled." : "Name tag disabled.";
    };

    document.getElementById("OptionNightButton").onclick = function () {
        toggleNightMode();
        document.getElementById("OptionsMessage").textContent =
            nightMode ? "Night mode enabled." : "Day mode enabled.";
    };

    document.getElementById("OptionCreeperButton").onclick = function () {
        if (!nightMode) {
            return;
        }

        nightCreeperEnabled = !nightCreeperEnabled;
        resetNightCreeperTimer();
        syncCreeperSpawnButton();
        document.getElementById("OptionsMessage").textContent =
            nightCreeperEnabled ? "Night creeper spawn enabled." : "Night creeper spawn disabled.";
    };

    document.getElementById("OptionResetPlayerButton").onclick = function () {
        resetPlayerOnly();
        gameState = "options";
        keys = {};
        document.getElementById("OptionsMessage").textContent =
            "Player position reset.";
    };

    document.getElementById("OptionResetBlocksButton").onclick = function () {
        resetBreakableBlocks();
        document.getElementById("OptionsMessage").textContent =
            "Blocks restored.";
    };

    document.getElementById("OptionTitleButton").onclick = function () {
        goToTitleScreen();
    };

    document.getElementById("OptionBackButton").onclick = function () {
        closeOptions();
    };

    document.addEventListener("click", function (event) {
        if (!event.target || event.target.tagName !== "BUTTON" || event.target.disabled) {
            return;
        }

        if (event.target.id === "GuideToggleButton" ||
            event.target.id === "DevToggleButton" ||
            event.target.closest("#DevPanel")) {
            return;
        }

        playSound("click");
    });

    window.addEventListener("keydown", function (event) {
        if (event.code === "Escape") {
            if (gameState === "playing") {
                openOptions("playing");
            }
            else if (gameState === "menu") {
                openOptions("menu");
            }
            else if (gameState === "options") {
                closeOptions();
            }
            event.preventDefault();
            return;
        }

        if (event.code === "Tab") {
            if (gameState === "playing" && cameraMode === "cinematic") {
                toggleCinematicMode();
            }
            event.preventDefault();
            return;
        }

        if (gameState !== "playing") {
            if (isGameKey(event.code)) {
                event.preventDefault();
            }
            return;
        }

        keys[event.code] = true;

        if (event.code === "Space") {
            if (!event.repeat) {
                startJump();
            }
        }
        else if (event.code === "ArrowLeft") {
            cameraYaw -= 5.0;
        }
        else if (event.code === "ArrowRight") {
            cameraYaw += 5.0;
        }
        else if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
            crouching = true;
        }

        if (event.code === "KeyW" || event.code === "KeyA" ||
            event.code === "KeyS" || event.code === "KeyD" ||
            event.code === "ArrowLeft" || event.code === "ArrowRight" ||
            event.code === "KeyQ" || event.code === "KeyE" ||
            event.code === "Space" || event.code === "Tab") {
            event.preventDefault();
        }
    });

    window.addEventListener("keyup", function (event) {
        keys[event.code] = false;

        if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
            crouching = false;
        }
    });

    canvas.addEventListener("click", function () {
        if (gameState !== "playing") {
            return;
        }

        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    });

    canvas.addEventListener("mousedown", function (event) {
        if (gameState !== "playing") {
            return;
        }

        if (event.button === 0) {
            startArmSwing();
            tryHitTargetBlock();
        }

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        mouseDragging = !canvas.requestPointerLock;
        event.preventDefault();
    });

    canvas.addEventListener("mouseenter", function (event) {
        mouseOverCanvas = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    });

    canvas.addEventListener("mouseleave", function () {
        mouseOverCanvas = false;
    });

    window.addEventListener("mouseup", function (event) {
        if (event.button === 0) {
            armSwingHeld = false;
            armSwingReturnFrame = ARM_SWING_RETURN_DURATION;
        }
        mouseDragging = false;
    });

    document.addEventListener("pointerlockchange", function () {
        lastMouseX = 0;
        lastMouseY = 0;
        mouseDragging = false;
    });

    window.addEventListener("mousemove", function (event) {
        var pointerLocked = (document.pointerLockElement === canvas);

        if (gameState !== "playing" ||
            (!mouseOverCanvas && !mouseDragging && !pointerLocked)) {
            return;
        }

        var dx = pointerLocked ? event.movementX :
            (lastMouseX === 0 ? 0 : event.clientX - lastMouseX);
        var dy = pointerLocked ? event.movementY :
            (lastMouseY === 0 ? 0 : event.clientY - lastMouseY);
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

        dx = Math.max(-40.0, Math.min(40.0, dx));
        dy = Math.max(-40.0, Math.min(40.0, dy));

        if (cameraMode === "third") {
            cameraYaw -= dx * mouseSensitivity;
            cameraPitch -= dy * mouseSensitivity;
            cameraPitch = Math.max(-8.0, Math.min(42.0, cameraPitch));
        }
        else if (cameraMode === "cinematic" && cinematicMode === "free") {
            cinematicYaw -= dx * mouseSensitivity;
            cinematicPitch -= dy * mouseSensitivity;
            cinematicPitch = Math.max(-80.0, Math.min(80.0, cinematicPitch));
        }
    });

    render();
};

function isGameKey(code)
{
    return code === "KeyW" || code === "KeyA" ||
        code === "KeyS" || code === "KeyD" ||
        code === "KeyQ" || code === "KeyE" ||
        code === "ArrowLeft" || code === "ArrowRight" ||
        code === "Space" || code === "Tab" ||
        code === "ShiftLeft" || code === "ShiftRight";
}

function startGame()
{
    initSounds();
    resetPose();
    gameState = "playing";
    keys = {};
    document.getElementById("MainMenu").style.display = "none";
    document.getElementById("OptionsMenu").style.display = "none";
}

function openOptions(returnState)
{
    optionReturnState = returnState;
    gameState = "options";
    keys = {};
    mouseDragging = false;
    stopSound("walk");
    stopSound("creeperFuse");

    if (document.exitPointerLock && document.pointerLockElement === canvas) {
        document.exitPointerLock();
    }

    document.getElementById("MainMenu").style.display = "none";
    document.getElementById("OptionsMenu").style.display = "flex";
    document.getElementById("OptionBackButton").textContent =
        returnState === "menu" ? "Back to Menu" : "Back to Game";
    syncCameraModeButtons();
    syncNameTagButton();
    syncNightModeButton();
    syncCreeperSpawnButton();
}

function closeOptions()
{
    gameState = optionReturnState;
    keys = {};
    document.getElementById("OptionsMenu").style.display = "none";

    if (gameState === "menu") {
        document.getElementById("MainMenu").style.display = "flex";
    }
    else if (creeperFuseActive) {
        playLoopingSound("creeperFuse");
    }
}

function toggleBottomToolPanel(panelId)
{
    var guidePanel = document.getElementById("GuidePanel");
    var devPanel = document.getElementById("DevPanel");
    var targetPanel = document.getElementById(panelId);
    var shouldOpen = targetPanel.style.display !== "block";

    guidePanel.style.display = "none";
    devPanel.style.display = "none";

    if (shouldOpen) {
        targetPanel.style.display = "block";
    }
}

function goToTitleScreen()
{
    resetPlayerAndBlocks();
    stopAllSounds();
    gameState = "menu";
    optionReturnState = "menu";
    keys = {};
    mouseDragging = false;

    if (document.exitPointerLock && document.pointerLockElement === canvas) {
        document.exitPointerLock();
    }

    document.getElementById("OptionsMenu").style.display = "none";
    document.getElementById("MainMenu").style.display = "flex";
}

function toggleCameraMode()
{
    cameraMode = (cameraMode === "third") ? "cinematic" : "third";
    syncCameraModeButtons();
}

function toggleCinematicMode()
{
    cinematicMode = (cinematicMode === "fixed") ? "free" : "fixed";
    showCameraModePopup(cinematicMode === "fixed" ? "Fixed Camera" : "Free Camera");
    syncCameraModeButtons();
}

function showCameraModePopup(message)
{
    cameraModePopup.textContent = message;
    cameraModePopup.style.display = "block";
    cameraPopupTimer = 60;
}

function syncCameraModeButtons()
{
    var label = cameraMode === "third" ? "Camera Mode: Third Person" :
        (cinematicMode === "fixed" ? "Camera Mode: Fixed" : "Camera Mode: Free");
    document.getElementById("CameraModeButton").textContent = label;
    document.getElementById("OptionCameraButton").textContent = label;
}

function updateCameraModePopup()
{
    if (cameraPopupTimer <= 0) {
        if (cameraPopupVisible) {
            cameraModePopup.style.display = "none";
            cameraPopupVisible = false;
        }
        return;
    }

    cameraPopupTimer -= frameScale;

    if (!cameraPopupVisible) {
        cameraModePopup.style.display = "block";
        cameraPopupVisible = true;
    }
}

function syncNameTagButton()
{
    document.getElementById("OptionNameTagButton").textContent =
        showPlayerNameTag ? "Name Tag: On" : "Name Tag: Off";
}

function syncNightModeButton()
{
    document.getElementById("OptionNightButton").textContent =
        nightMode ? "Night Mode: On" : "Night Mode: Off";
    syncCreeperSpawnButton();
}

function syncCreeperSpawnButton()
{
    var button = document.getElementById("OptionCreeperButton");

    if (!nightMode) {
        button.textContent = "Creeper Spawn: Day Disabled";
        button.disabled = true;
        return;
    }

    button.disabled = false;
    button.textContent = nightCreeperEnabled ?
        "Creeper Spawn: On" : "Creeper Spawn: Off";
}

function toggleNightMode()
{
    nightMode = !nightMode;
    resetNightCreeperTimer();
    syncNightModeButton();
}

function resetNightCreeperTimer()
{
    nightCreeperTimer = 0.0;
    nightCreeperSpawned = false;
}

function updateNightCreeperSpawn()
{
    if (!nightMode || !nightCreeperEnabled || gameState !== "playing" || nightCreeperSpawned ||
        creeperVisible || endingTriggered || steveFallen) {
        return;
    }

    nightCreeperTimer += frameScale;

    if (nightCreeperTimer >= NIGHT_CREEPER_DELAY) {
        spawnCreeper();
        nightCreeperSpawned = true;
    }
}

function updatePlayerNameTag(viewMatrix)
{
    if (gameState !== "playing" || !showPlayerNameTag) {
        hidePlayerNameTag();
        return;
    }

    var headTop = vec4(playerX, playerY + TORSO_HEIGHT + HEAD_HEIGHT + 0.20, playerZ, 1.0);
    var eyePoint = mult(viewMatrix, headTop);
    var clipPoint = mult(projectionMatrix, eyePoint);

    if (clipPoint[3] <= 0.0) {
        hidePlayerNameTag();
        return;
    }

    var ndcX = clipPoint[0] / clipPoint[3];
    var ndcY = clipPoint[1] / clipPoint[3];

    if (ndcX < -1.2 || ndcX > 1.2 || ndcY < -1.2 || ndcY > 1.2) {
        hidePlayerNameTag();
        return;
    }

    showPlayerNameTagAt(
        ((ndcX * 0.5 + 0.5) * canvasDisplayWidth) + "px",
        ((-ndcY * 0.5 + 0.5) * canvasDisplayHeight) + "px");
}

function hidePlayerNameTag()
{
    if (playerNameTagVisible) {
        playerNameTag.style.display = "none";
        playerNameTagVisible = false;
    }
}

function showPlayerNameTagAt(left, top)
{
    if (!playerNameTagVisible) {
        playerNameTag.style.display = "block";
        playerNameTagVisible = true;
    }

    if (lastNameTagLeft !== left) {
        playerNameTag.style.left = left;
        lastNameTagLeft = left;
    }

    if (lastNameTagTop !== top) {
        playerNameTag.style.top = top;
        lastNameTagTop = top;
    }
}

function tryHitTargetBlock()
{
    if (targetBlock.broken) {
        return;
    }

    var dx = playerX - targetBlock.x;
    var dz = playerZ - targetBlock.z;
    var distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > BLOCK_INTERACTION_DISTANCE) {
        return;
    }

    targetBlock.hits += 1;
    playSound("mining");

    if (targetBlock.hits >= BLOCK_BREAK_HITS) {
        targetBlock.broken = true;
        playSound("blockPop");
    }
}

function resetCinematicCamera()
{
    cinematicEye = vec3(5.0, 2.8, 6.2);
    cinematicYaw = -140.0;
    cinematicPitch = -16.0;
}

function createNode(transform, render, sibling, child)
{
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child
    };
    return node;
}

function initNodes(Id)
{
    var m = mat4();

    switch(Id) {
    case torsoId:
        m = translate(0.0, bodyBounce - crouchAmount, bodyShiftZ);
        m = mult(m, rotate(theta[torsoId], 0, 1, 0));
        m = mult(m, rotate(bodyPitch, 1, 0, 0));
        figure[torsoId] = createNode(m, torso, null, headId);
        break;

    case headId:
        m = translate(0.0, TORSO_HEIGHT - 0.005 - (crouching ? CROUCH_HEAD_OVERLAP : 0.0), 0.0);
        m = mult(m, rotate(crouching ? -bodyPitch : 0.0, 1, 0, 0));
        m = mult(m, rotate(theta[headId], 0, 1, 0));
        figure[headId] = createNode(m, head, leftUpperArmId, null);
        break;

    case leftUpperArmId:
        m = translate(-(TORSO_WIDTH * 0.5 + ARM_WIDTH * 0.5), TORSO_HEIGHT, 0.0);
        m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
        m = mult(m, rotate(armSwingUpperSideAngle, 0, 0, 1));
        figure[leftUpperArmId] = createNode(m, upperArm, rightUpperArmId, leftLowerArmId);
        break;

    case leftLowerArmId:
        m = translate(0.0, -UPPER_ARM_HEIGHT + JOINT_OVERLAP, 0.0);
        m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
        figure[leftLowerArmId] = createNode(m, lowerArm, null, leftHandId);
        break;

    case leftHandId:
        m = translate(0.0, -LOWER_ARM_HEIGHT, 0.0);
        figure[leftHandId] = createNode(m, hand, null, null);
        break;

    case rightUpperArmId:
        m = translate(TORSO_WIDTH * 0.5 + ARM_WIDTH * 0.5, TORSO_HEIGHT, 0.0);
        m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
        figure[rightUpperArmId] = createNode(m, upperArm, leftUpperLegId, rightLowerArmId);
        break;

    case rightLowerArmId:
        m = translate(0.0, -UPPER_ARM_HEIGHT + JOINT_OVERLAP, 0.0);
        m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
        figure[rightLowerArmId] = createNode(m, lowerArm, null, rightHandId);
        break;

    case rightHandId:
        m = translate(0.0, -LOWER_ARM_HEIGHT, 0.0);
        figure[rightHandId] = createNode(m, hand, null, null);
        break;

    case leftUpperLegId:
        m = translate(-LEG_WIDTH * 0.52, crouching ? CROUCH_HIP_OVERLAP : (moving ? WALK_HIP_OVERLAP : 0.0), 0.0);
        m = mult(m, rotate(theta[leftUpperLegId], 1, 0, 0));
        figure[leftUpperLegId] = createNode(m, upperLeg, rightUpperLegId, leftLowerLegId);
        break;

    case leftLowerLegId:
        m = translate(0.0, -UPPER_LEG_HEIGHT + (crouching ? CROUCH_JOINT_OVERLAP : JOINT_OVERLAP), 0.0);
        m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
        figure[leftLowerLegId] = createNode(m, lowerLeg, null, leftFootId);
        break;

    case leftFootId:
        m = translate(0.0, -LOWER_LEG_HEIGHT, 0.03);
        m = mult(m, rotate(theta[leftFootId], 1, 0, 0));
        figure[leftFootId] = createNode(m, foot, null, null);
        break;

    case rightUpperLegId:
        m = translate(LEG_WIDTH * 0.52, crouching ? CROUCH_HIP_OVERLAP : (moving ? WALK_HIP_OVERLAP : 0.0), 0.0);
        m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
        figure[rightUpperLegId] = createNode(m, upperLeg, null, rightLowerLegId);
        break;

    case rightLowerLegId:
        m = translate(0.0, -UPPER_LEG_HEIGHT + (crouching ? CROUCH_JOINT_OVERLAP : JOINT_OVERLAP), 0.0);
        m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
        figure[rightLowerLegId] = createNode(m, lowerLeg, null, rightFootId);
        break;

    case rightFootId:
        m = translate(0.0, -LOWER_LEG_HEIGHT, 0.03);
        m = mult(m, rotate(theta[rightFootId], 1, 0, 0));
        figure[rightFootId] = createNode(m, foot, null, null);
        break;
    }
}

function traverse(Id)
{
    if (Id == null) {
        return;
    }

    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();

    if (figure[Id].child != null) {
        traverse(figure[Id].child);
    }

    modelViewMatrix = stack.pop();

    if (figure[Id].sibling != null) {
        traverse(figure[Id].sibling);
    }
}

function torso()
{
    drawBlock(TORSO_WIDTH, TORSO_HEIGHT, TORSO_DEPTH, colors.shirt,
        0.0, 0.5 * TORSO_HEIGHT, 0.0);

    drawFrontPatch(0.36, 0.055, colors.skinDark,
        0.0, TORSO_HEIGHT - 0.035, 0.5 * TORSO_DEPTH);
    drawFrontPatch(0.30, 0.055, colors.skin,
        0.0, TORSO_HEIGHT - 0.09, 0.5 * TORSO_DEPTH);
    drawFrontPatch(0.24, 0.055, colors.skin,
        0.0, TORSO_HEIGHT - 0.145, 0.5 * TORSO_DEPTH);
    drawFrontPatch(TORSO_WIDTH * 0.20, 0.42, colors.shirtDark,
        -0.14, 0.58, 0.5 * TORSO_DEPTH);
    drawFrontPatch(TORSO_WIDTH * 0.20, 0.40, colors.shirtLight,
        0.13, 0.64, 0.5 * TORSO_DEPTH);
}

function head()
{
    drawBlock(HEAD_WIDTH, HEAD_HEIGHT, HEAD_DEPTH, colors.skin,
        0.0, 0.5 * HEAD_HEIGHT, 0.0);

    drawTopPatch(HEAD_WIDTH, HEAD_DEPTH, colors.hair,
        0.0, 0.0, HEAD_HEIGHT);
    drawFrontPatch(HEAD_WIDTH, 0.24, colors.hair, 
        0.0, HEAD_HEIGHT - 0.12, 0.5 * HEAD_DEPTH);
    drawBackPatch(HEAD_WIDTH, 0.50, colors.hair,
        0.0, HEAD_HEIGHT - 0.25, 0.5 * HEAD_DEPTH);
    
    drawLeftPatch(0.47, HEAD_DEPTH, colors.hair,
        HEAD_HEIGHT - 0.235, 0.0, 0.5 * HEAD_WIDTH);
    drawRightPatch(0.47, HEAD_DEPTH, colors.hair,
        HEAD_HEIGHT - 0.235, 0.0, 0.5 * HEAD_WIDTH);
    drawFrontPatch(0.055, 0.176, colors.hair,
        -0.34, 0.442, 0.5 * HEAD_DEPTH);
    drawFrontPatch(0.055, 0.176, colors.hair,
        0.34, 0.442, 0.5 * HEAD_DEPTH);

    var eyeY = 0.32;
    drawFrontPatch(0.09, 0.09, colors.eyeWhite,
        -0.22, eyeY, 0.5 * HEAD_DEPTH);
    drawFrontPatch(0.09, 0.09, colors.eyeBlue,
        -0.13, eyeY, 0.5 * HEAD_DEPTH);
    drawFrontPatch(0.09, 0.09, colors.eyeBlue,
        0.13, eyeY, 0.5 * HEAD_DEPTH);
    drawFrontPatch(0.09, 0.09, colors.eyeWhite,
        0.22, eyeY, 0.5 * HEAD_DEPTH);

    drawFrontPatch(0.18, 0.09, colors.nose,
        0.0, 0.23, 0.5 * HEAD_DEPTH);

    drawFrontPatch(0.18, 0.09, colors.mouth,
        0.0, 0.14, 0.5 * HEAD_DEPTH);

    drawFrontPatch(0.09, 0.09, colors.beard,
        -0.135, 0.14, 0.5 * HEAD_DEPTH); 
    drawFrontPatch(0.09, 0.09, colors.beard,
        0.135, 0.14, 0.5 * HEAD_DEPTH); 
    drawFrontPatch(0.36, 0.09, colors.beard,
        0.0, 0.05, 0.5 * HEAD_DEPTH);  
}

function upperArm()
{
    var skinHeight = UPPER_ARM_HEIGHT - SLEEVE_HEIGHT;

    drawBlock(ARM_WIDTH, SLEEVE_HEIGHT, ARM_DEPTH, colors.shirt,
        0.0, -0.5 * SLEEVE_HEIGHT, 0.0);
    drawBlock(ARM_WIDTH, skinHeight, ARM_DEPTH, colors.skin,
        0.0, -SLEEVE_HEIGHT - 0.5 * skinHeight, 0.0);
    drawFrontPatch(ARM_WIDTH * 0.24, skinHeight * 0.30, colors.skinDark,
        0.09, -SLEEVE_HEIGHT - 0.55 * skinHeight, 0.5 * ARM_DEPTH);
}

function lowerArm()
{
    drawBlock(ARM_WIDTH, LOWER_ARM_HEIGHT, ARM_DEPTH, colors.skin,
        0.0, -0.5 * LOWER_ARM_HEIGHT, 0.0);
    drawFrontPatch(ARM_WIDTH * 0.24, LOWER_ARM_HEIGHT * 0.28, colors.skinDark,
        0.08, -0.55 * LOWER_ARM_HEIGHT, 0.5 * ARM_DEPTH);
}

function hand()
{
    drawBlock(ARM_WIDTH, HAND_HEIGHT, ARM_DEPTH, colors.skin,
        0.0, -0.5 * HAND_HEIGHT, 0.0);
}

function upperLeg()
{
    drawBlock(LEG_WIDTH, UPPER_LEG_HEIGHT, LEG_DEPTH, colors.pants,
        0.0, -0.5 * UPPER_LEG_HEIGHT, 0.0);
    drawFrontPatch(LEG_WIDTH * 0.36, UPPER_LEG_HEIGHT * 0.14, colors.pantsDark,
        -0.04, -0.70 * UPPER_LEG_HEIGHT, 0.5 * LEG_DEPTH);
}

function lowerLeg()
{
    drawBlock(LEG_WIDTH, LOWER_LEG_HEIGHT, LEG_DEPTH, colors.pants,
        0.0, -0.5 * LOWER_LEG_HEIGHT, 0.0);
    drawFrontPatch(LEG_WIDTH * 0.42, 0.09, colors.pantsDark,
        0.0, -0.65 * LOWER_LEG_HEIGHT, 0.5 * LEG_DEPTH);
}

function foot()
{
    drawBlock(LEG_WIDTH, FOOT_HEIGHT, FOOT_DEPTH, colors.shoe,
        0.0, -0.5 * FOOT_HEIGHT, 0.02);
}

function drawBlock(width, height, depth, color, x, y, z)
{
    instanceMatrix = mult(modelViewMatrix, translate(x, y, z));
    instanceMatrix = mult(instanceMatrix, scale4(width, height, depth));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    if (currentDrawColor !== color) {
        gl.uniform4fv(colorLoc, flatten(color));
        currentDrawColor = color;
    }
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function drawFrontPatch(width, height, color, x, y, z)
{
    drawBlock(width, height, FRONT_PATCH_DEPTH, color,
        x, y, z + 0.5 * FRONT_PATCH_DEPTH);
}

function drawBackPatch(width, height, color, x, y, z)
{
    drawBlock(width, height, FRONT_PATCH_DEPTH, color,
        x, y, -z - 0.5 * FRONT_PATCH_DEPTH);
}

function drawLeftPatch(height, depth, color, y, z, x)
{
    drawBlock(SIDE_PATCH_WIDTH, height, depth, color,
        -x - 0.5 * SIDE_PATCH_WIDTH, y, z);
}

function drawRightPatch(height, depth, color, y, z, x)
{
    drawBlock(SIDE_PATCH_WIDTH, height, depth, color,
        x + 0.5 * SIDE_PATCH_WIDTH, y, z);
}

function drawTopPatch(width, depth, color, x, z, y)
{
    drawBlock(width, TOP_PATCH_HEIGHT, depth, color,
        x, y + 0.5 * TOP_PATCH_HEIGHT, z);
}

function updatePose()
{
    if (!paused) {
        time += 0.035 * frameScale;
        updateMovement();
        updateFreeCamera();
        syncWalkingSound();
        updateJump();

        if (autoRotate) {
            cameraYaw += 0.25 * frameScale;
        }
    }

    theta[torsoId] = bodyRotation;
    theta[headId] = 4.0 * Math.sin(time * 1.5);
    theta[leftFootId] = 0.0;
    theta[rightFootId] = 0.0;
    bodyBounce = 0.0;
    bodyPitch = 0.0;
    bodyShiftZ = 0.0;
    armSwingUpperSideAngle = 0.0;
    armSwingSideAngle = 0.0;

    if (walking && moving) {
        var phase = time * 3.35;
        var hipSwing = Math.sin(phase);
        var oppositeHipSwing = Math.sin(phase + Math.PI);
        var armSwing = Math.sin(phase + 0.12);
        var leftStep = Math.max(0.0, Math.sin(phase));
        var rightStep = Math.max(0.0, -Math.sin(phase));
        var footRoll = Math.cos(phase);
        var leftHeelLift = Math.max(0.0, -footRoll);
        var rightHeelLift = Math.max(0.0, footRoll);

        bodyBounce = 0.012 + Math.max(0.0, -Math.cos(phase * 2.0)) * 0.026;
        bodyPitch = -1.2 + 0.85 * Math.sin(phase + 0.35);

        theta[leftUpperArmId] = armSwing * 24.0 - 2.0;
        theta[rightUpperArmId] = -armSwing * 24.0 - 2.0;
        theta[leftLowerArmId] = -7.0 - Math.max(0.0, -armSwing) * 8.0;
        theta[rightLowerArmId] = -7.0 - Math.max(0.0, armSwing) * 8.0;

        theta[leftUpperLegId] = -hipSwing * 33.0 - leftStep * 2.0;
        theta[rightUpperLegId] = -oppositeHipSwing * 33.0 - rightStep * 2.0;
        theta[leftLowerLegId] = leftStep * 17.0 + leftHeelLift * 6.0;
        theta[rightLowerLegId] = rightStep * 17.0 + rightHeelLift * 6.0;
        theta[leftFootId] = -footRoll * 6.0 - leftStep * 3.0;
        theta[rightFootId] = footRoll * 6.0 - rightStep * 3.0;
    }
    else {
        theta[leftUpperArmId] = 4.0 * Math.sin(time * 2.0);
        theta[rightUpperArmId] = -4.0 * Math.sin(time * 2.0);
        theta[leftLowerArmId] = 0.0;
        theta[rightLowerArmId] = 0.0;
        theta[leftUpperLegId] = 0.0;
        theta[rightUpperLegId] = 0.0;
        theta[leftLowerLegId] = 0.0;
        theta[rightLowerLegId] = 0.0;
    }

    if (crouching) {
        crouchAmount = 0.24;
        bodyShiftZ = 0.0;
        bodyPitch += 22.0;
        theta[leftUpperLegId] += -26.0;
        theta[rightUpperLegId] += -26.0;
        theta[leftLowerLegId] += 18.0;
        theta[rightLowerLegId] += 18.0;
        theta[leftFootId] = -(bodyPitch + theta[leftUpperLegId] + theta[leftLowerLegId]);
        theta[rightFootId] = -(bodyPitch + theta[rightUpperLegId] + theta[rightLowerLegId]);
        theta[leftUpperArmId] *= 0.4;
        theta[rightUpperArmId] *= 0.4;
    }
    else {
        crouchAmount = 0.0;
    }

    applyJumpPose();
    applyArmSwing();
}

function applyJumpPose()
{
    if (!jumping) {
        return;
    }

    var prep = 0.0;
    var landing = 0.0;
    var airborne = 0.0;

    if (jumpFrame < JUMP_PREP_DURATION) {
        prep = Math.sin((jumpFrame / JUMP_PREP_DURATION) * Math.PI * 0.5);
    }
    else {
        var airProgress = (jumpFrame - JUMP_PREP_DURATION) / JUMP_AIR_DURATION;
        airborne = Math.sin(airProgress * Math.PI);
        landing = Math.max(0.0, (airProgress - 0.72) / 0.28);
    }

    var kneeBend = prep * 22.0 + landing * 6.0;

    bodyBounce -= prep * 0.08;
    theta[leftUpperLegId] += -kneeBend * 0.45 + airborne * 4.0;
    theta[rightUpperLegId] += -kneeBend * 0.45 + airborne * 4.0;
    theta[leftLowerLegId] += kneeBend;
    theta[rightLowerLegId] += kneeBend;
    theta[leftFootId] += -12.0 * prep + 3.0 * landing;
    theta[rightFootId] += -12.0 * prep + 3.0 * landing;
}

function startArmSwing()
{
    armSwingActive = true;
    armSwingHeld = true;
    armSwingReturnFrame = 0.0;
}

function applyArmSwing()
{
    if (!armSwingActive) {
        return;
    }

    var blend = 1.0;
    var progress = armSwingFrame / ARM_SWING_DURATION;
    var sideSwing = Math.sin(progress * Math.PI * 2.0);
    var chop = 0.5 - 0.5 * Math.cos(progress * Math.PI * 2.0);

    if (!armSwingHeld) {
        blend = Math.max(0.0, armSwingReturnFrame / ARM_SWING_RETURN_DURATION);
    }

    theta[leftUpperArmId] = theta[leftUpperArmId] * (1.0 - blend) +
        ((-50.0 - 3.0 * chop) * blend);
    theta[leftLowerArmId] = theta[leftLowerArmId] * (1.0 - blend) +
        ((-5.0 - 24.0 * chop) * blend);
    armSwingUpperSideAngle = sideSwing * 3.2 * blend;
    armSwingSideAngle = 0.0;

    if (!paused) {
        if (armSwingHeld) {
            armSwingFrame += frameScale;

            if (armSwingFrame >= ARM_SWING_DURATION) {
                armSwingFrame = 0.0;
                tryHitTargetBlock();
            }
        }
        else {
            armSwingReturnFrame -= frameScale;

            if (armSwingReturnFrame <= 0.0) {
                armSwingFrame = 0.0;
                armSwingReturnFrame = 0.0;
                armSwingActive = false;
            }
        }
    }
}

function startJump()
{
    if (jumping || crouching) {
        return;
    }

    jumping = true;
    jumpFrame = 0.0;
    playSound("jump");
}

function updateJump()
{
    if (!jumping) {
        playerY = 0.0;
        return;
    }

    var progress = jumpFrame / JUMP_DURATION;

    if (jumpFrame < JUMP_PREP_DURATION) {
        playerY = 0.0;
    }
    else {
        var airProgress = (jumpFrame - JUMP_PREP_DURATION) / JUMP_AIR_DURATION;
        playerY = Math.sin(airProgress * Math.PI) * JUMP_HEIGHT;
    }

    if (!paused) {
        jumpFrame += frameScale;

        if (jumpFrame >= JUMP_DURATION) {
            jumping = false;
            jumpFrame = 0.0;
            playerY = 0.0;
        }
    }
}

function resetPlayerAndBlocks()
{
    resetPlayerOnly();
    resetBreakableBlocks();
}

function resetPlayerOnly()
{
    stopAllSounds();
    playerX = 0.0;
    playerY = 0.0;
    playerZ = 0.0;
    moving = false;
    crouching = false;
    jumping = false;
    jumpFrame = 0.0;
    armSwingFrame = 0.0;
    armSwingActive = false;
    armSwingHeld = false;
    armSwingReturnFrame = 0.0;
    armSwingUpperSideAngle = 0.0;
    armSwingSideAngle = 0.0;
    keys = {};
    creeperVisible = false;
    creeperX = -16.0;
    creeperY = 1.54;
    creeperZ = 16.0;
    creeperYaw = 0.0;
    creeperFuseActive = false;
    creeperFuseFrame = 0.0;
    explosionActive = false;
    explosionFrame = 0.0;
    steveFallDelayFrame = 0.0;
    steveFallen = false;
    delayedExplosionBreakPending = false;
    resetNightCreeperTimer();
    endingTriggered = false;
}

function resetBreakableBlocks()
{
    targetBlock.hits = 0;
    targetBlock.broken = false;
    resetWorldBlocks();
}

function resetPose()
{
    stopAllSounds();
    time = 0.0;
    bodyRotation = 180.0;
    cameraYaw = 180.0;
    cameraPitch = 18.0;
    resetCinematicCamera();
    cinematicMode = "fixed";
    cameraMode = "third";
    syncCameraModeButtons();
    playerX = 0.0;
    playerY = 0.0;
    playerZ = 0.0;
    moving = false;
    walking = true;
    crouching = false;
    autoRotate = false;
    paused = false;
    nightMode = false;
    syncNightModeButton();
    armSwingFrame = 0.0;
    armSwingActive = false;
    armSwingHeld = false;
    armSwingReturnFrame = 0.0;
    armSwingUpperSideAngle = 0.0;
    armSwingSideAngle = 0.0;
    jumping = false;
    jumpFrame = 0.0;
    targetBlock.hits = 0;
    targetBlock.broken = false;
    resetWorldBlocks();
    creeperVisible = false;
    creeperX = -16.0;
    creeperY = 1.54;
    creeperZ = 16.0;
    creeperYaw = 0.0;
    creeperFuseActive = false;
    creeperFuseFrame = 0.0;
    explosionActive = false;
    explosionFrame = 0.0;
    steveFallDelayFrame = 0.0;
    steveFallen = false;
    delayedExplosionBreakPending = false;
    resetNightCreeperTimer();
    endingTriggered = false;
}

function updateMovement()
{
    if (steveFallen) {
        moving = false;
        return;
    }

    if (gameState !== "playing") {
        moving = false;
        return;
    }

    if (cameraMode === "cinematic" && cinematicMode === "free") {
        moving = false;
        return;
    }

    var x = (keys["KeyA"] ? 1.0 : 0.0) - (keys["KeyD"] ? 1.0 : 0.0);
    var z = (keys["KeyW"] ? 1.0 : 0.0) - (keys["KeyS"] ? 1.0 : 0.0);

    moving = (x !== 0.0 || z !== 0.0);

    if (!moving) {
        return;
    }

    if (z !== 0.0 && x !== 0.0) {
        bodyRotation = normalizeAngle(bodyRotation + x * z * 2.2 * frameScale);
        x = 0.0;
    }

    var length = Math.sqrt(x * x + z * z);
    x /= length;
    z /= length;

    var angle = radians(bodyRotation);
    var forwardX = Math.sin(angle);
    var forwardZ = Math.cos(angle);
    var rightX = Math.cos(angle);
    var rightZ = -Math.sin(angle);
    var speed = crouching ? moveSpeed * 0.45 : moveSpeed;

    var moveX = forwardX * z + rightX * x;
    var moveZ = forwardZ * z + rightZ * x;
    playerX += moveX * speed * frameScale;
    playerZ += moveZ * speed * frameScale;
}

function updateFreeCamera()
{
    if (gameState !== "playing" || cameraMode !== "cinematic" || cinematicMode !== "free") {
        return;
    }

    var x = (keys["KeyA"] ? 1.0 : 0.0) - (keys["KeyD"] ? 1.0 : 0.0);
    var z = (keys["KeyW"] ? 1.0 : 0.0) - (keys["KeyS"] ? 1.0 : 0.0);
    var y = (keys["KeyE"] ? 1.0 : 0.0) - (keys["KeyQ"] ? 1.0 : 0.0);

    if (x === 0.0 && y === 0.0 && z === 0.0) {
        return;
    }

    var yaw = radians(cinematicYaw);
    var pitch = radians(cinematicPitch);
    var forwardX = Math.sin(yaw) * Math.cos(pitch);
    var forwardY = Math.sin(pitch);
    var forwardZ = Math.cos(yaw) * Math.cos(pitch);
    var rightX = Math.cos(yaw);
    var rightZ = -Math.sin(yaw);
    var length = Math.sqrt(x * x + y * y + z * z);

    x /= length;
    y /= length;
    z /= length;

    cinematicEye = vec3(
        cinematicEye[0] + (forwardX * z + rightX * x) * freeCameraSpeed * frameScale,
        cinematicEye[1] + (forwardY * z + y) * freeCameraSpeed * frameScale,
        cinematicEye[2] + (forwardZ * z + rightZ * x) * freeCameraSpeed * frameScale
    );
}

function turnToward(current, target, maxStep)
{
    current = normalizeAngle(current);
    target = normalizeAngle(target);
    var diff = normalizeAngle(target - current + 180.0) - 180.0;
    diff = Math.max(-maxStep, Math.min(maxStep, diff));
    return normalizeAngle(current + diff);
}

function normalizeAngle(angle)
{
    return ((angle % 360.0) + 360.0) % 360.0;
}

function updateFrameScale()
{
    var now = (window.performance && window.performance.now) ?
        window.performance.now() : Date.now();

    if (lastFrameTime === 0.0) {
        lastFrameTime = now;
        frameScale = 1.0;
        return;
    }

    var deltaSeconds = (now - lastFrameTime) / 1000.0;
    lastFrameTime = now;

    frameScale = Math.max(0.25, Math.min(2.5, deltaSeconds * 60.0));
}

function applySceneLighting()
{
    var mode = nightMode ? "night" : "day";

    if (sceneLightingMode === mode) {
        return;
    }

    sceneLightingMode = mode;

    if (nightMode) {
        gl.uniform4fv(lightPositionLoc, flatten(vec4(-2.2, 5.8, -3.2, 0.0)));
        gl.uniform1f(ambientStrengthLoc, 0.42);
        gl.uniform1f(diffuseStrengthLoc, 0.38);
        gl.uniform1f(rimStrengthLoc, 0.08);
    }
    else {
        gl.uniform4fv(lightPositionLoc, flatten(vec4(2.4, 4.8, 3.2, 0.0)));
        gl.uniform1f(ambientStrengthLoc, 0.32);
        gl.uniform1f(diffuseStrengthLoc, 0.74);
        gl.uniform1f(rimStrengthLoc, 0.035);
    }
}

function applySceneClearColor()
{
    var mode = nightMode ? "night" : "day";

    if (sceneClearMode === mode) {
        return;
    }

    sceneClearMode = mode;

    if (nightMode) {
        gl.clearColor(0.035, 0.055, 0.12, 1.0);
    }
    else {
        gl.clearColor(0.64, 0.82, 0.98, 1.0);
    }
}

function render()
{
    updateFrameScale();
    applySceneClearColor();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    applySceneLighting();

    updatePose();
    updateCreeper();
    updateExplosion();
    updateSteveFallDelay();
    updateNightCreeperSpawn();
    updateCameraModePopup();

    for (var i = 0; i < numNodes; i++) {
        initNodes(i);
    }

    var angle = radians(cameraYaw);
    var pitch = radians(cameraPitch);
    var forwardX = Math.sin(angle);
    var forwardZ = Math.cos(angle);
    var eye;
    var at;

    if (cameraMode === "cinematic") {
        var cineYaw = radians(cinematicYaw);
        var cinePitch = radians(cinematicPitch);
        var lookDistance = 8.0;
        var lookX = Math.sin(cineYaw) * Math.cos(cinePitch);
        var lookY = Math.sin(cinePitch);
        var lookZ = Math.cos(cineYaw) * Math.cos(cinePitch);

        eye = cinematicEye;
        at = vec3(eye[0] + lookX * lookDistance,
            eye[1] + lookY * lookDistance,
            eye[2] + lookZ * lookDistance);
    }
    else {
        var cameraDistance = 4.9;
        var cameraHeight = 0.85 + Math.sin(pitch) * cameraDistance;
        var groundDistance = Math.cos(pitch) * cameraDistance;
        eye = vec3(playerX - forwardX * groundDistance,
            cameraHeight,
            playerZ - forwardZ * groundDistance);
        at = vec3(playerX, 0.75, playerZ);
    }
    var up = vec3(0.0, 1.0, 0.0);

    modelViewMatrix = lookAt(eye, at, up);
    drawSkyDetails();
    drawGround();
    drawWorldBlocks();
    drawTree(8.0, -0.82, 6.4);

    if (creeperVisible) {
        creeperModel(creeperX, creeperY, creeperZ);
    }

    if (explosionActive) {
        drawExplosionEffect();
    }

    if (!targetBlock.broken) {
        diaBlock(targetBlock.x, targetBlock.y, targetBlock.z);
    }

    if (steveFallen) {
        hidePlayerNameTag();
    }
    else {
        updatePlayerNameTag(modelViewMatrix);
    }
    modelViewMatrix = mult(modelViewMatrix, translate(playerX, playerY, playerZ));
    if (steveFallen) {
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, -0.78, 0.0));
        modelViewMatrix = mult(modelViewMatrix, rotate(88.0, 0, 0, 1));
    }
    traverse(torsoId);

    requestAnimFrame(render);
}

function resizeCanvas()
{
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    canvasDisplayWidth = displayWidth;
    canvasDisplayHeight = displayHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        projectionMatrix = perspective(45.0, canvas.width / canvas.height, 0.1, 100.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    }
}

function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d)
{
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
}

function scale4(a, b, c)
{
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}


function grassTile(x, z)
{
    var y = -1.897;
    drawBlock(1.6, 1.594, 1.6, colors.brownSoil, x, y, z); 
    drawTopPatch(1.6, 1.6, colors.greenGrass, x, z, y+0.797); 

    drawTopPatch(0.2, 0.2, colors.greenLight, x+0.6, z-0.6, y+0.8); 
    drawTopPatch(0.2, 0.2, colors.greenLight, x, z+0.4, y+0.8); 
    drawTopPatch(0.2, 0.2, colors.greenLight, x-0.2, z+0.2, y+0.8); 
    drawTopPatch(0.2, 0.2, colors.greenLight, x-0.6, z-0.4, y+0.8); 

    drawTopPatch(0.2, 0.2, colors.greenDark, x+0.4, z, y+0.8); 
    drawTopPatch(0.2, 0.2, colors.greenDark, x-0.2, z-0.6, y+0.8); 
}

function drawGround()
{
    var tileCount = 18;
    var tileSize = 1.6;
    var groundStart = -0.5 * (tileCount - 1) * tileSize;

    for(var i=0; i<tileCount; i++) {
        for(var j=0; j<tileCount; j++) {
            grassTile(groundStart + i * tileSize, groundStart + j * tileSize);
        }
    }
}

function drawWorldBlocks()
{
    for (var i = 0; i < worldBlocks.length; i++) {
        if (!worldBlocks[i].broken) {
            grassBlock(worldBlocks[i].x, worldBlocks[i].y, worldBlocks[i].z);
        }
    }
}

function resetWorldBlocks()
{
    for (var i = 0; i < worldBlocks.length; i++) {
        worldBlocks[i].broken = false;
    }
}

function breakBlocksNearExplosion()
{
    var targetDx = targetBlock.x - explosionX;
    var targetDz = targetBlock.z - explosionZ;
    var targetDistance = Math.sqrt(targetDx * targetDx + targetDz * targetDz);

    if (targetDistance <= explosionBreakRadius) {
        targetBlock.broken = true;
    }

    for (var i = 0; i < worldBlocks.length; i++) {
        var explosionDx = worldBlocks[i].x - explosionX;
        var explosionDz = worldBlocks[i].z - explosionZ;
        var explosionDistance = Math.sqrt(explosionDx * explosionDx + explosionDz * explosionDz);

        if (explosionDistance <= explosionBreakRadius) {
            worldBlocks[i].broken = true;
        }
    }
}

function drawSkyDetails()
{
    cloudCluster(-5.8, 6.0, -10.8);
    cloudClusterLong(5.8, 6.4, -13.6);
    cloudCluster(10.4, 5.9, 3.4);
    cloudClusterLong(-12.2, 6.2, 7.2);

    if (nightMode) {
        drawBlock(0.9, 0.9, 0.08, colors.moon, -13.4, 8.3, -14.2);
        drawBlock(0.22, 0.22, 0.09, colors.moonLight, -13.55, 8.43, -14.14);
        drawBlock(0.18, 0.18, 0.09, colors.moonLight, -13.24, 8.20, -14.14);
        drawBlock(0.18, 0.18, 0.09, colors.moonDark, -13.66, 8.10, -14.14);
        drawBlock(0.16, 0.16, 0.09, colors.moonDark, -13.32, 8.56, -14.14);
    }
}

function cloudCluster(x, y, z)
{
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(x, y, z));

    var cloudColor = nightMode ? colors.cloudNight : colors.cloud;
    var shadowColor = nightMode ? colors.cloudNightShadow : colors.cloudShadow;

    drawBlock(1.55, 0.34, 0.72, cloudColor, 0.0, 0.0, 0.0);
    drawBlock(0.85, 0.32, 0.68, cloudColor, -1.05, 0.0, 0.0);
    drawBlock(0.95, 0.32, 0.68, cloudColor, 1.05, 0.0, 0.0);
    drawBlock(0.75, 0.34, 0.66, cloudColor, 0.15, 0.30, 0.0);
    drawBlock(1.25, 0.09, 0.56, shadowColor, 0.05, -0.22, 0.02);

    modelViewMatrix = stack.pop();
}

function cloudClusterLong(x, y, z)
{
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(x, y, z));

    var cloudColor = nightMode ? colors.cloudNight : colors.cloud;
    var shadowColor = nightMode ? colors.cloudNightShadow : colors.cloudShadow;

    drawBlock(1.95, 0.34, 0.78, cloudColor, 0.0, 0.0, 0.0);
    drawBlock(0.90, 0.32, 0.72, cloudColor, -1.15, 0.0, 0.0);
    drawBlock(0.90, 0.32, 0.72, cloudColor, 1.15, 0.0, 0.0);
    drawBlock(0.82, 0.34, 0.70, cloudColor, -0.40, 0.28, 0.0);
    drawBlock(0.82, 0.34, 0.70, cloudColor, 0.55, 0.24, 0.0);
    drawBlock(1.75, 0.09, 0.60, shadowColor, 0.0, -0.22, 0.02);

    modelViewMatrix = stack.pop();
}

function drawTree(x, y, z)
{
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(x, y, z));

    drawTreeTrunk();
    drawTreeLeaves();

    modelViewMatrix = stack.pop();
}

function drawTreeTrunk()
{
    drawBlock(0.82, 2.65, 0.82, colors.wood, 0.0, 1.32, 0.0);

    drawFrontPatch(0.18, 0.42, colors.woodLight, -0.22, 1.80, 0.41);
    drawFrontPatch(0.16, 0.34, colors.woodDark, 0.22, 0.82, 0.41);
    drawBackPatch(0.18, 0.38, colors.woodDark, -0.14, 1.18, 0.41);
    drawLeftPatch(0.36, 0.16, colors.woodLight, 1.36, -0.18, 0.41);
    drawRightPatch(0.34, 0.16, colors.woodDark, 0.58, 0.20, 0.41);
}

function drawTreeLeaves()
{
    drawBlock(2.25, 1.10, 2.25, colors.leaves, 0.0, 2.95, 0.0);
    drawBlock(1.75, 0.95, 1.75, colors.leavesLight, -0.28, 3.62, -0.16);
    drawBlock(1.55, 0.82, 1.55, colors.leaves, 0.34, 4.08, 0.22);
    drawBlock(0.92, 0.70, 0.92, colors.leavesDark, -1.02, 3.25, 0.34);
    drawBlock(0.88, 0.68, 0.88, colors.leavesDark, 1.05, 3.18, -0.26);
    drawBlock(0.76, 0.62, 0.76, colors.leavesLight, 0.16, 4.58, -0.04);
    drawBlock(0.95, 0.74, 0.95, colors.leaves, -0.78, 3.82, -0.72);
    drawBlock(0.90, 0.70, 0.90, colors.leavesLight, 0.82, 3.72, 0.72);
    drawBlock(0.72, 0.58, 0.72, colors.leavesDark, 0.12, 3.18, 1.12);
}


function grassBlock(x, y, z)
{
    stack.push(modelViewMatrix);

    modelViewMatrix =
        mult(modelViewMatrix,
             translate(x, y, z));

    drawBlock(1.594, 1.594, 1.594, colors.brownSoil, 0, 0, 0);
    drawTopPatch(1.6, 1.6, colors.greenGrass, 0, 0, 0.797); 

    drawTopPatch(0.2, 0.2, colors.greenLight, 0.6, -0.6, +0.8); 
    drawTopPatch(0.2, 0.2, colors.greenLight, 0, +0.4, +0.8); 
    drawTopPatch(0.2, 0.2, colors.greenLight, -0.2, +0.2, +0.8); 
    drawTopPatch(0.2, 0.2, colors.greenLight, -0.6, -0.4, +0.8); 
    
    drawTopPatch(0.2, 0.2, colors.greenDark, +0.4, 0, +0.8); 
    drawTopPatch(0.2, 0.2, colors.greenDark, +0.4, +0.3, +0.8);
    drawTopPatch(0.2, 0.2, colors.greenDark, -0.2, -0.6, +0.8);
    drawTopPatch(0.2, 0.2, colors.greenDark, -0.4, +0.6, +0.8);

    drawFrontPatch(1.6, 0.4, colors.greenGrass, 0, +0.603, +0.797);
    drawFrontPatch(0.2, 0.2, colors.greenGrass, -0.6, +0.2, +0.797);
    drawFrontPatch(0.2, 0.2, colors.greenGrass, +0.4, +0.2, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownGrey, +0.6, +0.2, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownGrey, -0.4, -0.6, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownLight, -0.4, 0, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownLight, 0, -0.2, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownLight, +0.4, -0.4, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownDark, -0.6, -0.4, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownDark, -0.2, +0.2, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownDark, +0.2, 0, +0.797);

    drawBackPatch(1.6, 0.4, colors.greenGrass, 0, +0.603, +0.797); 
    drawBackPatch(0.2, 0.2, colors.greenGrass, 0.6, +0.2, +0.797);
    drawBackPatch(0.2, 0.2, colors.greenGrass, -0.4, +0.2, +0.797);
    drawBackPatch(0.2, 0.2, colors.brownGrey, -0.6, +0.2, +0.797); 
    drawBackPatch(0.2, 0.2, colors.brownGrey, 0.4, -0.6, +0.797);
    drawBackPatch(0.2, 0.2, colors.brownLight, 0.4, 0, +0.797);
    drawBackPatch(0.2, 0.2, colors.brownLight, 0, -0.2, +0.797);
    drawBackPatch(0.2, 0.2, colors.brownLight, -0.4, -0.4, +0.797);
    drawBackPatch(0.2, 0.2, colors.brownDark, 0.6, -0.4, +0.797);
    drawBackPatch(0.2, 0.2, colors.brownDark, 0.2, +0.2, +0.797);
    drawBackPatch(0.2, 0.2, colors.brownDark, -0.2, 0, +0.797);

    drawLeftPatch(0.4, 1.6, colors.greenGrass, +0.603, 0, +0.797);
    drawLeftPatch(0.2, 0.2, colors.greenGrass, +0.2, -0.6, +0.797);
    drawLeftPatch(0.2, 0.2, colors.greenGrass, +0.2, +0.4, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownGrey, -0.6, -0.4, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownGrey, +0.2, +0.6, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownLight, 0, -0.4, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownLight, -0.2, 0, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownLight, -0.4, +0.4, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownDark, -0.4, -0.6, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownDark, +0.2, -0.2, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownDark, 0, +0.2, +0.797);
    
    drawRightPatch(0.4, 1.6, colors.greenGrass, +0.603, 0, +0.797); 
    drawRightPatch(0.2, 0.2, colors.greenGrass, +0.2, 0.6, +0.797);
    drawRightPatch(0.2, 0.2, colors.greenGrass, +0.2, -0.4, +0.797);
    drawRightPatch(0.2, 0.2, colors.brownGrey, -0.6, 0.4, +0.797);
    drawRightPatch(0.2, 0.2, colors.brownGrey, +0.2, -0.6, +0.797);
    drawRightPatch(0.2, 0.2, colors.brownLight, 0, 0.4, +0.797); 
    drawRightPatch(0.2, 0.2, colors.brownLight, -0.2, 0, +0.797);
    drawRightPatch(0.2, 0.2, colors.brownLight, -0.4, -0.4, +0.797);
    drawRightPatch(0.2, 0.2, colors.brownDark, -0.4, 0.6, +0.797);
    drawRightPatch(0.2, 0.2, colors.brownDark, +0.2, 0.2, +0.797);
    drawRightPatch(0.2, 0.2, colors.brownDark, 0, -0.2, +0.797);


    modelViewMatrix = stack.pop();
}

function diaBlock(x, y, z)
{
    stack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, translate(x, y, z));

    drawBlock(1.6, 1.597, 1.597, colors.brownGrey, 0, 0, 0);

    drawTopPatch(0.2, 0.2, colors.greyDark, -0.6, -0.6, 0.7985);
    drawTopPatch(0.2, 0.2, colors.greyDark, 0.4, -0.6, 0.7985);
    drawTopPatch(0.2, 0.2, colors.greyDark, 0.6, -0.2, 0.7985);
    drawTopPatch(0.2, 0.2, colors.greyDark, 0.6, 0, 0.7985);
    drawTopPatch(0.2, 0.2, colors.greyDark, -0.4, 0.2, 0.7985);
    drawTopPatch(0.2, 0.2, colors.greyDark, -0.2, 0.6, 0.7985);
    drawTopPatch(0.2, 0.2, colors.blueLight, 0, -0.6, 0.7985);
    drawTopPatch(0.2, 0.2, colors.blueLight, 0.4, 0.6, 0.7985);
    drawTopPatch(0.2, 0.2, colors.blueDia, 0.2, -0.6, 0.7985);
    drawTopPatch(0.2, 0.2, colors.blueDia, 0.4, -0.4, 0.7985);
    drawTopPatch(0.2, 0.2, colors.blueDia, 0, 0, 0.7985);
    drawTopPatch(0.2, 0.2, colors.blueDia, -0.6, 0.2, 0.7985);
    drawTopPatch(0.2, 0.2, colors.blueDia, 0.2, 0.6, 0.7985);
    drawTopPatch(0.2, 0.2, colors.blueDark, 0.2, -0.4, 0.7985);
    drawTopPatch(0.2, 0.2, colors.blueDark, -0.6, 0, 0.7985);
    drawTopPatch(0.2, 0.2, colors.blueDark, -0.4, 0, 0.7985);
    drawTopPatch(0.2, 0.2, colors.blueDark, 0.4, 0.4, 0.7985);
    drawTopPatch(0.2, 0.2, colors.blueDark, 0.6, 0.6, 0.7985);

    drawFrontPatch(0.2, 0.2, colors.greyDark, -0.6, 0.6, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.greyDark, 0.4, 0.6, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.greyDark, 0.6, 0.2, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.greyDark, 0.6, 0, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.greyDark, -0.4, -0.2, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.greyDark, -0.2, -0.6, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.blueLight, 0, 0.6, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.blueLight, 0.4, -0.6, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.blueDia, 0.2, 0.6, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.blueDia, 0.4, 0.4, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.blueDia, 0, 0, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.blueDia, -0.6, -0.2, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.blueDia, 0.2, -0.6, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.blueDark, 0.2, 0.4, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.blueDark, -0.6, 0, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.blueDark, -0.4, 0, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.blueDark, 0.4, -0.4, 0.7985);
    drawFrontPatch(0.2, 0.2, colors.blueDark, 0.6, -0.6, 0.7985);

    drawBlockCracks(targetBlock.hits);

    modelViewMatrix = stack.pop();
}

function drawBlockCracks(hits)
{
    if (hits <= 0) {
        return;
    }

    var stage = Math.min(4, Math.ceil(hits / 2));
    var z = 0.803;
    var topY = 0.803;

    drawFrontPatch(0.055, 0.42, colors.crack, -0.08, 0.12, z);
    drawFrontPatch(0.34, 0.055, colors.crack, 0.10, 0.27, z);

    if (stage >= 2) {
        drawFrontPatch(0.055, 0.30, colors.crack, 0.30, 0.05, z);
        drawFrontPatch(0.30, 0.055, colors.crack, -0.23, -0.12, z);
        drawTopPatch(0.055, 0.42, colors.crack, -0.10, 0.12, topY);
    }

    if (stage >= 3) {
        drawFrontPatch(0.055, 0.28, colors.crack, -0.36, -0.27, z);
        drawFrontPatch(0.28, 0.055, colors.crack, 0.40, -0.20, z);
        drawTopPatch(0.34, 0.055, colors.crack, 0.18, 0.30, topY);
        drawTopPatch(0.055, 0.28, colors.crack, 0.36, -0.18, topY);
    }

    if (stage >= 4) {
        drawFrontPatch(0.42, 0.055, colors.crack, -0.03, -0.43, z);
        drawFrontPatch(0.055, 0.24, colors.crack, 0.55, 0.34, z);
        drawTopPatch(0.28, 0.055, colors.crack, -0.36, -0.32, topY);
        drawTopPatch(0.055, 0.24, colors.crack, 0.56, 0.44, topY);
    }
}

function spawnCreeper()
{
    creeperVisible = true;
    creeperX = -16.0;
    creeperY = 1.54;
    creeperZ = 16.0;
    creeperYaw = 0.0;
    creeperFuseActive = false;
    creeperFuseFrame = 0.0;
    explosionActive = false;
    explosionFrame = 0.0;
    steveFallen = false;
    delayedExplosionBreakPending = false;
    endingTriggered = false;
}

function creeperModel(x, y, z)
{
    stack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, translate(x, y, z));
    modelViewMatrix = mult(modelViewMatrix, rotateY(creeperYaw * 180.0 / Math.PI + 180.0));

    var blink = creeperFuseActive && Math.floor(creeperFuseFrame / 6.0) % 2 === 0;
    var bodyColor = blink ? colors.creeperFlash : colors.creeperGreen;

    drawBlock(0.96, 0.96, 0.96, bodyColor, 0, 0, 0);
    drawBlock(0.96, 1.44, 0.48, bodyColor, 0, -1.2, 0);
    drawBlock(0.96, 0.72, 0.48, bodyColor, 0, -2.28, 0.48);
    drawBlock(0.96, 0.72, 0.48, bodyColor, 0, -2.28, -0.48);

    drawBackPatch(0.24, 0.24, colors.black, -0.24, 0.12, 0.48);
    drawBackPatch(0.24, 0.24, colors.black, 0.24, 0.12, 0.48);
    drawBackPatch(0.24, 0.24, colors.black, 0, -0.24, 0.48);

    modelViewMatrix = stack.pop();
}

function updateCreeper()
{
    if (!creeperVisible || endingTriggered || gameState !== "playing") {
        return;
    }

    var dx = playerX - creeperX;
    var dz = playerZ - creeperZ;
    var dist = Math.sqrt(dx * dx + dz * dz);

    if (creeperFuseActive) {
        creeperFuseFrame += frameScale;

        if (dist > 3.4) {
            creeperFuseActive = false;
            creeperFuseFrame = 0.0;
            stopSound("creeperFuse");
        }
        else if (creeperFuseFrame >= CREEPER_FUSE_DURATION) {
            triggerCreeperExplosion();
        }
        return;
    }

    if (dist > 0.001) {
        creeperYaw = Math.atan2(dx, dz);
        creeperX += dx / dist * creeperSpeed * frameScale;
        creeperZ += dz / dist * creeperSpeed * frameScale;
    }

    if (dist < 2.5) {
        creeperFuseActive = true;
        creeperFuseFrame = 0.0;
        playLoopingSound("creeperFuse");
    }
}

function triggerCreeperExplosion()
{
    stopSound("creeperFuse");
    stopSound("walk");
    playSound("creeperExplosion");
    endingTriggered = true;
    creeperVisible = false;
    creeperFuseActive = false;
    explosionActive = true;
    explosionFrame = 0.0;
    explosionX = creeperX;
    explosionY = 0.55;
    explosionZ = creeperZ;
    steveFallDelayFrame = STEVE_FALL_DELAY;
    delayedExplosionBreakPending = true;
    keys = {};
    armSwingHeld = false;

    if (document.exitPointerLock && document.pointerLockElement === canvas) {
        document.exitPointerLock();
    }
}

function updateSteveFallDelay()
{
    if (steveFallen || steveFallDelayFrame <= 0.0) {
        return;
    }

    steveFallDelayFrame -= frameScale;

    if (steveFallDelayFrame <= 0.0) {
        steveFallen = true;
        if (delayedExplosionBreakPending) {
            breakBlocksNearExplosion();
            delayedExplosionBreakPending = false;
        }
    }
}

function updateExplosion()
{
    if (!explosionActive) {
        return;
    }

    explosionFrame += frameScale;

    if (explosionFrame >= EXPLOSION_DURATION) {
        explosionActive = false;
        explosionFrame = 0.0;
    }
}

function drawExplosionEffect()
{
    var t = explosionFrame / EXPLOSION_DURATION;
    var pulse = 1.0 + t * 1.25;

    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(explosionX, explosionY, explosionZ));

    drawBlock(0.95 * pulse, 0.95 * pulse, 0.95 * pulse, colors.explosionWhite, 0.0, 0.08, 0.0);
    drawBlock(0.80 * pulse, 0.80 * pulse, 0.80 * pulse, colors.explosionSmoke, -0.48 * pulse, 0.18 * pulse, 0.02);
    drawBlock(0.78 * pulse, 0.78 * pulse, 0.78 * pulse, colors.explosionSmoke, 0.48 * pulse, 0.12 * pulse, -0.02);
    drawBlock(0.70 * pulse, 0.70 * pulse, 0.70 * pulse, colors.explosionWhite, 0.0, 0.50 * pulse, 0.0);
    drawBlock(0.72 * pulse, 0.72 * pulse, 0.72 * pulse, colors.explosionSmoke, 0.0, 0.08 * pulse, 0.50 * pulse);

    modelViewMatrix = stack.pop();
}
