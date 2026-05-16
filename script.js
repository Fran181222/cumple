const surpriseButton = document.getElementById("surpriseButton");
const surpriseScene = document.getElementById("surpriseScene");
const heartSwarm = document.getElementById("heartSwarm");
const floatingStars = document.querySelector(".floating-stars");
const musicHint = document.getElementById("musicHint");
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

const sparkleChoices = ["\u2B50", "\u2728", "\uD83D\uDCAB", "\uD83C\uDF1F"];
const heartPhotoSources = [
  "fotocard.jpeg",
  "foto1.jpeg",
  "foto2.jpeg",
  "foto3.jpeg",
  "foto4.jpeg"
];
const mobileTilts = ["-5deg", "4deg", "-3deg", "5deg", "-4deg", "3deg"];

let revealStarted = false;
let hintHidden = false;

function createSparkles() {
  const sparkleCount = window.innerWidth < 640 ? 26 : 42;

  floatingStars.innerHTML = "";

  for (let index = 0; index < sparkleCount; index += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.textContent = sparkleChoices[index % sparkleChoices.length];
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.setProperty("--delay", `${-1 * (Math.random() * 12)}s`);
    sparkle.style.setProperty("--duration", `${7 + Math.random() * 6}s`);
    sparkle.style.setProperty("--size", `${1.15 + Math.random() * 1.55}rem`);
    sparkle.style.setProperty("--drift", `${-65 + Math.random() * 130}px`);
    floatingStars.appendChild(sparkle);
  }
}

function buildHeartSwarm() {
  const viewportWidth = window.innerWidth;
  const isSmallMobile = viewportWidth < 620;
  const isTablet = viewportWidth < 900;
  const points = isSmallMobile ? 6 : isTablet ? 12 : 18;
  const xScale = isSmallMobile ? 1.02 : isTablet ? 1.14 : 1.42;
  const yScale = isSmallMobile ? 1.12 : isTablet ? 1.34 : 1.66;
  const yOffset = isSmallMobile ? 52 : isTablet ? 51 : 50;
  const positions = [];

  for (let index = 0; index < points; index += 1) {
    const t = (Math.PI * 2 * index) / points;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    positions.push({ x, y });
  }

  heartSwarm.innerHTML = "";

  positions.forEach((point, index) => {
    const card = document.createElement("div");
    const image = document.createElement("img");

    image.src = heartPhotoSources[index % heartPhotoSources.length];
    image.alt = "";

    card.className = "heart-card";
    card.style.setProperty("--x", `${50 + point.x * xScale}%`);
    card.style.setProperty("--y", `${yOffset - point.y * yScale}%`);
    card.style.setProperty("--enter-delay", `${0.92 + index * 0.05}s`);
    card.style.setProperty("--tilt", mobileTilts[index % mobileTilts.length]);
    card.style.setProperty(
      "--drift-x",
      `${(isSmallMobile ? -44 : -85) + Math.random() * (isSmallMobile ? 88 : 170)}px`
    );
    card.style.setProperty(
      "--drift-y",
      `${(isSmallMobile ? -68 : -105) + Math.random() * (isSmallMobile ? 136 : 210)}px`
    );
    card.style.setProperty(
      "--spin",
      `${(isSmallMobile ? -10 : -18) + Math.random() * (isSmallMobile ? 20 : 36)}deg`
    );
    card.style.setProperty(
      "--float-duration",
      `${(isSmallMobile ? 9 : 10) + Math.random() * (isSmallMobile ? 4 : 7)}s`
    );

    card.appendChild(image);
    heartSwarm.appendChild(card);
  });

  if (revealStarted) {
    window.setTimeout(floatHeartSwarm, 50);
  }
}

function floatHeartSwarm() {
  const cards = heartSwarm.querySelectorAll(".heart-card");
  cards.forEach((card, index) => {
    window.setTimeout(() => {
      card.classList.add("float-mode");
    }, 2550 + index * 28);
  });
}

function hideMusicHint() {
  if (hintHidden || !musicHint) {
    hintHidden = true;
    return;
  }

  hintHidden = true;
  musicHint.classList.add("is-hidden");
}

function setMusicButtonState(playing) {
  if (playing) {
    musicToggle.textContent = "\u266A Musiquita sonando";
    musicToggle.classList.add("is-playing", "is-visible");
  } else {
    musicToggle.textContent = "\u266A Activar cancion";
    musicToggle.classList.remove("is-playing");
    musicToggle.classList.add("is-visible");
  }
}

async function tryPlayMusic() {
  if (!bgMusic) {
    return false;
  }

  bgMusic.volume = 0.72;
  bgMusic.muted = false;

  try {
    const playAttempt = bgMusic.play();
    if (playAttempt && typeof playAttempt.then === "function") {
      await playAttempt;
    }

    hideMusicHint();
    setMusicButtonState(true);
    return true;
  } catch (error) {
    setMusicButtonState(false);
    return false;
  }
}

function revealSurprise() {
  if (revealStarted) {
    return;
  }

  revealStarted = true;
  document.body.classList.add("revealed");
  surpriseScene.setAttribute("aria-hidden", "false");
  floatHeartSwarm();
  tryPlayMusic();

  window.setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 250);
}

function shouldAutoReveal() {
  const params = new URLSearchParams(window.location.search);
  return params.get("surprise") === "1" || window.location.hash === "#surprise";
}

surpriseButton.addEventListener("click", revealSurprise);
musicToggle.addEventListener("click", tryPlayMusic);

bgMusic.addEventListener("playing", () => {
  hideMusicHint();
  setMusicButtonState(true);
});

bgMusic.addEventListener("pause", () => {
  if (!bgMusic.ended) {
    setMusicButtonState(false);
  }
});

document.addEventListener("pointerdown", tryPlayMusic, { once: false });
document.addEventListener("keydown", tryPlayMusic, { once: false });
window.addEventListener("load", tryPlayMusic);
window.addEventListener("resize", createSparkles);
window.addEventListener("resize", buildHeartSwarm);

createSparkles();
buildHeartSwarm();
tryPlayMusic();

if (shouldAutoReveal()) {
  window.setTimeout(revealSurprise, 320);
}
