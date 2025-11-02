const canvasContainer = document.getElementById('canvasContainer');
const colorInput = document.getElementById('color');
const thicknessInput = document.getElementById('thickness');
const opacityInput = document.getElementById('opacity');
const layerList = document.getElementById('layerList');
const addLayerBtn = document.getElementById('addLayer');
const removeLayerBtn = document.getElementById('removeLayer');
const toolIcons = document.querySelectorAll('.tool');

let layers = [];
let activeLayer = 0;
let activeTool = 'brush';

// Tool icon UI
toolIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    toolIcons.forEach(i => i.classList.remove('active'));
    icon.classList.add('active');
    activeTool = icon.dataset.tool;
  });
});
toolIcons[0].classList.add('active');

// Layer logic
function createCanvasLayer() {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 600;
  canvas.style.zIndex = layers.length;
  canvasContainer.appendChild(canvas);
  layers.push(canvas);
  setActiveLayer(layers.length - 1);
  attachListeners(canvas);
}

function setActiveLayer(index) {
  activeLayer = index;
  updateLayerList();
}

function addLayer() {
  createCanvasLayer();
}

function removeLayer() {
  if (layers.length > 1) {
    canvasContainer.removeChild(layers[activeLayer]);
    layers.splice(activeLayer, 1);
    setActiveLayer(Math.max(0, activeLayer - 1));
  }
}

function updateLayerList() {
  layerList.innerHTML = '';
  layers.forEach((_, i) => {
    const li = document.createElement('li');
    li.innerText = `Layer ${i + 1}`;
    li.className = i === activeLayer ? 'active' : '';
    li.onclick = () => setActiveLayer(i);
    layerList.appendChild(li);
  });
}

// Drawing logic
let drawing = false, startX, startY;

function getCtx() {
  const canvas = layers[activeLayer];
  const ctx = canvas.getContext('2d');
  ctx.globalAlpha = parseFloat(opacityInput.value);
  ctx.lineWidth = thicknessInput.value;
  ctx.strokeStyle = activeTool === 'eraser' ? '#fff' : colorInput.value;
  ctx.fillStyle = colorInput.value;
  ctx.lineCap = 'round';
  return ctx;
}

function mousedown(e) {
  drawing = true;
  startX = e.offsetX;
  startY = e.offsetY;
  if (activeTool === 'brush' || activeTool === 'eraser') {
    const ctx = getCtx();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }
}
function mousemove(e) {
  if (!drawing) return;
  const x = e.offsetX, y = e.offsetY;
  const ctx = getCtx();
  if (activeTool === 'brush' || activeTool === 'eraser') {
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}
function mouseup(e) {
  if (!drawing) return;
  drawing = false;
  const x = e.offsetX, y = e.offsetY;
  const ctx = getCtx();
  if (activeTool === 'rectangle') {
    ctx.globalAlpha = parseFloat(opacityInput.value);
    ctx.lineWidth = thicknessInput.value;
    ctx.strokeStyle = colorInput.value;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  } else if (activeTool === 'circle') {
    ctx.globalAlpha = parseFloat(opacityInput.value);
    ctx.lineWidth = thicknessInput.value;
    ctx.strokeStyle = colorInput.value;
    ctx.beginPath();
    const r = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
    ctx.arc(startX, startY, r, 0, Math.PI * 2);
    ctx.stroke();
  } else if (activeTool === 'line') {
    ctx.globalAlpha = parseFloat(opacityInput.value);
    ctx.lineWidth = thicknessInput.value;
    ctx.strokeStyle = colorInput.value;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
  } else if (activeTool === 'fill') {
    // Simple fill: fill full canvas, for demo
    ctx.globalAlpha = parseFloat(opacityInput.value);
    ctx.fillStyle = colorInput.value;
    ctx.fillRect(0, 0, layers[activeLayer].width, layers[activeLayer].height);
  }
}

function attachListeners(canvas) {
  canvas.onmousedown = mousedown;
  canvas.onmousemove = mousemove;
  canvas.onmouseup = mouseup;
  canvas.onmouseleave = () => drawing = false;
}

function init() {
  layers = [];
  canvasContainer.innerHTML = '';
  createCanvasLayer();
}

init();

addLayerBtn.onclick = addLayer;
removeLayerBtn.onclick = removeLayer;