const canvas = document.getElementById("drawCanvas");
  const ctx = canvas.getContext("2d");
  const colorPicker = document.getElementById("colorPicker");
  const brushSize = document.getElementById("brushSize");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let drawing = false;

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    draw(e);
    playBrushSound();
  });

  canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.beginPath();
  });

  canvas.addEventListener("mousemove", (e) => {
    if (drawing) {
      draw(e);
      playBrushSound();
    }
  });

  function draw(e) {
    if (!drawing) return;

    ctx.lineWidth = brushSize.value;
    ctx.lineCap = "round";
    ctx.strokeStyle = colorPicker.value;

    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
  }

  function playBrushSound() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Frequenz leicht variieren je nach Pinselgröße
    osc.frequency.value = 200 + parseInt(brushSize.value) * 10;
    osc.type = "sine"; // Oder: "triangle", "square", "sawtooth"

    gain.gain.setValueAtTime(0.05, audioCtx.currentTime); // sehr leise
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  // Icons klicken -> Eingabefeld auslösen
document.getElementById("colorBtn").addEventListener("click", () => {
  document.getElementById("colorPicker").click();
});
document.getElementById("brushBtn").addEventListener("click", () => {
  document.getElementById("brushSize").click();
});

const brushBtn = document.getElementById("brushBtn");
const brushSizeInput = document.getElementById("brushSize");

brushBtn.addEventListener("click", (e) => {
  brushSizeInput.classList.toggle("visible");
});

document.addEventListener("click", (e) => {
  if (!brushBtn.contains(e.target) && e.target !== brushSizeInput) {
    brushSizeInput.classList.remove("visible");
  }
});
