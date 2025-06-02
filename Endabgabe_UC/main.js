window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = 'en-US'; // oder 'de-DE'
recognition.continuous = true;
recognition.interimResults = false;

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
  console.log('Heard:', transcript);

  if (transcript.includes("info")) {
    const eagleText = document.querySelector("#eagleText");
    if (eagleText) {
      eagleText.setAttribute("text", {
        value: "Eagles have amazing eyesight and can spot prey from 2km."
      });
    }

    const audio = document.querySelector("#eagleAudio");
  if (audio) {
    audio.play().catch(e => console.error("Audio error:", e));
  }

  }
};

recognition.onerror = (event) => {
  console.error('Speech recognition error:', event.error);
};

recognition.start();