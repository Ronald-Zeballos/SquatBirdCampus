const assets = {
  menuBackground: "MenuInicio.png",
  gameplayBackground: "sky-gameplay-generated-v1.png",
  birds: [
    {
      id: "owl-2",
      name: "Nibu",
      flavor: "Vuelo noble, control relajado y margen amplio para empezar.",
      flight: "Suave",
      sensitivity: "Alta",
      sprite: "buho 2.png",
      liftBoost: 1.08,
      size: 146
    },
    {
      id: "toucan",
      name: "Tucan",
      flavor: "Sube un poco mas rapido, pero sigue siendo amigable.",
      flight: "Agil",
      sensitivity: "Alta",
      sprite: "tucan.png",
      liftBoost: 1.12,
      size: 140
    },
    {
      id: "peacock",
      name: "Pavo Real",
      flavor: "Mas presencia en pantalla y vuelo sereno para ritmos lentos.",
      flight: "Estable",
      sensitivity: "Media-Alta",
      sprite: "pavo real.png",
      liftBoost: 1,
      size: 154
    }
  ]
};

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

const HAND_CONFIDENCE_FLOOR = 0.26;
const HAND_UPWARD_SPEED = 0.1;
const HAND_DOWNWARD_SPEED = 0.3;
const HAND_START_THRESHOLD = 0.14;
const HAND_LIFT_RISE = 0.56;
const HAND_LIFT_FALL = 0.2;
const HAND_DROP_SMOOTH = 0.2;
const HAND_LANE_POINTS = [0, 5, 9, 13, 17, 8, 12, 16, 20];
const HAND_LANES = {
  left: {
    side: "left",
    xMin: 0.02,
    xMax: 0.36,
    yMin: 0.06,
    yMax: 0.94
  },
  right: {
    side: "right",
    xMin: 0.64,
    xMax: 0.98,
    yMin: 0.06,
    yMax: 0.94
  }
};
const HAND_LANE_COVERAGE_FLOOR = 0.34;
const HAND_MIN_TRAVEL = 0.014;
const ADAPTATION_DURATION = 10;
const SOFT_TOP_LIMIT = 68;
const SOFT_BOTTOM_MARGIN = 122;
const TRACKING_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const TRACKING_WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const TRACKING_BUNDLE_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs";
const PLAYER_NAME_STORAGE_KEY = "squat-bird-campus-player-name";
const LEADERBOARD_STORAGE_KEY = "squat-bird-campus-leaderboard";
const LEADERBOARD_LIMIT = 8;
const GAME_OVER_LEADERBOARD_LIMIT = 5;

const dom = {
  menuScreen: document.getElementById("menuScreen"),
  gameScreen: document.getElementById("gameScreen"),
  menuBackdrop: document.getElementById("menuBackdrop"),
  playButton: document.getElementById("playButton"),
  howItWorksButton: document.getElementById("howItWorksButton"),
  playerNameInput: document.getElementById("playerNameInput"),
  playerNameError: document.getElementById("playerNameError"),
  leaderboardList: document.getElementById("leaderboardList"),
  leaderboardEmpty: document.getElementById("leaderboardEmpty"),
  prevCharacterButton: document.getElementById("prevCharacterButton"),
  nextCharacterButton: document.getElementById("nextCharacterButton"),
  characterPreview: document.getElementById("characterPreview"),
  characterName: document.getElementById("characterName"),
  characterFlavor: document.getElementById("characterFlavor"),
  flightStat: document.getElementById("flightStat"),
  sensitivityStat: document.getElementById("sensitivityStat"),
  difficultyBadge: document.getElementById("difficultyBadge"),
  characterDots: document.getElementById("characterDots"),
  gameCharacterName: document.getElementById("gameCharacterName"),
  currentPlayerLabel: document.getElementById("currentPlayerLabel"),
  scoreValue: document.getElementById("scoreValue"),
  highScoreValue: document.getElementById("highScoreValue"),
  difficultyValue: document.getElementById("difficultyValue"),
  gameStateLabel: document.getElementById("gameStateLabel"),
  startOverlay: document.getElementById("startOverlay"),
  startOverlayEyebrow: document.getElementById("startOverlayEyebrow"),
  startOverlayTitle: document.getElementById("startOverlayTitle"),
  startOverlayBody: document.getElementById("startOverlayBody"),
  gameOverOverlay: document.getElementById("gameOverOverlay"),
  gameOverTitle: document.getElementById("gameOverTitle"),
  gameOverSummary: document.getElementById("gameOverSummary"),
  gameOverLeaderboardList: document.getElementById("gameOverLeaderboardList"),
  gameOverLeaderboardEmpty: document.getElementById("gameOverLeaderboardEmpty"),
  restartButton: document.getElementById("restartButton"),
  overlayMenuButton: document.getElementById("overlayMenuButton"),
  backToMenuButton: document.getElementById("backToMenuButton"),
  webcamVideo: document.getElementById("webcamVideo"),
  handOverlayCanvas: document.getElementById("handOverlayCanvas"),
  cameraStatus: document.getElementById("cameraStatus"),
  cameraHint: document.getElementById("cameraHint"),
  leftHandValue: document.getElementById("leftHandValue"),
  rightHandValue: document.getElementById("rightHandValue"),
  liftValue: document.getElementById("liftValue"),
  leftHandFill: document.getElementById("leftHandFill"),
  rightHandFill: document.getElementById("rightHandFill"),
  liftFill: document.getElementById("liftFill"),
  leftHandZone: document.getElementById("leftHandZone"),
  rightHandZone: document.getElementById("rightHandZone"),
  gameCanvas: document.getElementById("gameCanvas")
};

const ctx = dom.gameCanvas.getContext("2d");
const handOverlayCtx = dom.handOverlayCanvas.getContext("2d");
const imageCache = new Map();
const initialLeaderboard = loadLeaderboard();
const initialPlayerName = loadStoredPlayerName();

const state = {
  selectedBirdIndex: 0,
  stream: null,
  animationId: 0,
  leaderboard: initialLeaderboard,
  currentPlayerName: initialPlayerName,
  highScore: getHighScoreFromLeaderboard(initialLeaderboard),
  handTracking: {
    loading: false,
    ready: false,
    error: "",
    landmarker: null,
    lastVideoTime: -1,
    lastResults: null,
    lastDetections: []
  },
  control: {
    left: createHandState(),
    right: createHandState(),
    targetNormalized: 0.52,
    trackingStrength: 0,
    activeHands: 0,
    lift: 0,
    drop: 0
  },
  game: createGameState()
};

