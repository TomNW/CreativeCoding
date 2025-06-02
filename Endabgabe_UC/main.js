window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US'; // Oder 'de-DE'
recognition.continuous = true;
recognition.interimResults = false;

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
  console.log('Heard:', transcript);

  if (transcript.includes("info")) {
    // Eagle
    const eagleMarker = document.querySelector("a-marker[url*='Eagle']");
    if (eagleMarker?.object3D.visible) {
      const eagleText = document.querySelector("#eagleText");
      if (eagleText) {
        eagleText.setAttribute("text", {
          value: "Eagles have amazing eyesight and can spot prey from 2km."
        });
      }
      const eagleAudio = document.querySelector("#eagleAudio");
      eagleAudio?.play();
    }

    // Gorilla
    const gorillaMarker = document.querySelector("a-marker[url*='Gorilla']");
    if (gorillaMarker?.object3D.visible) {
      const gorillaText = document.querySelector("#gorillaText");
      if (gorillaText) {
        gorillaText.setAttribute("text", {
          value: "Gorillas live in families and are very intelligent animals."
        });
      }
      const gorillaAudio = document.querySelector("#gorillaAudio");
      gorillaAudio?.play();
    }
  }
};

recognition.onerror = (e) => console.error("Speech recognition error:", e.error);
recognition.onend = () => recognition.start(); // Autorestart bei Unterbrechung
recognition.start();
