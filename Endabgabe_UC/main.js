// Browser mag entweder SpeechRecognition oder webkitSpeechRecognition, also nehmen wir was da ist
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Sprach-Erkennung anschmeißen
const recognition = new SpeechRecognition();
recognition.lang = 'en-US'; // Sprache auf Englisch, sonst versteht der nix
recognition.continuous = true; // soll nicht nach einem Satz aufhören
recognition.interimResults = false; // wir wollen nur das endgültige Gebrabbel, kein Zwischengequatsche

let infoRequested = false; // Flag, ob der User schon „Info“ gesagt hat
let anyMarkerVisible = false; // merken, ob grad irgendein Marker sichtbar ist

// Was passiert, wenn Sprache erkannt wurde
recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase(); // das letzte Gesagte rausholen, klein machen
  console.log('Heard:', transcript); // nur zum Debuggen
  if (transcript.includes("info")) { // Wenn „info“ drin ist, dann los
    infoRequested = true;
    updateDisplay(); // Anzeige aktualisieren
  }
};

// Wenn irgendwas mit der Spracherkennung schiefgeht
recognition.onerror = (e) => {
  console.error("Speech recognition error:", e.error); // z.B. kein Mikro oder so
};

// Wenn die Spracherkennung gestartet ist
recognition.onstart = () => {
  console.log("Speech recognition started");
};

// Wenn sie aufhört (was sie gerne macht...), direkt wieder starten
recognition.onend = () => {
  console.log("Speech recognition ended, restarting...");
  recognition.start();
};

// Spracherkennung starten (wichtig!)
recognition.start();

// Hier wird alles geregelt, was angezeigt/gespielt werden soll
function updateDisplay() {
  // Marker rausholen (die AR-Dinger)
  const eagleMarker = document.querySelector("a-marker[url*='Eagle']");
  const gorillaMarker = document.querySelector("a-marker[url*='Gorilla']");

  // Die Text-Labels, die was anzeigen
  const eagleLabel = document.querySelector("#eagleLabel");
  const gorillaLabel = document.querySelector("#gorillaLabel");
  const combinedLabel = document.querySelector("#combinedLabel");

  // Die eigentlichen Textinhalte
  const eagleText = document.querySelector("#eagleText");
  const gorillaText = document.querySelector("#gorillaText");
  const combinedText = document.querySelector("#combinedText");

  // Die Audios dazu
  const eagleAudio = document.querySelector("#eagleAudio");
  const gorillaAudio = document.querySelector("#gorillaAudio");
  const combinedAudio = document.querySelector("#combinedAudio");

  // Gucken, ob Marker grad sichtbar sind (object3D kommt von AR.js / three.js)
  const eagleCurrentlyVisible = eagleMarker?.object3D.visible;
  const gorillaCurrentlyVisible = gorillaMarker?.object3D.visible;

  const currentAnyMarkerVisible = eagleCurrentlyVisible || gorillaCurrentlyVisible;

  // Wenn jetzt Marker sichtbar, vorher aber keiner: Das heißt, ein neuer Marker ist aufgetaucht
  // Dann zurücksetzen, damit er neu „Info“ sagen muss
  if (currentAnyMarkerVisible && !anyMarkerVisible) {
    infoRequested = false;
  }

  // merken für nächstes Mal
  anyMarkerVisible = currentAnyMarkerVisible;

  // Wenn noch kein „Info“ gesagt wurde, dann zeigen wir nur die „Say 'Info'...“-Texte
  if (!infoRequested) {
    combinedLabel.setAttribute("visible", false); // sicherheitshalber ausblenden

    if (eagleCurrentlyVisible && gorillaCurrentlyVisible) {
      // beide sichtbar → kombi-text
      eagleLabel.setAttribute("visible", false);
      gorillaLabel.setAttribute("visible", false);
      combinedLabel.setAttribute("visible", true);
      combinedText.setAttribute("text", { value: "Say 'Info' to learn about Eagles and Gorillas" });

      // alle Audios pausieren, nix soll labern
      eagleAudio.pause();
      gorillaAudio.pause();
      combinedAudio.pause();
    } else if (eagleCurrentlyVisible) {
      // nur Adler sichtbar
      eagleLabel.setAttribute("visible", true);
      gorillaLabel.setAttribute("visible", false);
      combinedLabel.setAttribute("visible", false);
      eagleText.setAttribute("text", { value: "Say 'Info' to learn about Eagles" });

      eagleAudio.pause();
      gorillaAudio.pause();
      combinedAudio.pause();
    } else if (gorillaCurrentlyVisible) {
      // nur Gorilla sichtbar
      eagleLabel.setAttribute("visible", false);
      gorillaLabel.setAttribute("visible", true);
      combinedLabel.setAttribute("visible", false);
      gorillaText.setAttribute("text", { value: "Say 'Info' to learn about Gorillas" });

      eagleAudio.pause();
      gorillaAudio.pause();
      combinedAudio.pause();
    } else {
      // nix sichtbar → alles aus
      eagleLabel.setAttribute("visible", false);
      gorillaLabel.setAttribute("visible", false);
      combinedLabel.setAttribute("visible", false);
      eagleAudio.pause();
      gorillaAudio.pause();
      combinedAudio.pause();
    }
    return; // hier raus, weil wir nix weiter tun müssen, wenn kein „Info“ gesagt wurde
  }

  // Wenn wir hier sind, wurde „Info“ gesagt → jetzt solls losgehen mit echtem Content

  if (eagleCurrentlyVisible && gorillaCurrentlyVisible) {
    // beide sichtbar → Kombi-Text und Kombi-Audio
    combinedLabel.setAttribute("visible", true);
    eagleLabel.setAttribute("visible", false);
    gorillaLabel.setAttribute("visible", false);
    combinedText.setAttribute("text", { value: "Eagle and Gorilla together!" });

    eagleAudio.pause();
    gorillaAudio.pause();

    // Nur abspielen, wenn es noch nicht läuft
    if (combinedAudio.paused) {
      combinedAudio.currentTime = 0;
      combinedAudio.play().catch(e => console.warn('Audio play failed:', e)); // falls Browser rummuckt
    }
  } else if (eagleCurrentlyVisible) {
    // nur Adler → Adler-Text und -Audio
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
    // nur Gorilla → Gorilla-Text und -Audio
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
    // keiner mehr sichtbar, aber „Info“ wurde schon gesagt → alles aus, aber infoRequested bleibt true
    combinedLabel.setAttribute("visible", false);
    eagleLabel.setAttribute("visible", false);
    gorillaLabel.setAttribute("visible", false);

    eagleAudio.pause();
    gorillaAudio.pause();
    combinedAudio.pause();
  }
}

// Diese Funktion wird einfach alle 500ms aufgerufen, um zu checken, was grad Sache ist
setInterval(updateDisplay, 500);