function createHandState() {
  return {
    energy: 0,
    velocity: 0,
    movement: 0,
    verticalControl: 0.52,
    liftIntent: 0,
    dropIntent: 0,
    centroidX: null,
    centroidY: null,
    confidence: 0,
    laneCoverage: 0,
    lastTime: 0,
    active: false
  };
}

function createGameState() {
  return {
    width: dom.gameCanvas.width,
    height: dom.gameCanvas.height,
    ready: true,
    started: false,
    adapting: true,
    adaptationRemaining: ADAPTATION_DURATION,
    over: false,
    gameOverShown: false,
    scoreCommitted: false,
    finalRank: null,
    elapsed: 0,
    difficultyFactor: 1,
    defeatTimer: 0,
    defeatFlash: 0,
    crashParticles: [],
    score: 0,
    obstacleTimer: 2.1,
    obstacleSpacing: 2.5,
    obstacleSpeed: 158,
    gapSize: 332,
    backgroundDrift: 0,
    decorativeClouds: createDecorativeClouds(),
    bird: {
      x: 312,
      y: 392,
      vy: 0,
      radius: 36,
      rotation: 0
    },
    obstacles: []
  };
}

function createDecorativeClouds() {
  return [
    { x: 120, y: 116, width: 128, speed: 10, alpha: 0.34 },
    { x: 460, y: 178, width: 92, speed: 7, alpha: 0.26 },
    { x: 880, y: 138, width: 146, speed: 12, alpha: 0.28 },
    { x: 1180, y: 202, width: 110, speed: 9, alpha: 0.22 }
  ];
}

function loadImage(src) {
  if (imageCache.has(src)) {
    return imageCache.get(src);
  }

  const image = new Image();
  image.src = encodeURI(src);
  imageCache.set(src, image);
  return image;
}

function loadStoredPlayerName() {
  return sanitizePlayerName(localStorage.getItem(PLAYER_NAME_STORAGE_KEY) || "") || "";
}

function loadLeaderboard() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEADERBOARD_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry, index) => normalizeLeaderboardEntry(entry, index))
      .filter(Boolean)
      .sort((first, second) => second.score - first.score || first.createdAt.localeCompare(second.createdAt))
      .slice(0, LEADERBOARD_LIMIT);
  } catch (error) {
    console.error(error);
    return [];
  }
}

function normalizeLeaderboardEntry(entry, index) {
  const name = sanitizePlayerName(entry?.name || "");
  const score = Number(entry?.score);
  if (!name || !Number.isFinite(score)) {
    return null;
  }

  return {
    id: String(entry?.id || `${name}-${entry?.createdAt || index}`),
    name,
    birdId: String(entry?.birdId || "unknown"),
    birdName: String(entry?.birdName || "Pajaro"),
    score: Math.max(0, Math.floor(score)),
    createdAt: typeof entry?.createdAt === "string" ? entry.createdAt : new Date().toISOString()
  };
}

function sanitizePlayerName(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18);
}

function getHighScoreFromLeaderboard(leaderboard) {
  return leaderboard.reduce((best, entry) => Math.max(best, entry.score), 0);
}

function setCurrentPlayerName(name) {
  const cleanName = sanitizePlayerName(name);
  state.currentPlayerName = cleanName;
  localStorage.setItem(PLAYER_NAME_STORAGE_KEY, cleanName);
  dom.playerNameInput.value = cleanName;
  dom.currentPlayerLabel.textContent = `Jugador: ${cleanName || "Invitado"}`;
}

function saveLeaderboard() {
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(state.leaderboard));
}

function canUseCameraOrigin() {
  return window.isSecureContext || /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
}

function renderLeaderboard() {
  renderLeaderboardList(dom.leaderboardList, dom.leaderboardEmpty, LEADERBOARD_LIMIT);
  renderLeaderboardList(dom.gameOverLeaderboardList, dom.gameOverLeaderboardEmpty, GAME_OVER_LEADERBOARD_LIMIT);
}

