window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = true;
recognition.interimResults = false;

let infoRequested = false;
let isRecognitionActive = false;

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
  console.log('Heard:', transcript);
  if (transcript.includes("info")) {
    infoRequested = true;
    updateDisplay();
  }
};

recognition.onerror = (e) => {
  console.error("Speech recognition error:", e.error);
  isRecognitionActive = false; // Fehler → Erkennung als gestoppt markieren
};

recognition.onstart = () => {
  console.log("Speech recognition started");
  isRecognitionActive = true; // Erkennung läuft
};

recognition.onend = () => {
  console.log("Speech recognition ended");
  if (isRecognitionActive) {
    console.log("Restarting recognition...");
    recognition.start();
  } else {
    console.log("Not restarting recognition due to previous error");
  }
};

recognition.start();

function updateDisplay() {
  const eagleMarker = document.querySelector("a-marker[url*='Eagle']");
  const gorillaMarker = document.querySelector("a-marker[url*='Gorilla']");

  const eagleLabel = document.querySelector("#eagleLabel");
  const gorillaLabel = document.querySelector("#gorillaLabel");
  const combinedLabel = document.querySelector("#combinedLabel");

  const eagleAudio = document.querySelector("#eagleAudio");
  const gorillaAudio = document.querySelector("#gorillaAudio");
  const combinedAudio = document.querySelector("#combinedAudio");

  if (!infoRequested) {
    eagleLabel.setAttribute("visible", false);
    gorillaLabel.setAttribute("visible", false);
    combinedLabel.setAttribute("visible", false);
    eagleAudio.pause();
    gorillaAudio.pause();
    combinedAudio.pause();
    return;
  }

  if (eagleMarker?.object3D.visible && gorillaMarker?.object3D.visible) {
    combinedLabel.setAttribute("visible", true);
    eagleLabel.setAttribute("visible", false);
    gorillaLabel.setAttribute("visible", false);

    eagleAudio.pause();
    gorillaAudio.pause();

    if (combinedAudio.paused) {
      combinedAudio.currentTime = 0;
      combinedAudio.play();
    }
  } else if (eagleMarker?.object3D.visible) {
    combinedLabel.setAttribute("visible", false);
    eagleLabel.setAttribute("visible", true);
    gorillaLabel.setAttribute("visible", false);

    const eagleText = document.querySelector("#eagleText");
    eagleText.setAttribute("text", {value: "Eagles have amazing eyesight and can spot prey from 2km."});

    if (eagleAudio.paused) {
      eagleAudio.currentTime = 0;
      eagleAudio.play();
    }

    gorillaAudio.pause();
    combinedAudio.pause();
  } else if (gorillaMarker?.object3D.visible) {
    combinedLabel.setAttribute("visible", false);
    eagleLabel.setAttribute("visible", false);
    gorillaLabel.setAttribute("visible", true);

    const gorillaText = document.querySelector("#gorillaText");
    gorillaText.setAttribute("text", {value: "Gorillas live in families and are very intelligent animals."});

    if (gorillaAudio.paused) {
      gorillaAudio.currentTime = 0;
      gorillaAudio.play();
    }

    eagleAudio.pause();
    combinedAudio.pause();
  } else {
    combinedLabel.setAttribute("visible", false);
    eagleLabel.setAttribute("visible", false);
    gorillaLabel.setAttribute("visible", false);

    eagleAudio.pause();
    gorillaAudio.pause();
    combinedAudio.pause();
  }
}

setInterval(() => {
  if(infoRequested) updateDisplay();
}, 500);
