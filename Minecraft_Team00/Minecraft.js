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
var CROUCH_JOINT_OVERLAP = 0.05;
var CROUCH_HIP_OVERLAP = 0.06;
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
var bodyRotation = 180.0;
var crouchAmount = 0.0;
var bodyBounce = 0.0;
var bodyPitch = 0.0;
var bodyShiftZ = 0.0;
var playerX = 0.0;
var playerZ = 0.0;
var moveSpeed = 0.055;
var moving = false;
var keys = {};
var cameraYaw = 180.0;
var cameraPitch = 18.0;
var cinematicEye = vec3(5.0, 2.8, 6.2);
var cinematicYaw = -140.0;
var cinematicPitch = -16.0;
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
var showPlayerNameTag = true;

// 색상만 요청하신 사항에 맞춰 수정되었습니다.
var colors = {
    skin: vec4(0.63, 0.46, 0.36, 1.0),
    skinLight: vec4(0.72, 0.53, 0.42, 1.0),
    skinDark: vec4(0.48, 0.32, 0.25, 1.0),
    hair: vec4(0.15, 0.09, 0.03, 1.0),
    hairLight: vec4(0.26, 0.15, 0.06, 1.0),
    beard: vec4(0.18, 0.10, 0.04, 1.0), // 진한 갈색
    shirt: vec4(0.00, 0.62, 0.65, 1.0),
    shirtLight: vec4(0.04, 0.72, 0.73, 1.0),
    shirtDark: vec4(0.00, 0.46, 0.50, 1.0),
    pants: vec4(0.22, 0.19, 0.66, 1.0),
    pantsLight: vec4(0.28, 0.25, 0.76, 1.0),
    pantsDark: vec4(0.13, 0.12, 0.46, 1.0),
    shoe: vec4(0.19, 0.19, 0.20, 1.0),
    eyeWhite: vec4(0.88, 0.90, 0.94, 1.0),
    eyeBlue: vec4(0.35, 0.25, 0.65, 1.0), // 파란색에 가까운 보라색
    mouth: vec4(0.70, 0.45, 0.40, 1.0), // 핑크색과 갈색 사이
    nose: vec4(0.55, 0.38, 0.28, 1.0), // 코를 위한 연한 갈색 추가

    greenGrass: vec4(0.30, 0.44, 0.26, 1.0),
    greenLight: vec4(0.34, 0.50, 0.30, 1.0),
    greenDark: vec4(0.23, 0.37, 0.19, 1.0),

    brownGrey: vec4(0.31, 0.32, 0.33, 1.0),
    brownLight: vec4(0.42, 0.3, 0.23, 1.0),
    brownSoil: vec4(0.30, 0.20, 0.13, 1.0),
    brownDark: vec4(0.22, 0.14, 0.09, 1.0)
};

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

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    for (var i = 0; i < numNodes; i++) {
        theta[i] = 0.0;
        figure[i] = createNode(null, null, null, null);
    }

    colorCube();

    gl.clearColor(0.68, 0.83, 0.96, 1.0);
    gl.enable(gl.DEPTH_TEST);

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

    resizeCanvas();
    gl.uniform4fv(lightPositionLoc, flatten(vec4(2.0, 4.0, 3.0, 0.0)));
    window.addEventListener("resize", resizeCanvas);

    document.getElementById("WalkButton").onclick = function () {
        walking = !walking;
    };

    document.getElementById("CrouchButton").onclick = function () {
        crouching = !crouching;
    };

    document.getElementById("RotateButton").onclick = function () {
        autoRotate = !autoRotate;
    };

    document.getElementById("CameraModeButton").onclick = function () {
        toggleCameraMode();
    };

    document.getElementById("CineLeftButton").onclick = function () {
        cinematicYaw -= 10.0;
    };

    document.getElementById("CineRightButton").onclick = function () {
        cinematicYaw += 10.0;
    };

    document.getElementById("CineUpButton").onclick = function () {
        cinematicPitch = Math.min(20.0, cinematicPitch + 6.0);
    };

    document.getElementById("CineDownButton").onclick = function () {
        cinematicPitch = Math.max(-45.0, cinematicPitch - 6.0);
    };

    document.getElementById("CineResetButton").onclick = function () {
        cinematicYaw = -140.0;
        cinematicPitch = -16.0;
    };

    document.getElementById("ResetButton").onclick = function () {
        resetPose();
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

    document.getElementById("QuitButton").onclick = function () {
        document.getElementById("MenuMessage").textContent =
            "Quit Game is disabled in browser mode.";
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

    document.getElementById("OptionResetButton").onclick = function () {
        resetPose();
        gameState = "options";
        keys = {};
        document.getElementById("OptionsMessage").textContent =
            "Pose and start position reset.";
    };

    document.getElementById("OptionBackButton").onclick = function () {
        closeOptions();
    };

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

        if (gameState !== "playing") {
            if (isGameKey(event.code)) {
                event.preventDefault();
            }
            return;
        }

        keys[event.code] = true;

        if (event.code === "Space") {
            if (!event.repeat) {
                paused = !paused;
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
            event.code === "Space") {
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

    window.addEventListener("mouseup", function () {
        mouseDragging = false;
    });

    window.addEventListener("mousemove", function (event) {
        var pointerLocked = (document.pointerLockElement === canvas);

        if (gameState !== "playing" || cameraMode !== "third" ||
            (!mouseOverCanvas && !mouseDragging && !pointerLocked)) {
            return;
        }

        var dx = pointerLocked ? event.movementX :
            (lastMouseX === 0 ? 0 : event.clientX - lastMouseX);
        var dy = pointerLocked ? event.movementY :
            (lastMouseY === 0 ? 0 : event.clientY - lastMouseY);
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

        cameraYaw -= dx * mouseSensitivity;
        cameraPitch -= dy * mouseSensitivity;
        cameraPitch = Math.max(-8.0, Math.min(42.0, cameraPitch));
    });

    render();
};

function isGameKey(code)
{
    return code === "KeyW" || code === "KeyA" ||
        code === "KeyS" || code === "KeyD" ||
        code === "ArrowLeft" || code === "ArrowRight" ||
        code === "Space" || code === "ShiftLeft" || code === "ShiftRight";
}

function startGame()
{
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

    if (document.exitPointerLock && document.pointerLockElement === canvas) {
        document.exitPointerLock();
    }

    document.getElementById("MainMenu").style.display = "none";
    document.getElementById("OptionsMenu").style.display = "flex";
    document.getElementById("OptionBackButton").textContent =
        returnState === "menu" ? "Back to Menu" : "Back to Game";
    syncCameraModeButtons();
    syncNameTagButton();
}

function closeOptions()
{
    gameState = optionReturnState;
    keys = {};
    document.getElementById("OptionsMenu").style.display = "none";

    if (gameState === "menu") {
        document.getElementById("MainMenu").style.display = "flex";
    }
}

function toggleCameraMode()
{
    cameraMode = (cameraMode === "third") ? "cinematic" : "third";
    syncCameraModeButtons();
}

function syncCameraModeButtons()
{
    var label = cameraMode === "third" ?
        "Camera Mode: Third Person" : "Camera Mode: Cinematic";
    document.getElementById("CameraModeButton").textContent = label;
    document.getElementById("OptionCameraButton").textContent = label;
}

function syncNameTagButton()
{
    document.getElementById("OptionNameTagButton").textContent =
        showPlayerNameTag ? "Name Tag: On" : "Name Tag: Off";
}

function updatePlayerNameTag(viewMatrix)
{
    if (gameState !== "playing" || !showPlayerNameTag) {
        playerNameTag.style.display = "none";
        return;
    }

    var headTop = vec4(playerX, TORSO_HEIGHT + HEAD_HEIGHT + 0.20, playerZ, 1.0);
    var eyePoint = mult(viewMatrix, headTop);
    var clipPoint = mult(projectionMatrix, eyePoint);

    if (clipPoint[3] <= 0.0) {
        playerNameTag.style.display = "none";
        return;
    }

    var ndcX = clipPoint[0] / clipPoint[3];
    var ndcY = clipPoint[1] / clipPoint[3];

    if (ndcX < -1.2 || ndcX > 1.2 || ndcY < -1.2 || ndcY > 1.2) {
        playerNameTag.style.display = "none";
        return;
    }

    playerNameTag.style.display = "block";
    playerNameTag.style.left = ((ndcX * 0.5 + 0.5) * canvas.clientWidth) + "px";
    playerNameTag.style.top = ((-ndcY * 0.5 + 0.5) * canvas.clientHeight) + "px";
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
        m = translate(-LEG_WIDTH * 0.52, crouching ? CROUCH_HIP_OVERLAP : 0.0, 0.0);
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
        m = translate(LEG_WIDTH * 0.52, crouching ? CROUCH_HIP_OVERLAP : 0.0, 0.0);
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

// 아래의 토르소, 팔, 다리는 올려주신 원본 코드와 100% 동일하게 복구했습니다.
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

    // 1. 머리카락: 이마를 더 덮도록 높이를 조절하여 탈모 방지
    drawTopPatch(HEAD_WIDTH, HEAD_DEPTH, colors.hair,
        0.0, 0.0, HEAD_HEIGHT);
    drawFrontPatch(HEAD_WIDTH, 0.24, colors.hair, // 앞머리 길이를 늘려 이마를 덮음
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

    // 2 & 3. 눈: 위치를 코에 가깝게 내림 (eyeY = 0.32), 보라색에 가까운 파란색 적용
    var eyeY = 0.32;
    drawFrontPatch(0.09, 0.09, colors.eyeWhite,
        -0.22, eyeY, 0.5 * HEAD_DEPTH);
    drawFrontPatch(0.09, 0.09, colors.eyeBlue,
        -0.13, eyeY, 0.5 * HEAD_DEPTH);
    drawFrontPatch(0.09, 0.09, colors.eyeBlue,
        0.13, eyeY, 0.5 * HEAD_DEPTH);
    drawFrontPatch(0.09, 0.09, colors.eyeWhite,
        0.22, eyeY, 0.5 * HEAD_DEPTH);

    // 4. 코: 연한 갈색으로 눈 바로 아래에 배치
    drawFrontPatch(0.18, 0.09, colors.nose,
        0.0, 0.23, 0.5 * HEAD_DEPTH);

    // 입: 핑크색과 갈색 사이 (코 바로 아래)
    drawFrontPatch(0.18, 0.09, colors.mouth,
        0.0, 0.14, 0.5 * HEAD_DEPTH);

    // 수염: 진한 갈색 (입 양옆과 아랫부분)
    drawFrontPatch(0.09, 0.09, colors.beard,
        -0.135, 0.14, 0.5 * HEAD_DEPTH); // 왼쪽 입가 수염
    drawFrontPatch(0.09, 0.09, colors.beard,
        0.135, 0.14, 0.5 * HEAD_DEPTH);  // 오른쪽 입가 수염
    drawFrontPatch(0.36, 0.09, colors.beard,
        0.0, 0.05, 0.5 * HEAD_DEPTH);    // 턱수염
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
    gl.uniform4fv(colorLoc, flatten(color));
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

// 애니메이션 로직 원본 100% 유지
function updatePose()
{
    if (!paused) {
        time += 0.035;
        updateMovement();

        if (autoRotate) {
            cameraYaw += 0.25;
        }
    }

    theta[torsoId] = bodyRotation;
    theta[headId] = 4.0 * Math.sin(time * 1.5);
    theta[leftFootId] = 0.0;
    theta[rightFootId] = 0.0;
    bodyBounce = 0.0;
    bodyPitch = 0.0;
    bodyShiftZ = 0.0;

    if (walking && moving) {
        var phase = time * 3.95;
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
        crouchAmount = 0.34;
        bodyShiftZ = -0.22;
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
}

function resetPose()
{
    time = 0.0;
    bodyRotation = 180.0;
    cameraYaw = 180.0;
    cameraPitch = 18.0;
    cinematicYaw = -140.0;
    cinematicPitch = -16.0;
    cameraMode = "third";
    syncCameraModeButtons();
    playerX = 0.0;
    playerZ = 0.0;
    moving = false;
    walking = true;
    crouching = false;
    autoRotate = false;
    paused = false;
}

function updateMovement()
{
    if (gameState !== "playing") {
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
        bodyRotation = normalizeAngle(bodyRotation + x * z * 2.2);
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
    playerX += moveX * speed;
    playerZ += moveZ * speed;
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

function render()
{
    resizeCanvas();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    updatePose();

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
    drawGround();
    grassBlock(0, -0.294, -3.2);
    updatePlayerNameTag(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(playerX, 0.0, playerZ));
    traverse(torsoId);

    requestAnimFrame(render);
}

function resizeCanvas()
{
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

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
    drawBlock(1.6, 1.594, 1.6, colors.brownSoil, x, y, z); // 흙 블록
    drawTopPatch(1.6, 1.6, colors.greenGrass, x, z, y+0.797); // 기본 초록

    drawTopPatch(0.2, 0.2, colors.greenLight, x+0.6, z-0.6, y+0.8); // 초록 무늬
    drawTopPatch(0.2, 0.2, colors.greenLight, x, z+0.4, y+0.8); // 초록 무늬
    drawTopPatch(0.2, 0.2, colors.greenLight, x-0.2, z+0.2, y+0.8); // 초록 무늬
    drawTopPatch(0.2, 0.2, colors.greenLight, x-0.6, z-0.4, y+0.8); // 초록 무늬
    
    drawTopPatch(0.2, 0.2, colors.greenDark, x+0.4, z, y+0.8); // 초록 무늬
    drawTopPatch(0.2, 0.2, colors.greenDark, x+0.4, z+0.3, y+0.8); // 초록 무늬
    drawTopPatch(0.2, 0.2, colors.greenDark, x-0.2, z-0.6, y+0.8); // 초록 무늬
    drawTopPatch(0.2, 0.2, colors.greenDark, x-0.4, z+0.6, y+0.8); // 초록 무늬
    // width, depth, color, x, z, y
}

function drawGround()
{
    for(var x=-8; x<=8; x+=1.6)
         for(var z=-8; z<=8; z+=1.6) grassTile(x, z);
}


function grassBlock(x, y, z)
{
    stack.push(modelViewMatrix);

    modelViewMatrix =
        mult(modelViewMatrix,
             translate(x, y, z));


    // 여기부터는 모두 로컬 좌표
    drawBlock(1.594, 1.594, 1.594, colors.brownSoil, 0, 0, 0);
    drawTopPatch(1.6, 1.6, colors.greenGrass, 0, 0, 0.797); // 기본 초록

    drawTopPatch(0.2, 0.2, colors.greenLight, 0.6, -0.6, +0.8); // 초록 무늬
    drawTopPatch(0.2, 0.2, colors.greenLight, 0, +0.4, +0.8); // 초록 무늬
    drawTopPatch(0.2, 0.2, colors.greenLight, -0.2, +0.2, +0.8); // 초록 무늬
    drawTopPatch(0.2, 0.2, colors.greenLight, -0.6, -0.4, +0.8); // 초록 무늬
    
    drawTopPatch(0.2, 0.2, colors.greenDark, +0.4, 0, +0.8); // 초록 무늬
    drawTopPatch(0.2, 0.2, colors.greenDark, +0.4, +0.3, +0.8); // 초록 무늬
    drawTopPatch(0.2, 0.2, colors.greenDark, -0.2, -0.6, +0.8); // 초록 무늬
    drawTopPatch(0.2, 0.2, colors.greenDark, -0.4, +0.6, +0.8); // 초록 무늬


    // 스티브 정면
    drawFrontPatch(1.6, 0.4, colors.greenGrass, 0, +0.603, +0.797); // 옆면초록
    drawFrontPatch(0.2, 0.2, colors.greenGrass, -0.6, +0.2, +0.797);
    drawFrontPatch(0.2, 0.2, colors.greenGrass, +0.4, +0.2, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownGrey, +0.6, +0.2, +0.797); // 옆면회색
    drawFrontPatch(0.2, 0.2, colors.brownGrey, -0.4, -0.6, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownLight, -0.4, 0, +0.797); // 옆면-연갈색
    drawFrontPatch(0.2, 0.2, colors.brownLight, 0, -0.2, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownLight, +0.4, -0.4, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownDark, -0.6, -0.4, +0.797); // 옆면-진갈색
    drawFrontPatch(0.2, 0.2, colors.brownDark, -0.2, +0.2, +0.797);
    drawFrontPatch(0.2, 0.2, colors.brownDark, +0.2, 0, +0.797);
    //drawFrontPatch(0.2, 0.2, colors.eyeWhite, +0.2, +0.2, +0.797);

    drawBackPatch(1.6, 0.4, colors.greenGrass, 0, +0.603, +0.797); // 옆면초록
    drawBackPatch(0.2, 0.2, colors.greenGrass, 0.6, +0.2, +0.797);
    drawBackPatch(0.2, 0.2, colors.greenGrass, -0.4, +0.2, +0.797);
    drawBackPatch(0.2, 0.2, colors.brownGrey, -0.6, +0.2, +0.797); // 옆면회색
    drawBackPatch(0.2, 0.2, colors.brownGrey, 0.4, -0.6, +0.797);
    drawBackPatch(0.2, 0.2, colors.brownLight, 0.4, 0, +0.797); // 옆면-연갈색
    drawBackPatch(0.2, 0.2, colors.brownLight, 0, -0.2, +0.797);
    drawBackPatch(0.2, 0.2, colors.brownLight, -0.4, -0.4, +0.797);
    drawBackPatch(0.2, 0.2, colors.brownDark, 0.6, -0.4, +0.797); // 옆면-진갈색
    drawBackPatch(0.2, 0.2, colors.brownDark, 0.2, +0.2, +0.797);
    drawBackPatch(0.2, 0.2, colors.brownDark, -0.2, 0, +0.797);


    //스티브 왼팔쪽
    drawLeftPatch(0.4, 1.6, colors.greenGrass, +0.603, 0, +0.797); // 옆면초록
    drawLeftPatch(0.2, 0.2, colors.greenGrass, +0.2, -0.6, +0.797);
    drawLeftPatch(0.2, 0.2, colors.greenGrass, +0.2, +0.4, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownGrey, -0.6, -0.4, +0.797); // 옆면회색
    drawLeftPatch(0.2, 0.2, colors.brownGrey, +0.2, +0.6, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownLight, 0, -0.4, +0.797); // 옆면-연갈색
    drawLeftPatch(0.2, 0.2, colors.brownLight, -0.2, 0, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownLight, -0.4, +0.4, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownDark, -0.4, -0.6, +0.797); // 옆면-진갈색
    drawLeftPatch(0.2, 0.2, colors.brownDark, +0.2, -0.2, +0.797);
    drawLeftPatch(0.2, 0.2, colors.brownDark, 0, +0.2, +0.797);
    //drawLeftPatch(0.2, 0.2, colors.eyeBlue, +0.2, +0.2, +0.797);
    
    drawRightPatch(0.4, 1.6, colors.greenGrass, +0.603, 0, +0.797); // 옆면초록
    drawRightPatch(0.2, 0.2, colors.greenGrass, +0.2, 0.6, +0.797);
    drawRightPatch(0.2, 0.2, colors.greenGrass, +0.2, -0.4, +0.797);
    drawRightPatch(0.2, 0.2, colors.brownGrey, -0.6, 0.4, +0.797); // 옆면회색
    drawRightPatch(0.2, 0.2, colors.brownGrey, +0.2, -0.6, +0.797);
    drawRightPatch(0.2, 0.2, colors.brownLight, 0, 0.4, +0.797); // 옆면-연갈색
    drawRightPatch(0.2, 0.2, colors.brownLight, -0.2, 0, +0.797);
    drawRightPatch(0.2, 0.2, colors.brownLight, -0.4, -0.4, +0.797);
    drawRightPatch(0.2, 0.2, colors.brownDark, -0.4, 0.6, +0.797); // 옆면-진갈색
    drawRightPatch(0.2, 0.2, colors.brownDark, +0.2, 0.2, +0.797);
    drawRightPatch(0.2, 0.2, colors.brownDark, 0, -0.2, +0.797);
    drawRightPatch(0.2, 0.2, colors.eyeBlue, +0.2, -0.2, +0.797);


    modelViewMatrix = stack.pop();
}
