window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = true;
recognition.interimResults = false;

let infoRequested = false;

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
  console.log('Heard:', transcript);
  if (transcript.includes("info")) {
    infoRequested = true;
    updateDisplay();
  }
};

recognition.onerror = (e) => console.error("Speech recognition error:", e.error);
recognition.onend = () => recognition.start();
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
    // Wenn kein "info" gesagt wurde, alles ausblenden & Audio stoppen
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

    combinedAudio.currentTime = 0;
    combinedAudio.play();
  } else if (eagleMarker?.object3D.visible) {
    combinedLabel.setAttribute("visible", false);
    eagleLabel.setAttribute("visible", true);
    gorillaLabel.setAttribute("visible", false);

    const eagleText = document.querySelector("#eagleText");
    eagleText.setAttribute("text", {value: "Eagles have amazing eyesight and can spot prey from 2km."});

    eagleAudio.currentTime = 0;
    eagleAudio.play();

    gorillaAudio.pause();
    combinedAudio.pause();
  } else if (gorillaMarker?.object3D.visible) {
    combinedLabel.setAttribute("visible", false);
    eagleLabel.setAttribute("visible", false);
    gorillaLabel.setAttribute("visible", true);

    const gorillaText = document.querySelector("#gorillaText");
    gorillaText.setAttribute("text", {value: "Gorillas live in families and are very intelligent animals."});

    gorillaAudio.currentTime = 0;
    gorillaAudio.play();

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

// Update alle 500ms, um Marker-Sichtbarkeit zu prüfen
setInterval(() => {
  if(infoRequested) updateDisplay();
}, 500);
