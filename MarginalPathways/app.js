let annotationCount = 0;
let gatheredOnce = false;

const addNoteBtn = document.getElementById("addNote");
const clearNotesBtn = document.getElementById("clearNotes");
const noteForm = document.getElementById("noteForm");
const noteInput = document.getElementById("noteInput");
const submitNoteBtn = document.getElementById("submitNote");
const content = document.getElementById("content");
const centerAnchor = document.querySelector('.center-anchor');
const centerLines = centerAnchor.querySelectorAll('p');
const centerButtons = document.querySelector('.center-buttons');

let gatherBtn;

addNoteBtn.addEventListener("click", () => {
  noteForm.style.display = "block";
  noteInput.focus();
});

submitNoteBtn.addEventListener("click", () => {
  const text = noteInput.value.trim();
  if (!text) return;

  annotationCount++;

  const annotation = document.createElement("div");
  annotation.className = "annotation";
  annotation.textContent = text;

  const numberBadge = document.createElement("span");
  numberBadge.className = "annotation-number";
  numberBadge.textContent = annotationCount;
  annotation.appendChild(numberBadge);

  const contentRect = content.getBoundingClientRect();
  let randomTop, randomLeft;

  const marginChoice = Math.floor(Math.random() * 4);
  switch (marginChoice) {
    case 0: randomTop = Math.random() * contentRect.height;
            randomLeft = Math.random() * (contentRect.width * 0.2); break;
    case 1: randomTop = Math.random() * contentRect.height;
            randomLeft = contentRect.width * 0.8 + Math.random() * (contentRect.width * 0.2); break;
    case 2: randomTop = Math.random() * (contentRect.height * 0.2);
            randomLeft = Math.random() * contentRect.width; break;
    default:randomTop = contentRect.height * 0.8 + Math.random() * (contentRect.height * 0.2);
            randomLeft = Math.random() * contentRect.width; break;
  }

  annotation.style.top = `${randomTop}px`;
  annotation.style.left = `${randomLeft}px`;
  content.appendChild(annotation);
  annotation.onmousedown = dragMouseDown;

  noteInput.value = "";
  noteForm.style.display = "none";

  if (gatheredOnce) {
    drawSquigglyLine(annotation);
  }

  if (annotationCount >= 5 && !gatheredOnce) {
    centerLines.forEach(line => line.style.opacity = "0");

    if (!gatherBtn) {
      gatherBtn = document.createElement("button");
      gatherBtn.textContent = "Gather Feelings";
      gatherBtn.className = "mindmap-button";
      gatherBtn.onclick = gatherFeelings;
      centerButtons.appendChild(gatherBtn);
      requestAnimationFrame(() => gatherBtn.classList.add("show"));
    }
  } else if (!gatheredOnce) {
    const newOpacity = Math.max(0.05, 0.45 - annotationCount * 0.1);
    centerLines.forEach(line => line.style.opacity = newOpacity.toString());
  }
});

clearNotesBtn.addEventListener("click", () => {
  document.querySelectorAll(".annotation").forEach(a => a.remove());
  annotationCount = 0;
  centerLines.forEach(line => line.style.opacity = "0.45");

  const existingSVG = document.querySelector("svg.threads");
  if (existingSVG) existingSVG.remove();
  if (gatherBtn) { gatherBtn.remove(); gatherBtn = null; }

  gatheredOnce = false;

  document.querySelectorAll('.margin-left, .margin-right, .margin-top, .margin-bottom')
    .forEach(m => m.classList.remove('margins-fade'));
  document.querySelectorAll('.annotation').forEach(a => a.classList.remove('gathered'));
});

function dragMouseDown(e) {
  e.preventDefault();
  const el = this;
  const rect = el.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  let startX = e.clientX, startY = e.clientY;
  let offsetX = rect.left - contentRect.left;
  let offsetY = rect.top - contentRect.top;

  function elementDrag(e) {
    let newX = offsetX + (e.clientX - startX);
    let newY = offsetY + (e.clientY - startY);
    newX = Math.max(0, Math.min(newX, contentRect.width - rect.width));
    newY = Math.max(0, Math.min(newY, contentRect.height - rect.height));
    el.style.left = newX + "px";
    el.style.top = newY + "px";
  }
  function closeDrag() {
    document.removeEventListener("mousemove", elementDrag);
    document.removeEventListener("mouseup", closeDrag);
  }
  document.addEventListener("mousemove", elementDrag);
  document.addEventListener("mouseup", closeDrag);
}