function renderLeaderboardList(listElement, emptyElement, limit) {
  if (!listElement || !emptyElement) {
    return;
  }

  const entries = state.leaderboard.slice(0, limit);
  listElement.replaceChildren();
  emptyElement.classList.toggle("hidden", entries.length > 0);

  for (const [index, entry] of entries.entries()) {
    const item = document.createElement("li");
    item.className = "leaderboard-item";
    item.innerHTML =
      `<span class="leaderboard-rank">${index + 1}</span>` +
      `<div class="leaderboard-player"><strong>${escapeHtml(entry.name)}</strong><span>${escapeHtml(entry.birdName)} · ${formatEntryDate(entry.createdAt)}</span></div>` +
      `<strong class="leaderboard-score">${entry.score}</strong>`;
    listElement.append(item);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function formatEntryDate(isoDate) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "Sin fecha";
  }

  return parsed.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function getSelectedBird() {
  return assets.birds[state.selectedBirdIndex];
}

function renderMenu() {
  const bird = getSelectedBird();
  dom.menuBackdrop.style.backgroundImage =
    `linear-gradient(90deg, rgba(7, 15, 21, 0.86) 0%, rgba(7, 15, 21, 0.54) 42%, rgba(7, 15, 21, 0.34) 100%), url("${encodeURI(assets.menuBackground)}")`;
  dom.characterPreview.src = encodeURI(bird.sprite);
  dom.characterName.textContent = bird.name;
  dom.characterFlavor.textContent = bird.flavor;
  dom.flightStat.textContent = bird.flight;
  dom.sensitivityStat.textContent = bird.sensitivity;
  dom.difficultyBadge.textContent = "Progresiva";
  dom.gameCharacterName.textContent = bird.name;
  dom.currentPlayerLabel.textContent = `Jugador: ${state.currentPlayerName || "Invitado"}`;
  dom.playerNameInput.value = state.currentPlayerName;
  renderLeaderboard();

  dom.characterDots.replaceChildren();
  assets.birds.forEach((item, index) => {
    const dot = document.createElement("button");
    dot.className = `character-dot${index === state.selectedBirdIndex ? " active" : ""}`;
    dot.type = "button";
    dot.setAttribute("aria-label", item.name);
    dot.addEventListener("click", () => {
      state.selectedBirdIndex = index;
      renderMenu();
    });
    dom.characterDots.append(dot);
  });
}

function switchScreen(showGame) {
  dom.menuScreen.classList.toggle("hidden", showGame);
  dom.gameScreen.classList.toggle("hidden", !showGame);
}

function resetControlState() {
  state.control.left = createHandState();
  state.control.right = createHandState();
  state.control.targetNormalized = 0.52;
  state.control.trackingStrength = 0;
  state.control.activeHands = 0;
  state.control.lift = 0;
  state.control.drop = 0;
  state.handTracking.lastVideoTime = -1;
  state.handTracking.lastResults = null;
  state.handTracking.lastDetections = [];
  clearHandOverlay();
}

function resetRun() {
  state.game = createGameState();
  const bird = getSelectedBird();
  state.game.bird.radius = bird.size * 0.22;
  resetControlState();
  updateStartOverlay();
  updateHud();
  updateControlUi();
  showStartOverlay(true);
  showGameOverOverlay(false);
}

function startGameSession() {
  const playerName = sanitizePlayerName(dom.playerNameInput.value);
  if (!playerName) {
    dom.playerNameError.classList.remove("hidden");
    dom.playerNameInput.focus();
    return;
  }

  dom.playerNameError.classList.add("hidden");
  setCurrentPlayerName(playerName);
  switchScreen(true);
  resetRun();
  startCamera();

  if (!state.animationId) {
    let lastTime = performance.now();
    const loop = (now) => {
      const delta = Math.min(0.032, (now - lastTime) / 1000);
      lastTime = now;
      tick(delta, now);
      draw();
      state.animationId = requestAnimationFrame(loop);
    };

    state.animationId = requestAnimationFrame(loop);
  }
}

function returnToMenu() {
  switchScreen(false);
  stopCamera();

  if (state.animationId) {
    cancelAnimationFrame(state.animationId);
    state.animationId = 0;
  }
}

function showStartOverlay(visible) {
  dom.startOverlay.classList.toggle("hidden", !visible);
  dom.startOverlay.classList.toggle("visible", visible);
}

function showGameOverOverlay(visible) {
  dom.gameOverOverlay.classList.toggle("hidden", !visible);
  dom.gameOverOverlay.classList.toggle("visible", visible);
}

function startRunIfNeeded() {
  if (state.game.over || state.game.started || state.game.adapting) {
    return;
  }

  state.game.started = true;
  state.game.ready = false;
  showStartOverlay(false);
}

function applyKeyboardLift() {
  if (state.game.over) {
    return;
  }

  startRunIfNeeded();
  state.game.bird.vy -= 220;
  state.control.lift = Math.max(state.control.lift, 0.5);
}

function updateHud() {
  dom.scoreValue.textContent = String(state.game.score);
  dom.highScoreValue.textContent = String(state.highScore);
  dom.difficultyValue.textContent = `${state.game.difficultyFactor.toFixed(2)}x`;
  dom.currentPlayerLabel.textContent = `Jugador: ${state.currentPlayerName || "Invitado"}`;
  dom.gameStateLabel.textContent = state.game.over
    ? state.game.gameOverShown
      ? "Game Over"
      : "Cayendo"
    : state.game.adapting
      ? "Adaptando"
    : state.game.started
      ? "Volando"
      : "Listo";
}

function updateControlUi() {
  const leftPercent = Math.round(state.control.left.energy * 100);
  const rightPercent = Math.round(state.control.right.energy * 100);
  const liftPercent = Math.round(state.control.lift * 100);

  dom.leftHandValue.textContent = `${leftPercent}%`;
  dom.rightHandValue.textContent = `${rightPercent}%`;
  dom.liftValue.textContent = `${liftPercent}%`;
  dom.leftHandFill.style.width = `${leftPercent}%`;
  dom.rightHandFill.style.width = `${rightPercent}%`;
  dom.liftFill.style.width = `${liftPercent}%`;
  dom.leftHandZone.classList.toggle("active", state.control.left.active);
  dom.rightHandZone.classList.toggle("active", state.control.right.active);

  if (!state.stream) {
    dom.cameraHint.textContent = "Da permiso a la camara. Si algo falla, espacio sigue funcionando.";
    return;
  }

  if (state.handTracking.loading) {
    dom.cameraHint.textContent = "Estoy cargando el rastreo real de manos para que el control sea mas preciso.";
    return;
  }

  if (state.handTracking.error) {
    dom.cameraHint.textContent = "No pude activar el rastreo real. Usa espacio mientras revisamos la camara.";
    return;
  }

  if (!state.handTracking.ready) {
    dom.cameraHint.textContent = "Preparando sensor corporal...";
    return;
  }

  if (state.game.adapting) {
    const seconds = Math.max(1, Math.ceil(state.game.adaptationRemaining));
    dom.cameraHint.textContent = `Tienes ${seconds}s para adaptarte. Manos arriba suben al pajaro y manos abajo lo bajan.`;
    return;
  }

  if (!state.game.started) {
    dom.cameraHint.textContent = "Pon las manos dentro de las franjas. Arriba sube el pajaro y abajo baja.";
  } else {
    dom.cameraHint.textContent = "Dentro de las franjas: manos arriba suben al pajaro, manos abajo lo bajan.";
  }
}

function tick(delta, now) {
  analyzeHands(now);

  const game = state.game;
  const birdConfig = getSelectedBird();
  game.backgroundDrift += delta * 28;

  for (const cloud of game.decorativeClouds) {
    cloud.x -= cloud.speed * delta;
    if (cloud.x + cloud.width < -60) {
      cloud.x = game.width + 80 + Math.random() * 140;
      cloud.y = 90 + Math.random() * 150;
    }
  }

  if (game.over) {
    updateDefeatAnimation(delta);
    updateHud();
    updateControlUi();
    return;
  }

  if (game.adapting) {
    if (state.handTracking.ready) {
      game.adaptationRemaining = Math.max(0, game.adaptationRemaining - delta);
    }

    applyBirdPhysics(delta, birdConfig, true);
    applySoftBounds(game.bird, game.height);
    updateStartOverlay();

    if (game.adaptationRemaining <= 0) {
      game.adapting = false;
      game.ready = false;
      game.started = true;
      showStartOverlay(false);
    }

    updateHud();
    updateControlUi();
    return;
  }

  if (!game.started) {
    game.bird.rotation = lerp(game.bird.rotation, -0.06, 0.08);
    updateStartOverlay();
    updateHud();
    updateControlUi();
    return;
  }

  applyBirdPhysics(delta, birdConfig, false);
  applySoftBounds(game.bird, game.height);
  game.elapsed += delta;
  updateProgressiveDifficulty(game);

  game.obstacleTimer -= delta;
  if (game.obstacleTimer <= 0) {
    game.obstacleTimer = game.obstacleSpacing;
    spawnObstacle();
  }

  for (const obstacle of game.obstacles) {
    obstacle.x -= game.obstacleSpeed * delta;

    if (!obstacle.scored && obstacle.x + obstacle.hitboxWidth < game.bird.x) {
      obstacle.scored = true;
      game.score += 1;
      state.highScore = Math.max(state.highScore, game.score, getHighScoreFromLeaderboard(state.leaderboard));
    }
  }

  game.obstacles = game.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -60);

  if (hasCollision()) {
    endRun();
  }

  updateHud();
  updateControlUi();
}

