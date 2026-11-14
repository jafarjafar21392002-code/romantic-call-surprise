const incomingScreen = document.getElementById("incomingScreen");
const connectedScreen = document.getElementById("connectedScreen");
const declineBtn = document.getElementById("declineBtn");
const acceptBtn = document.getElementById("acceptBtn");
const acceptAction = document.getElementById("acceptAction");
const tease = document.getElementById("tease");
const toast = document.getElementById("toast");
const audio = document.getElementById("voiceAudio");
const bars = document.getElementById("voiceBars");
const timer = document.getElementById("callTimer");
const listeningText = document.getElementById("listeningText");
const endBtn = document.getElementById("endBtn");

let declines = 0;
let seconds = 0;
let timerInterval = null;
let audioContext = null;
let ringtoneTimer = null;
let ringtoneOscillators = [];
let connected = false;

const declineMessages = [
  "Come on, don't you want to hear my voice?",
  "Just one minute… I have something sweet for you.",
  "Wow, are you really not missing me?",
  "One last chance!",
  "Looks like this button needs a little help."
];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

// A simple ringtone generated in the browser. No extra audio file is needed.
function startRingtone() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx || audioContext) return;
    audioContext = new AudioCtx();
    if (audioContext.state === "suspended") audioContext.resume();

    const playTone = () => {
      if (!audioContext || connected) return;

      [440, 554].forEach((freq) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + 0.04);
        gain.gain.setValueAtTime(0.035, audioContext.currentTime + 0.22);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.38);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + 0.4);

        ringtoneOscillators.push(osc);
      });
    };

    playTone();
    ringtoneTimer = setInterval(playTone, 1250);
  } catch (e) {
    // The ringtone is optional if the browser blocks audio playback.
  }
}

function stopRingtone() {
  if (ringtoneTimer) clearInterval(ringtoneTimer);
  ringtoneTimer = null;

  ringtoneOscillators.forEach(o => {
    try {
      o.stop();
    } catch (e) {}
  });

  ringtoneOscillators = [];
}

declineBtn.addEventListener("click", () => {
  if (connected) return;

  declines++;
  startRingtone();

  const acceptScale = Math.min(1 + declines * 0.20, 2.15);
  const declineScale = Math.max(1 - declines * 0.13, 0.48);

  acceptBtn.style.width = `${76 * acceptScale}px`;
  acceptBtn.style.height = `${76 * acceptScale}px`;
  acceptBtn.style.transform = "scale(1)";

  declineBtn.style.transform = `scale(${declineScale})`;
  declineBtn.style.opacity = String(Math.max(1 - declines * 0.12, 0.35));

  acceptAction.style.transform = `translateY(${-Math.min(declines * 5, 24)}px)`;

  tease.textContent = declineMessages[
    Math.min(declines - 1, declineMessages.length - 1)
  ];
});

function connectCall() {
  if (connected) return;

  connected = true;
  stopRingtone();

  incomingScreen.classList.remove("active");
  connectedScreen.classList.add("active");

  const backdrop = document.getElementById("coupleBackdrop");
  const testImg = new Image();

  testImg.onload = () => backdrop.classList.add("has-photo");
  testImg.src = "assets/couple.jpg";

  timerInterval = setInterval(() => {
    seconds++;

    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");

    timer.textContent = `${mm}:${ss}`;
  }, 1000);

  audio.volume = 1;

  audio.play().then(() => {
    bars.classList.add("playing");
    listeningText.textContent = "";
  }).catch(() => {
    listeningText.textContent = "Add your recording as voice.mp3 inside the assets folder.";
    showToast("Audio not found. Add voice.mp3 to the assets folder.");
  });
}

acceptBtn.addEventListener("click", connectCall);

function endCall() {
  stopRingtone();

  audio.pause();
  audio.currentTime = 0;

  bars.classList.remove("playing");

  if (timerInterval) clearInterval(timerInterval);

  listeningText.textContent = "The call has ended… but the love hasn't. ♥";

  endBtn.disabled = true;
  endBtn.style.opacity = ".55";
}

endBtn.addEventListener("click", endCall);

// Start the ringtone after the first user interaction, subject to browser audio policies.
document.addEventListener("pointerdown", () => {
  if (!connected && declines > 0) startRingtone();
}, { once: true });

const timeOptions = { hour: "2-digit", minute: "2-digit" };
document.getElementById("clock").textContent =
  new Date().toLocaleTimeString("en-US", timeOptions);

document.getElementById("connectedClock").textContent =
  new Date().toLocaleTimeString("en-US", timeOptions);