function gatherFeelings() {
  const existingSVG = document.querySelector("svg.threads");
  if (existingSVG) existingSVG.remove();

  document.querySelectorAll('.margin-left, .margin-right, .margin-top, .margin-bottom')
    .forEach(m => m.classList.add('margins-fade'));
  document.querySelectorAll('.annotation').forEach(a => a.classList.add('gathered'));

  centerLines[0].style.opacity = "0";
  setTimeout(() => {
    centerLines[0].style.opacity = "0.45";
  }, 50);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "threads");
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.pointerEvents = "none";

  const contentRect = content.getBoundingClientRect();
  const centerX = contentRect.width / 2;
  const centerY = contentRect.height / 2;

  document.querySelectorAll(".annotation").forEach(a => {
    const rect = a.getBoundingClientRect();
    const x = rect.left - contentRect.left + rect.width / 2;
    const y = rect.top - contentRect.top + rect.height / 2;

    const midX = (centerX + x) / 2 + (Math.random() * 60 - 30);
    const midY = (centerY + y) / 2 + (Math.random() * 60 - 30);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${centerX} ${centerY} Q ${midX} ${midY} ${x} ${y}`);
    path.setAttribute("stroke", "#888");
    path.setAttribute("stroke-width", "1");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-opacity", "0.6");
    svg.appendChild(path);

    const mark = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    mark.setAttribute("cx", x);
    mark.setAttribute("cy", y);
    mark.setAttribute("r", 3 + Math.random() * 2);
    mark.setAttribute("fill", "#888");
    mark.setAttribute("opacity", "0.7");
    svg.appendChild(mark);

    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.transition = "stroke-dashoffset 1.5s ease";
    setTimeout(() => path.style.strokeDashoffset = "0", 50);
  });

  content.appendChild(svg);

  gatheredOnce = true;
  if (gatherBtn) {
    gatherBtn.textContent = "Gather More";
  }
}

// ---- Curvy squiggly lines for new notes after gather ----
function drawSquigglyLine(el) {
  const svg = document.querySelector("svg.threads");
  if (!svg) return;

  const contentRect = content.getBoundingClientRect();
  const centerX = contentRect.width / 2;
  const centerY = contentRect.height / 2;
  const rect = el.getBoundingClientRect();
  const x = rect.left - contentRect.left + rect.width / 2;
  const y = rect.top - contentRect.top + rect.height / 2;

  const segments = 12; // many small bends for squiggle
  const dx = (x - centerX) / segments;
  const dy = (y - centerY) / segments;
  let pathD = `M ${centerX} ${centerY}`;
  let px = centerX, py = centerY;

  for (let i = 1; i <= segments; i++) {
    const nx = centerX + dx * i;
    const ny = centerY + dy * i;
    const direction = i % 2 === 0 ? 1 : -1;
    const ctrlX = px + dx / 2 + direction * (Math.random() * 60 + 40);
    const ctrlY = py + dy / 2 + direction * (Math.random() * 60 + 40);
    pathD += ` Q ${ctrlX} ${ctrlY} ${nx} ${ny}`;
    px = nx; py = ny;
  }

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathD);
  path.setAttribute("stroke", "#888");
  path.setAttribute("stroke-width", "1");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-opacity", "0.6");
  svg.appendChild(path);

  const mark = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  mark.setAttribute("cx", x);
  mark.setAttribute("cy", y);
  mark.setAttribute("r", 3 + Math.random() * 2);
  mark.setAttribute("fill", "#888");
  mark.setAttribute("opacity", "0.7");
  svg.appendChild(mark);

  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;
  path.style.transition = "stroke-dashoffset 1.5s ease";
  setTimeout(() => path.style.strokeDashoffset = "0", 50);
}