function updateProgressiveDifficulty(game) {
  const scoreFactor = clamp(game.score / 18, 0, 1);
  const timeFactor = clamp(game.elapsed / 80, 0, 1);
  const ramp = clamp((scoreFactor * 0.62) + (timeFactor * 0.48), 0, 1);

  game.difficultyFactor = lerp(game.difficultyFactor, 1 + (ramp * 0.96), 0.08);
  game.obstacleSpeed = lerp(158, 282, ramp);
  game.obstacleSpacing = lerp(2.5, 1.3, ramp);
  game.gapSize = lerp(332, 236, ramp);
}

function applyBirdPhysics(delta, birdConfig, gentleMode) {
  const bird = state.game.bird;
  const topLimit = SOFT_TOP_LIMIT;
  const bottomLimit = state.game.height - SOFT_BOTTOM_MARGIN;
  const targetY = lerp(bottomLimit, topLimit, state.control.targetNormalized);
  const minVelocity = gentleMode ? -210 : -280;
  const maxVelocity = gentleMode ? 210 : 280;
  const followStrength = gentleMode ? 5.6 : 6.8;
  const response = gentleMode ? 0.18 : 0.24;
  const idleDrift = gentleMode ? 22 : 34;
  const activeControl = state.control.activeHands > 0;
  const desiredVelocity = clamp((targetY - bird.y) * followStrength, minVelocity, maxVelocity);

  bird.vy = lerp(bird.vy, desiredVelocity, activeControl ? response : response * 0.42);
  if (!activeControl) {
    bird.vy += idleDrift * delta;
  }
  bird.y += bird.vy * delta;
  bird.rotation = clamp(bird.vy / 340, -0.5, 0.58);
}

function applySoftBounds(bird, height) {
  const topLimit = SOFT_TOP_LIMIT;
  const bottomLimit = height - SOFT_BOTTOM_MARGIN;

  if (bird.y < topLimit) {
    bird.y = topLimit;
    if (bird.vy < 0) {
      bird.vy = Math.max(20, Math.abs(bird.vy) * 0.14);
    }
  }

  if (bird.y > bottomLimit) {
    bird.y = bottomLimit;
    if (bird.vy > 0) {
      bird.vy = -Math.max(24, bird.vy * 0.16);
    }
  }
}

function spawnObstacle() {
  const game = state.game;
  const width = 182;
  const hitboxWidth = 112;
  const gapSize = game.gapSize;
  const topHeight = 100 + Math.random() * 110;
  const bottomY = topHeight + gapSize;
  const variant = Math.floor(Math.random() * 3);

  game.obstacles.push({
    x: game.width + 100,
    width,
    hitboxWidth,
    topHeight,
    bottomY,
    scored: false,
    variant
  });
}

function hasCollision() {
  const game = state.game;
  const bird = game.bird;

  for (const obstacle of game.obstacles) {
    const hitboxX = obstacle.x + (obstacle.width - obstacle.hitboxWidth) * 0.5;
    const inX = bird.x + bird.radius > hitboxX && bird.x - bird.radius < hitboxX + obstacle.hitboxWidth;
    const hitsTop = bird.y - bird.radius < obstacle.topHeight - 8;
    const hitsBottom = bird.y + bird.radius > obstacle.bottomY + 8;

    if (inX && (hitsTop || hitsBottom)) {
      return true;
    }
  }

  return false;
}

function endRun() {
  if (state.game.over) {
    return;
  }

  state.game.over = true;
  state.game.started = false;
  state.game.gameOverShown = false;
  state.game.defeatTimer = 0;
  state.game.defeatFlash = 1;
  state.game.crashParticles = createCrashParticles(state.game.bird);
  state.game.finalRank = submitScoreIfNeeded();
  showGameOverOverlay(false);
  renderLeaderboard();
  dom.gameOverTitle.textContent = state.game.score > 0 ? "Se te fue el vuelo" : "Probemos otra vez";
  dom.gameOverSummary.textContent =
    `Hiciste ${state.game.score} punto${state.game.score === 1 ? "" : "s"} con ${state.currentPlayerName}. ` +
    `Tu mejor score va en ${state.highScore} y esta partida quedo #${state.game.finalRank}.`;
}

function submitScoreIfNeeded() {
  if (state.game.scoreCommitted) {
    return state.game.finalRank ?? 1;
  }

  const bird = getSelectedBird();
  const entry = {
    id: `${state.currentPlayerName}-${Date.now()}`,
    name: state.currentPlayerName || "Invitado",
    birdId: bird.id,
    birdName: bird.name,
    score: state.game.score,
    createdAt: new Date().toISOString()
  };

  state.game.scoreCommitted = true;
  const rankedEntries = [...state.leaderboard, entry]
    .sort((first, second) => second.score - first.score || first.createdAt.localeCompare(second.createdAt));
  const rank = rankedEntries.findIndex((candidate) => candidate.id === entry.id) + 1;
  state.leaderboard = rankedEntries.slice(0, LEADERBOARD_LIMIT);
  saveLeaderboard();
  state.highScore = getHighScoreFromLeaderboard(state.leaderboard);
  return Math.max(1, rank);
}

function createCrashParticles(bird) {
  const particles = [];
  for (let index = 0; index < 12; index += 1) {
    const angle = (Math.PI * 2 * index) / 12;
    const speed = 90 + Math.random() * 180;
    particles.push({
      x: bird.x,
      y: bird.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      life: 1,
      size: 8 + Math.random() * 12
    });
  }
  return particles;
}

function updateDefeatAnimation(delta) {
  const game = state.game;
  const bird = game.bird;

  game.defeatTimer += delta;
  game.defeatFlash = Math.max(0, game.defeatFlash - delta * 1.8);
  bird.vy += 880 * delta;
  bird.vy = clamp(bird.vy, -80, 520);
  bird.y += bird.vy * delta;
  bird.rotation = clamp(bird.rotation + (delta * 4.8), -0.2, 1.7);
  applySoftBounds(bird, game.height);

  for (const particle of game.crashParticles) {
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.vy += 260 * delta;
    particle.life = Math.max(0, particle.life - delta * 1.4);
  }

  game.crashParticles = game.crashParticles.filter((particle) => particle.life > 0.02);

  if (!game.gameOverShown && game.defeatTimer >= 0.82) {
    game.gameOverShown = true;
    showGameOverOverlay(true);
  }
}

