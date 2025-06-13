window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = true;
recognition.interimResults = false;

let infoRequested = false;
let anyMarkerVisible = false; // Merk-Flag, ob aktuell ein Marker sichtbar ist

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
};

recognition.onstart = () => {
  console.log("Speech recognition started");
};

recognition.onend = () => {
  console.log("Speech recognition ended, restarting...");
  recognition.start();
};

recognition.start();

function updateDisplay() {
  const eagleMarker = document.querySelector("a-marker[url*='Eagle']");
  const gorillaMarker = document.querySelector("a-marker[url*='Gorilla']");

  const eagleLabel = document.querySelector("#eagleLabel");
  const gorillaLabel = document.querySelector("#gorillaLabel");
  const combinedLabel = document.querySelector("#combinedLabel");

  const eagleText = document.querySelector("#eagleText");
  const gorillaText = document.querySelector("#gorillaText");
  const combinedText = document.querySelector("#combinedText");

  const eagleAudio = document.querySelector("#eagleAudio");
  const gorillaAudio = document.querySelector("#gorillaAudio");
  const combinedAudio = document.querySelector("#combinedAudio");

  const eagleCurrentlyVisible = eagleMarker?.object3D.visible;
  const gorillaCurrentlyVisible = gorillaMarker?.object3D.visible;

  const currentAnyMarkerVisible = eagleCurrentlyVisible || gorillaCurrentlyVisible;

  // Wenn Marker gerade sichtbar ist und vorher keiner sichtbar war,
  // dann wurde ein Marker neu erkannt — infoRequested zurücksetzen:
  if (currentAnyMarkerVisible && !anyMarkerVisible) {
    infoRequested = false;
  }

  // Status merken für nächstes Update:
  anyMarkerVisible = currentAnyMarkerVisible;

  if (!infoRequested) {
    combinedLabel.setAttribute("visible", false);

    if (eagleCurrentlyVisible && gorillaCurrentlyVisible) {
      eagleLabel.setAttribute("visible", false);
      gorillaLabel.setAttribute("visible", false);
      combinedLabel.setAttribute("visible", true);
      combinedText.setAttribute("text", { value: "Say 'Info' to learn about Eagles and Gorillas" });
      eagleAudio.pause();
      gorillaAudio.pause();
      combinedAudio.pause();
    } else if (eagleCurrentlyVisible) {
      eagleLabel.setAttribute("visible", true);
      gorillaLabel.setAttribute("visible", false);
      combinedLabel.setAttribute("visible", false);
      eagleText.setAttribute("text", { value: "Say 'Info' to learn about Eagles" });
      eagleAudio.pause();
      gorillaAudio.pause();
      combinedAudio.pause();
    } else if (gorillaCurrentlyVisible) {
      eagleLabel.setAttribute("visible", false);
      gorillaLabel.setAttribute("visible", true);
      combinedLabel.setAttribute("visible", false);
      gorillaText.setAttribute("text", { value: "Say 'Info' to learn about Gorillas" });
      eagleAudio.pause();
      gorillaAudio.pause();
      combinedAudio.pause();
    } else {
      eagleLabel.setAttribute("visible", false);
      gorillaLabel.setAttribute("visible", false);
      combinedLabel.setAttribute("visible", false);
      eagleAudio.pause();
      gorillaAudio.pause();
      combinedAudio.pause();
    }
    return;
  }

  // Info wurde gesagt — also Detailinfo und Audio anzeigen/spielen:
  if (eagleCurrentlyVisible && gorillaCurrentlyVisible) {
    combinedLabel.setAttribute("visible", true);
    eagleLabel.setAttribute("visible", false);
    gorillaLabel.setAttribute("visible", false);
    combinedText.setAttribute("text", { value: "Eagle and Gorilla together!" });

    eagleAudio.pause();
    gorillaAudio.pause();

    if (combinedAudio.paused) {
      combinedAudio.currentTime = 0;
      combinedAudio.play().catch(e => console.warn('Audio play failed:', e));
    }
  } else if (eagleCurrentlyVisible) {
    combinedLabel.setAttribute("visible", false);
    eagleLabel.setAttribute("visible", true);
    gorillaLabel.setAttribute("visible", false);
    eagleText.setAttribute("text", { value: "Eagles have amazing eyesight and can spot prey from 2km." });

    if (eagleAudio.paused) {
      eagleAudio.currentTime = 0;
      eagleAudio.play().catch(e => console.warn('Audio play failed:', e));
    }
    gorillaAudio.pause();
    combinedAudio.pause();
  } else if (gorillaCurrentlyVisible) {
    combinedLabel.setAttribute("visible", false);
    eagleLabel.setAttribute("visible", false);
    gorillaLabel.setAttribute("visible", true);
    gorillaText.setAttribute("text", { value: "Gorillas live in families and are very intelligent animals." });

    if (gorillaAudio.paused) {
      gorillaAudio.currentTime = 0;
      gorillaAudio.play().catch(e => console.warn('Audio play failed:', e));
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
    // infoRequested NICHT zurücksetzen, erst wenn Marker neu erscheint
  }
}

setInterval(updateDisplay, 500);