function draw() {
  const game = state.game;
  const birdConfig = getSelectedBird();
  const backgroundImage = loadImage(assets.gameplayBackground);
  const birdImage = loadImage(birdConfig.sprite);

  ctx.clearRect(0, 0, game.width, game.height);
  drawBackground(backgroundImage, game.width, game.height, game.backgroundDrift);
  drawSkyDecorations(game.decorativeClouds);
  drawGround(game.width, game.height);

  for (const obstacle of game.obstacles) {
    drawCloudObstacle(obstacle, true);
    drawCloudObstacle(obstacle, false);
  }

  if (game.crashParticles.length > 0) {
    drawCrashParticles(game.crashParticles);
  }

  ctx.save();
  ctx.translate(game.bird.x, game.bird.y);
  ctx.rotate(game.bird.rotation);

  if (birdImage.complete && birdImage.naturalWidth > 0) {
    const size = birdConfig.size;
    ctx.drawImage(birdImage, -size * 0.5, -size * 0.5, size, size);
  } else {
    ctx.fillStyle = "#ffd184";
    ctx.beginPath();
    ctx.arc(0, 0, game.bird.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  if (game.defeatFlash > 0) {
    drawDefeatFlash(game.defeatFlash);
  }

  if (!game.started && !game.over) {
    if (game.adapting) {
      drawCenteredHint(`Adaptacion ${Math.max(1, Math.ceil(game.adaptationRemaining))}s`);
    } else {
      drawCenteredHint(state.handTracking.ready ? "Esperando gesto de manos" : "Preparando sensor");
    }
  }
}

function drawBackground(image, width, height, drift) {
  if (image.complete && image.naturalWidth > 0) {
    ctx.drawImage(image, 0, 0, width, height);
  } else {
    ctx.fillStyle = "#76cdf6";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
  for (let x = -60; x < width + 120; x += 110) {
    const lineX = ((x - drift) % (width + 140)) - 140;
    ctx.fillRect(lineX, 0, 2, height - 70);
  }
}

function drawSkyDecorations(clouds) {
  for (const cloud of clouds) {
    drawSoftCloud(cloud.x, cloud.y, cloud.width, cloud.alpha);
  }
}

function drawSoftCloud(x, y, width, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#f9f8f1";
  ctx.beginPath();
  ctx.arc(x, y, width * 0.16, 0, Math.PI * 2);
  ctx.arc(x + width * 0.18, y - 18, width * 0.18, 0, Math.PI * 2);
  ctx.arc(x + width * 0.38, y - 6, width * 0.21, 0, Math.PI * 2);
  ctx.arc(x + width * 0.6, y - 16, width * 0.17, 0, Math.PI * 2);
  ctx.arc(x + width * 0.78, y - 2, width * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGround(width, height) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(0, height - 54, width, 54);

  ctx.fillStyle = "rgba(245, 232, 198, 0.82)";
  for (let x = 24; x < width; x += 56) {
    ctx.fillRect(x, height - 28, 30, 4);
  }
}

function drawCloudObstacle(obstacle, top) {
  const bodyX = obstacle.x + 42;
  const bodyWidth = obstacle.width - 84;
  const variantOffset = obstacle.variant * 6;

  ctx.save();
  const gradient = ctx.createLinearGradient(0, 0, 0, state.game.height);
  gradient.addColorStop(0, "rgba(252, 252, 249, 0.98)");
  gradient.addColorStop(1, "rgba(197, 220, 255, 0.96)");
  ctx.fillStyle = gradient;
  ctx.shadowColor = "rgba(111, 173, 230, 0.35)";
  ctx.shadowBlur = 18;

  if (top) {
    const bodyHeight = Math.max(24, obstacle.topHeight - 56);
    drawRoundedCloudBody(bodyX, 0, bodyWidth, bodyHeight);
    drawCloudCluster(
      obstacle.x + obstacle.width * 0.5,
      obstacle.topHeight - 14,
      78 + variantOffset,
      5 + obstacle.variant
    );
  } else {
    const bodyY = obstacle.bottomY + 54;
    const bodyHeight = Math.max(24, state.game.height - bodyY - 54);
    drawRoundedCloudBody(bodyX, bodyY, bodyWidth, bodyHeight);
    drawCloudCluster(
      obstacle.x + obstacle.width * 0.5,
      obstacle.bottomY + 18,
      82 + variantOffset,
      5 + obstacle.variant
    );
  }

  ctx.restore();
}

function drawRoundedCloudBody(x, y, width, height) {
  const radius = Math.min(26, width * 0.3);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fill();

  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#c9ddff";
  ctx.fillRect(x + 10, y + 8, width - 20, height - 16);
  ctx.globalAlpha = 1;
}

function drawCloudCluster(centerX, centerY, radius, puffs) {
  for (let index = 0; index < puffs; index += 1) {
    const angle = (Math.PI * 2 * index) / puffs;
    const wobble = radius * 0.36;
    const puffX = centerX + Math.cos(angle) * wobble;
    const puffY = centerY + Math.sin(angle) * wobble * 0.62;
    const puffRadius = radius * (0.34 + ((index + 1) % 3) * 0.08);

    ctx.beginPath();
    ctx.arc(puffX, puffY, puffRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

function drawCenteredHint(text) {
  ctx.save();
  ctx.fillStyle = "rgba(7, 20, 29, 0.46)";
  ctx.fillRect(388, 104, 504, 74);
  ctx.strokeStyle = "rgba(245, 224, 177, 0.22)";
  ctx.strokeRect(388, 104, 504, 74);
  ctx.fillStyle = "#f6f0df";
  ctx.textAlign = "center";
  ctx.font = '700 32px "Manrope"';
  ctx.fillText(text, state.game.width / 2, 149);
  ctx.restore();
}

function drawCrashParticles(particles) {
  for (const particle of particles) {
    ctx.save();
    ctx.globalAlpha = particle.life * 0.82;
    ctx.fillStyle = particle.life > 0.5 ? "#ffd774" : "#f1693c";
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawDefeatFlash(intensity) {
  ctx.save();
  ctx.fillStyle = `rgba(241, 105, 60, ${Math.min(0.28, intensity * 0.28)})`;
  ctx.fillRect(0, 0, state.game.width, state.game.height);
  ctx.restore();
}

function updateStartOverlay() {
  if (!state.game.adapting) {
    dom.startOverlayEyebrow.textContent = "Antes de despegar";
    dom.startOverlayTitle.textContent = "Subi las manos para despegar";
    dom.startOverlayBody.textContent =
      "El pajaro espera quieto. El control principal ahora mira la velocidad vertical de tus manos.";
    return;
  }

  const seconds = Math.max(1, Math.ceil(state.game.adaptationRemaining));
  dom.startOverlayEyebrow.textContent = "Adaptacion corporal";
  dom.startOverlayTitle.textContent = `Ajustate durante ${seconds}s`;
  dom.startOverlayBody.textContent =
    "Prueba subir y bajar las manos dentro de las franjas. En esta fase no pierdes por tocar arriba o abajo.";
}

function analyzeHands(now) {
  if (!state.stream || dom.webcamVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    decayHandSignals();
    clearHandOverlay();
    return;
  }

  if (!state.handTracking.ready || !state.handTracking.landmarker) {
    decayHandSignals();
    clearHandOverlay();
    return;
  }

  if (dom.webcamVideo.currentTime === state.handTracking.lastVideoTime) {
    return;
  }

  state.handTracking.lastVideoTime = dom.webcamVideo.currentTime;

  try {
    const results = state.handTracking.landmarker.detectForVideo(dom.webcamVideo, now);
    state.handTracking.lastResults = results;
    updateTrackedHands(results, now);
    drawHandOverlay(results);
  } catch (error) {
    console.error(error);
    state.handTracking.error = "tracking-runtime";
    dom.cameraStatus.textContent = "El rastreo se freno. Usa espacio mientras lo reinicias.";
    decayHandSignals();
    clearHandOverlay();
  }
}

function updateTrackedHands(results, now) {
  const detections = [];

  if (Array.isArray(results.landmarks)) {
    for (let index = 0; index < results.landmarks.length; index += 1) {
      const landmarks = results.landmarks[index];
      const handedness = Array.isArray(results.handedness?.[index]) ? results.handedness[index][0] : null;
      const detection = normalizeHandDetection(index, landmarks, handedness);
      if (detection) {
        detections.push(detection);
      }
    }
  }

  const leftDetection = selectBestLaneDetection(detections, HAND_LANES.left);
  const usedDetectionIds = new Set(leftDetection ? [leftDetection.id] : []);
  const rightDetection = selectBestLaneDetection(detections, HAND_LANES.right, usedDetectionIds);

  state.handTracking.lastDetections = detections;

  updateHandState(state.control.left, leftDetection, now);
  updateHandState(state.control.right, rightDetection, now);
  deriveBirdLift();

  if (!state.game.adapting && state.control.lift > HAND_START_THRESHOLD) {
    startRunIfNeeded();
  }
}

function normalizeHandDetection(id, landmarks, handedness) {
  if (!Array.isArray(landmarks) || landmarks.length < 21) {
    return null;
  }

  const confidence = clamp(Number(handedness?.score ?? 0.92), 0, 1);
  if (confidence < HAND_CONFIDENCE_FLOOR) {
    return null;
  }

  const anchorIndexes = [0, 5, 9, 13, 17];
  let centroidX = 0;
  let centroidY = 0;

  for (const index of anchorIndexes) {
    centroidX += landmarks[index].x;
    centroidY += landmarks[index].y;
  }

  centroidX /= anchorIndexes.length;
  centroidY /= anchorIndexes.length;

  const openness =
    distance2d(landmarks[4], landmarks[8]) +
    distance2d(landmarks[8], landmarks[12]) +
    distance2d(landmarks[12], landmarks[16]) +
    distance2d(landmarks[16], landmarks[20]);

  let topY = 1;
  let bottomY = 0;
  for (const point of landmarks) {
    topY = Math.min(topY, point.y);
    bottomY = Math.max(bottomY, point.y);
  }

  return {
    id,
    confidence,
    centroidX,
    centroidY,
    screenX: 1 - centroidX,
    screenY: centroidY,
    openness: clamp(openness / 0.65, 0, 1),
    topY,
    bottomY,
    landmarks
  };
}

function selectBestLaneDetection(detections, lane, excludedIds = new Set()) {
  let bestDetection = null;
  let bestScore = 0;

  for (const detection of detections) {
    if (excludedIds.has(detection.id)) {
      continue;
    }

    const laneMatch = describeLaneMatch(detection, lane);
    if (!laneMatch.inLane || laneMatch.score <= bestScore) {
      continue;
    }

    bestDetection = {
      ...detection,
      laneSide: lane.side,
      laneCoverage: laneMatch.coverage,
      laneScore: laneMatch.score,
      laneTravelWeight: laneMatch.travelWeight,
      laneVertical: laneMatch.verticalControl
    };
    bestScore = laneMatch.score;
  }

  return bestDetection;
}

function describeLaneMatch(detection, lane) {
  let insideCount = 0;

  for (const pointIndex of HAND_LANE_POINTS) {
    const point = detection.landmarks[pointIndex];
    const pointX = 1 - point.x;
    const pointY = point.y;
    if (
      pointX >= lane.xMin &&
      pointX <= lane.xMax &&
      pointY >= lane.yMin &&
      pointY <= lane.yMax
    ) {
      insideCount += 1;
    }
  }

  const coverage = insideCount / HAND_LANE_POINTS.length;
  const laneCenter = (lane.xMin + lane.xMax) * 0.5;
  const halfWidth = (lane.xMax - lane.xMin) * 0.5;
  const centerBias = clamp(1 - (Math.abs(detection.screenX - laneCenter) / Math.max(halfWidth, 0.001)), 0, 1);
  const verticalSpan = clamp((detection.bottomY - detection.topY) / 0.42, 0, 1);
  const score = clamp((coverage * 0.62) + (centerBias * 0.22) + (verticalSpan * 0.16), 0, 1);
  const laneProgress = clamp((detection.screenY - lane.yMin) / Math.max(lane.yMax - lane.yMin, 0.001), 0, 1);

  return {
    coverage,
    score,
    inLane: coverage >= HAND_LANE_COVERAGE_FLOOR,
    travelWeight: clamp((coverage * 0.72) + (centerBias * 0.28), 0, 1),
    verticalControl: 1 - laneProgress
  };
}

function updateHandState(target, detection, now) {
  if (!detection) {
    target.energy = lerp(target.energy, 0, 0.16);
    target.velocity = lerp(target.velocity, 0, 0.2);
    target.movement = lerp(target.movement, 0, 0.18);
    target.liftIntent = lerp(target.liftIntent, 0, 0.2);
    target.dropIntent = lerp(target.dropIntent, 0, 0.2);
    target.confidence = lerp(target.confidence, 0, 0.18);
    target.laneCoverage = lerp(target.laneCoverage, 0, 0.2);
    target.verticalControl = lerp(target.verticalControl, 0.52, 0.16);
    target.active = false;
    target.centroidX = null;
    target.centroidY = null;
    target.lastTime = now;
    return;
  }

  let velocity = 0;
  let travel = 0;
  if (target.centroidY != null && target.lastTime) {
    const dt = Math.max(0.016, (now - target.lastTime) / 1000);
    velocity = (target.centroidY - detection.screenY) / dt;
    travel = Math.abs(target.centroidY - detection.screenY);
  }

  target.velocity = lerp(target.velocity, velocity, 0.62);
  target.confidence = lerp(target.confidence, detection.confidence, 0.5);
  target.laneCoverage = lerp(target.laneCoverage, detection.laneCoverage ?? 0, 0.5);
  target.verticalControl = lerp(target.verticalControl, detection.laneVertical ?? 0.52, 0.44);
  target.movement = lerp(
    target.movement,
    clamp(((Math.abs(target.velocity) * 0.7) + ((detection.laneTravelWeight ?? 0) * 0.3)), 0, 1),
    0.42
  );
  target.energy = lerp(
    target.energy,
    clamp(
      (target.confidence * 0.24) +
      ((detection.laneCoverage ?? 0) * 0.3) +
      (target.movement * 0.32) +
      (detection.openness * 0.14),
      0,
      1
    ),
    0.42
  );
  target.active = true;
  target.centroidX = detection.screenX;
  target.centroidY = detection.screenY;
  target.lastTime = now;

  const upwardVelocity = clamp((target.velocity - HAND_UPWARD_SPEED) / 1.18, 0, 1);
  const downwardVelocity = clamp(((-target.velocity) - HAND_DOWNWARD_SPEED) / 1.5, 0, 1);
  const travelBoost = clamp((travel - HAND_MIN_TRAVEL) / 0.085, 0, 0.3);
  const laneWeight = detection.laneTravelWeight ?? 0;

  target.liftIntent = Math.max(
    target.liftIntent * 0.56,
    clamp((upwardVelocity * (0.44 + (laneWeight * 0.24))) + (travelBoost * 0.56), 0, 0.84)
  );
  target.dropIntent = Math.max(target.dropIntent * 0.48, downwardVelocity * 0.16 * laneWeight);
}

function deriveBirdLift() {
  const activeHands = [state.control.left, state.control.right].filter((hand) => hand.active);
  let weightedControl = 0;
  let weightSum = 0;

  for (const hand of activeHands) {
    const weight = clamp((hand.confidence * 0.45) + (hand.laneCoverage * 0.35) + (hand.movement * 0.2), 0.2, 1);
    weightedControl += hand.verticalControl * weight;
    weightSum += weight;
  }

  const targetNormalized = weightSum > 0
    ? clamp(weightedControl / weightSum, 0.08, 0.92)
    : 0.52;

  state.control.activeHands = activeHands.length;
  state.control.trackingStrength = lerp(state.control.trackingStrength, clamp(weightSum / 1.6, 0, 1), 0.24);
  state.control.targetNormalized = lerp(
    state.control.targetNormalized,
    targetNormalized,
    activeHands.length > 0 ? 0.28 : 0.1
  );
  state.control.lift = lerp(state.control.lift, state.control.targetNormalized, activeHands.length > 0 ? 0.32 : 0.12);
  state.control.drop = lerp(state.control.drop, 1 - state.control.targetNormalized, activeHands.length > 0 ? 0.28 : 0.1);
}

function decayHandSignals() {
  state.control.left.energy = lerp(state.control.left.energy, 0, 0.16);
  state.control.right.energy = lerp(state.control.right.energy, 0, 0.16);
  state.control.left.velocity = lerp(state.control.left.velocity, 0, 0.18);
  state.control.right.velocity = lerp(state.control.right.velocity, 0, 0.18);
  state.control.left.movement = lerp(state.control.left.movement, 0, 0.18);
  state.control.right.movement = lerp(state.control.right.movement, 0, 0.18);
  state.control.left.liftIntent = lerp(state.control.left.liftIntent, 0, 0.2);
  state.control.right.liftIntent = lerp(state.control.right.liftIntent, 0, 0.2);
  state.control.left.dropIntent = lerp(state.control.left.dropIntent, 0, 0.2);
  state.control.right.dropIntent = lerp(state.control.right.dropIntent, 0, 0.2);
  state.control.left.confidence = lerp(state.control.left.confidence, 0, 0.18);
  state.control.right.confidence = lerp(state.control.right.confidence, 0, 0.18);
  state.control.left.laneCoverage = lerp(state.control.left.laneCoverage, 0, 0.2);
  state.control.right.laneCoverage = lerp(state.control.right.laneCoverage, 0, 0.2);
  state.control.left.active = false;
  state.control.right.active = false;
  state.control.targetNormalized = lerp(state.control.targetNormalized, 0.52, 0.1);
  state.control.trackingStrength = lerp(state.control.trackingStrength, 0, 0.12);
  state.control.activeHands = 0;
  state.control.lift = lerp(state.control.lift, state.control.targetNormalized, 0.12);
  state.control.drop = lerp(state.control.drop, 1 - state.control.targetNormalized, 0.1);
}

async function initializeHandTracking() {
  if (state.handTracking.ready || state.handTracking.loading) {
    return;
  }

  state.handTracking.loading = true;
  state.handTracking.error = "";
  dom.cameraStatus.textContent = "Cargando rastreo real de manos...";
  updateControlUi();

  try {
    const { FilesetResolver, HandLandmarker } = await import(TRACKING_BUNDLE_URL);
    const vision = await FilesetResolver.forVisionTasks(TRACKING_WASM_URL);
    state.handTracking.landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: TRACKING_MODEL_URL
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.34,
      minHandPresenceConfidence: 0.34,
      minTrackingConfidence: 0.28
    });
    state.handTracking.ready = true;
    state.handTracking.error = "";
    dom.cameraStatus.textContent = "Seguimiento de manos activo.";
  } catch (error) {
    console.error(error);
    state.handTracking.ready = false;
    state.handTracking.error = "tracking-load";
    dom.cameraStatus.textContent = "No pude cargar el sensor de manos. La webcam sigue disponible.";
  } finally {
    state.handTracking.loading = false;
    updateControlUi();
  }
}

async function startCamera() {
  if (state.stream) {
    return;
  }

  if (!canUseCameraOrigin()) {
    dom.cameraStatus.textContent = "La camara requiere localhost o HTTPS.";
    dom.cameraHint.textContent = "Abre el juego como http://localhost:4173. En Docker no uses el HTML directo ni una IP insegura.";
    return;
  }

  dom.cameraStatus.textContent = "Pidiendo permiso de camara...";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 960 },
        height: { ideal: 720 },
        facingMode: "user"
      },
      audio: false
    });

    state.stream = stream;
    dom.webcamVideo.srcObject = stream;
    await dom.webcamVideo.play();
    syncHandOverlayCanvas();
    dom.cameraStatus.textContent = "Camara activa. Iniciando seguimiento...";
    await initializeHandTracking();
  } catch (error) {
    console.error(error);
    dom.cameraStatus.textContent = "No pude abrir la camara. Proba permiso o cierra otra app.";
    dom.cameraHint.textContent = "Mientras tanto, la barra espaciadora sigue disponible.";
  }
}

function stopCamera() {
  if (state.stream) {
    for (const track of state.stream.getTracks()) {
      track.stop();
    }
  }

  state.stream = null;
  dom.webcamVideo.srcObject = null;
  dom.cameraStatus.textContent = "Camara detenida.";
  resetControlState();
  updateControlUi();
}

function syncHandOverlayCanvas() {
  const width = dom.handOverlayCanvas.clientWidth;
  const height = dom.handOverlayCanvas.clientHeight;

  if (!width || !height) {
    return false;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const scaledWidth = Math.round(width * dpr);
  const scaledHeight = Math.round(height * dpr);

  if (dom.handOverlayCanvas.width !== scaledWidth || dom.handOverlayCanvas.height !== scaledHeight) {
    dom.handOverlayCanvas.width = scaledWidth;
    dom.handOverlayCanvas.height = scaledHeight;
  }

  handOverlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return true;
}

function clearHandOverlay() {
  if (!syncHandOverlayCanvas()) {
    return;
  }

  handOverlayCtx.clearRect(0, 0, dom.handOverlayCanvas.clientWidth, dom.handOverlayCanvas.clientHeight);
}

function drawHandOverlay(results) {
  if (!syncHandOverlayCanvas()) {
    return;
  }

  const width = dom.handOverlayCanvas.clientWidth;
  const height = dom.handOverlayCanvas.clientHeight;

  handOverlayCtx.clearRect(0, 0, width, height);
  drawLaneOverlayGuides(width, height);

  if (!Array.isArray(results.landmarks)) {
    return;
  }

  for (let handIndex = 0; handIndex < results.landmarks.length; handIndex += 1) {
    const landmarks = results.landmarks[handIndex];
    if (!Array.isArray(landmarks) || landmarks.length < 21) {
      continue;
    }

    handOverlayCtx.strokeStyle = handIndex === 0 ? "rgba(140, 230, 188, 0.95)" : "rgba(246, 210, 116, 0.95)";
    handOverlayCtx.fillStyle = handOverlayCtx.strokeStyle;
    handOverlayCtx.lineWidth = 2.5;
    handOverlayCtx.shadowColor = "rgba(9, 24, 34, 0.5)";
    handOverlayCtx.shadowBlur = 14;

    for (const [from, to] of HAND_CONNECTIONS) {
      const start = landmarks[from];
      const end = landmarks[to];
      handOverlayCtx.beginPath();
      handOverlayCtx.moveTo((1 - start.x) * width, start.y * height);
      handOverlayCtx.lineTo((1 - end.x) * width, end.y * height);
      handOverlayCtx.stroke();
    }

    for (const point of landmarks) {
      handOverlayCtx.beginPath();
      handOverlayCtx.arc((1 - point.x) * width, point.y * height, 4.2, 0, Math.PI * 2);
      handOverlayCtx.fill();
    }
  }
}

function drawLaneOverlayGuides(width, height) {
  const lanes = [
    {
      config: HAND_LANES.left,
      active: state.control.left.active,
      strength: state.control.left.movement
    },
    {
      config: HAND_LANES.right,
      active: state.control.right.active,
      strength: state.control.right.movement
    }
  ];

  for (const lane of lanes) {
    const x = lane.config.xMin * width;
    const y = lane.config.yMin * height;
    const laneWidth = (lane.config.xMax - lane.config.xMin) * width;
    const laneHeight = (lane.config.yMax - lane.config.yMin) * height;
    const alpha = lane.active ? 0.14 + (lane.strength * 0.14) : 0.04;

    handOverlayCtx.save();
    handOverlayCtx.strokeStyle = lane.active ? "rgba(140, 230, 188, 0.72)" : "rgba(246, 240, 223, 0.16)";
    handOverlayCtx.fillStyle = `rgba(140, 230, 188, ${alpha})`;
    handOverlayCtx.lineWidth = lane.active ? 2.2 : 1.2;
    roundRect(handOverlayCtx, x, y, laneWidth, laneHeight, 20);
    handOverlayCtx.fill();
    handOverlayCtx.stroke();
    handOverlayCtx.restore();
  }
}

function cycleCharacter(direction) {
  const count = assets.birds.length;
  state.selectedBirdIndex = (state.selectedBirdIndex + direction + count) % count;
  renderMenu();
}

function bindEvents() {
  dom.prevCharacterButton.addEventListener("click", () => cycleCharacter(-1));
  dom.nextCharacterButton.addEventListener("click", () => cycleCharacter(1));
  dom.playButton.addEventListener("click", startGameSession);
  dom.restartButton.addEventListener("click", resetRun);
  dom.overlayMenuButton.addEventListener("click", returnToMenu);
  dom.backToMenuButton.addEventListener("click", returnToMenu);
  dom.howItWorksButton.addEventListener("click", () => {
    window.alert("El menu te deja elegir pajaro. En partida, el vuelo responde a la velocidad vertical de tus manos.");
  });
  dom.playerNameInput.addEventListener("input", () => {
    dom.playerNameError.classList.add("hidden");
  });
  dom.playerNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      startGameSession();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      applyKeyboardLift();
    }

    if (event.code === "KeyR" && state.game.over) {
      resetRun();
    }

    if (event.code === "Escape" && !dom.gameScreen.classList.contains("hidden")) {
      returnToMenu();
    }
  });

  window.addEventListener("resize", clearHandOverlay);
  dom.webcamVideo.addEventListener("loadedmetadata", clearHandOverlay);
}

function preloadImages() {
  loadImage(assets.menuBackground);
  loadImage(assets.gameplayBackground);
  assets.birds.forEach((bird) => loadImage(bird.sprite));
}

function distance2d(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function roundRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width * 0.5, height * 0.5);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function init() {
  setCurrentPlayerName(initialPlayerName);
  preloadImages();
  renderMenu();
  updateHud();
  updateControlUi();
  bindEvents();
  renderLeaderboard();
}

init();

window.__squatBirdDebug = {
  resetRun,
  snapshot() {
    return {
      selectedBird: getSelectedBird().name,
      handTracking: {
        loading: state.handTracking.loading,
        ready: state.handTracking.ready,
        error: state.handTracking.error
      },
      control: {
        lift: state.control.lift,
        drop: state.control.drop,
        left: { ...state.control.left },
        right: { ...state.control.right }
      },
      game: {
        ready: state.game.ready,
        started: state.game.started,
        over: state.game.over,
        score: state.game.score,
        obstacleCount: state.game.obstacles.length,
        bird: { ...state.game.bird }
      }
    };
  }
};
