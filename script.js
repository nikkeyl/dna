let scene, camera, renderer, holder, dnaObject, controls;
let isRNAMode = false;
let currentDNAForm = "B";
let replicationActive = false;

const codonMap = {
  GCU: "Ala",
  GCC: "Ala",
  GCA: "Ala",
  GCG: "Ala",
  CGU: "Arg",
  CGC: "Arg",
  CGA: "Arg",
  CGG: "Arg",
  AGA: "Arg",
  AGG: "Arg",
  AAU: "Asn",
  AAC: "Asn",
  GAU: "Asp",
  GAC: "Asp",
  UGU: "Cys",
  UGC: "Cys",
  CAA: "Gln",
  CAG: "Gln",
  GAA: "Glu",
  GAG: "Glu",
  GGU: "Gly",
  GGC: "Gly",
  GGA: "Gly",
  GGG: "Gly",
  CAU: "His",
  CAC: "His",
  AUU: "Ile",
  AUC: "Ile",
  AUA: "Ile",
  UUA: "Leu",
  UUG: "Leu",
  CUU: "Leu",
  CUC: "Leu",
  CUA: "Leu",
  CUG: "Leu",
  AAA: "Lys",
  AAG: "Lys",
  AUG: "Met (Start)",
  UUU: "Phe",
  UUC: "Phe",
  CCU: "Pro",
  CCC: "Pro",
  CCA: "Pro",
  CCG: "Pro",
  UCU: "Ser",
  UCC: "Ser",
  UCA: "Ser",
  UCG: "Ser",
  AGU: "Ser",
  AGC: "Ser",
  ACU: "Thr",
  ACC: "Thr",
  ACA: "Thr",
  ACG: "Thr",
  UGG: "Trp",
  UAU: "Tyr",
  GUA: "Val",
  GUC: "Val",
  GUG: "Val",
  GUU: "Val",
  UAA: "Stop",
  UAG: "Stop",
  UGA: "Stop",
};

const nucleotideColors = {
  A: 0x008000,
  T: 0x0000ff,
  U: 0x0000ff,
  C: 0xffa500,
  G: 0xff0000,
};

let complementaryMap = {
  A: "T",
  T: "A",
  C: "G",
  G: "C",
};

const complementaryMapRNA = {
  A: "U",
  U: "A",
  C: "G",
  G: "C",
};

class Nucleotide {
  constructor(type) {
    this.type = type.toUpperCase();
  }

  bind(partnerNucleotide) {
    if (isRNAMode) {
      return complementaryMapRNA[this.type] === partnerNucleotide.type;
    } else {
      return complementaryMap[this.type] === partnerNucleotide.type;
    }
  }
}

class DNA {
  constructor() {
    this.strand1 = [];
    this.strand2 = [];
  }

  build(sequence1, sequence2) {
    this.strand1 = [];
    this.strand2 = [];

    if (sequence1.length !== sequence2.length || sequence1.length === 0)
      return false;

    const validChars = isRNAMode ? /^[UACG\n]+$/i : /^[TACG\n]+$/i;

    if (!validChars.test(sequence1) || !validChars.test(sequence2))
      return false;

    const nucleotidesPresent = new Set();

    for (let i = 0; i < sequence1.length; i++) {
      const nucleotide1 = new Nucleotide(sequence1[i]);
      const nucleotide2 = new Nucleotide(sequence2[i]);

      nucleotidesPresent.add(nucleotide1.type);
      nucleotidesPresent.add(nucleotide2.type);

      if (!nucleotide1.bind(nucleotide2)) return false;

      this.strand1.push(nucleotide1);
      this.strand2.push(nucleotide2);
    }

    if (nucleotidesPresent.size < 4) return false;

    return true;
  }
}

const initializeThreeEnvironment = () => {
  const container = document.getElementById("three-canvas-container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  camera.position.z = 50;

  const light = new THREE.PointLight(0xffffff, 1, 100);

  light.position.set(10, 20, 30);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 20;
  controls.maxDistance = 150;

  const resizeObserver = new ResizeObserver(() => onWindowResize());

  resizeObserver.observe(container);

  animate();
};

const onWindowResize = () => {
  const container = document.getElementById("three-canvas-container");

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
};

const animate = () => {
  requestAnimationFrame(animate);

  if (holder) {
    holder.rotation.y += 0.01;
  }

  controls.update();
  renderer.render(scene, camera);
};

const drawDNA = (dnaInstance) => {
  let currentScene = scene;
  let currentHolder;

  if (holder) {
    scene.remove(holder);
  }

  currentHolder = new THREE.Object3D();
  holder = currentHolder;

  if (!dnaInstance || dnaInstance.strand1.length === 0) {
    return;
  }

  const backboneRadius = 0.4;

  let pitch = 2;
  let angleStep = Math.PI / 5;
  let baseNucleotideRadius = 3;
  let backboneHeight = 2.0;

  if (!isRNAMode) {
    if (currentDNAForm === "A") {
      pitch = 1.5;
      angleStep = Math.PI / 5.5;
      baseNucleotideRadius = 3.6;
      backboneHeight = 1.6;
    } else if (currentDNAForm === "Z") {
      pitch = 2.2;
      angleStep = -Math.PI / 6;
      baseNucleotideRadius = 2.7;
      backboneHeight = 2.3;
    }
  }

  const tubeGeometry = new THREE.CylinderGeometry(
    backboneRadius,
    backboneRadius,
    backboneHeight,
    16,
  );
  const backboneMaterial1 = new THREE.MeshPhongMaterial({
    color: 0xffffff,
  });
  const backboneMaterial2 = new THREE.MeshPhongMaterial({
    color: 0xffffff,
  });

  const numNucleotides = dnaInstance.strand1.length;

  for (let i = 0; i < numNucleotides; i++) {
    const y = i * pitch - (numNucleotides * pitch) / 2;
    const angle = i * angleStep;
    const nucleotide1 = dnaInstance.strand1[i];
    const nucleotide2 = dnaInstance.strand2[i];
    const color1 = nucleotideColors[nucleotide1.type];
    const color2 = nucleotideColors[nucleotide2.type];
    const position1AtY = new THREE.Vector3(
      baseNucleotideRadius * Math.cos(angle),
      y,
      baseNucleotideRadius * Math.sin(angle),
    );
    const position2AtY = new THREE.Vector3(
      -baseNucleotideRadius * Math.cos(angle),
      y,
      -baseNucleotideRadius * Math.sin(angle),
    );

    if (i < numNucleotides - 1) {
      const nextY = (i + 1) * pitch - (numNucleotides * pitch) / 2;
      const nextAngle = (i + 1) * angleStep;
      const position1NextY = new THREE.Vector3(
        baseNucleotideRadius * Math.cos(nextAngle),
        nextY,
        baseNucleotideRadius * Math.sin(nextAngle),
      );
      const position2NextY = new THREE.Vector3(
        -baseNucleotideRadius * Math.cos(nextAngle),
        nextY,
        -baseNucleotideRadius * Math.sin(nextAngle),
      );

      const tube1 = new THREE.Mesh(tubeGeometry, backboneMaterial1);

      tube1.position.copy(position1AtY).add(position1NextY).divideScalar(2);
      tube1.lookAt(position1NextY);
      tube1.rotateX(Math.PI / 2);
      tube1.userData.isTube1 = true;
      currentHolder.add(tube1);

      if (!isRNAMode) {
        const tube2 = new THREE.Mesh(tubeGeometry, backboneMaterial2);

        tube2.position.copy(position2AtY).add(position2NextY).divideScalar(2);
        tube2.lookAt(position2NextY);
        tube2.rotateX(Math.PI / 2);
        tube2.userData.isTube2 = true;
        currentHolder.add(tube2);
      }
    }

    const halfRungLength = isRNAMode
      ? baseNucleotideRadius * 0.8
      : baseNucleotideRadius;
    const halfRungRadius = 0.5;
    const halfRungGeometry = new THREE.CylinderGeometry(
      halfRungRadius,
      halfRungRadius,
      halfRungLength,
      32,
    );
    const rungMaterial1 = new THREE.MeshPhongMaterial({ color: color1 });
    const rungHalf1 = new THREE.Mesh(halfRungGeometry, rungMaterial1);

    rungHalf1.position.set(
      (halfRungLength / 2) * Math.cos(angle),
      y,
      (halfRungLength / 2) * Math.sin(angle),
    );
    rungHalf1.lookAt(position1AtY);
    rungHalf1.rotateX(Math.PI / 2);
    rungHalf1.userData.isRung1 = true;
    currentHolder.add(rungHalf1);

    if (!isRNAMode) {
      const rungMaterial2 = new THREE.MeshPhongMaterial({ color: color2 });
      const rungHalf2 = new THREE.Mesh(halfRungGeometry, rungMaterial2);

      rungHalf2.position.set(
        (-halfRungLength / 2) * Math.cos(angle),
        y,
        (-halfRungLength / 2) * Math.sin(angle),
      );
      rungHalf2.lookAt(position2AtY);
      rungHalf2.rotateX(Math.PI / 2);
      rungHalf2.userData.isRung2 = true;
      currentHolder.add(rungHalf2);
    }
  }

  currentScene.add(currentHolder);
  camera.position.z = Math.max(50, numNucleotides * pitch * 1.5);
};

const clearCanvas = () => {
  if (holder) {
    scene.remove(holder);
    holder = null;
    dnaObject = null;
  }
};

const calculateStability = (dna) => {
  return dna.strand1.filter((n) => n.type === "G" || n.type === "C").length;
};

const getLifespan = (strengthScore) => {
  if (strengthScore <= 1) return "less than 10 years";
  if (strengthScore <= 3) return "100 - 1000 years";
  if (strengthScore <= 5) return "10 thousand years";
  if (strengthScore <= 7) return "1 million years";
  if (strengthScore <= 9) return "100 million years";
  if (strengthScore === 10) return "10 billion years";

  return "Unknown";
};

const updateInfoPanel = (dna, message) => {
  const infoPanel = document.getElementById("infoPanel");
  const aminoPanel = document.getElementById("aminoPanel");

  if (!infoPanel || !aminoPanel) return;

  infoPanel.className =
    "mt-4 p-4 rounded-xl font-medium text-center text-sm transition-all transform opacity-100 scale-100";
  aminoPanel.className =
    "hidden mt-2 p-3 bg-purple-50 text-purple-800 rounded-xl text-center text-sm transition-all";

  if (dna?.strand1?.length === 0 || !dna) {
    infoPanel.innerHTML = message;
    infoPanel.classList.add("bg-red-50", "border-red-200", "text-red-700");
  } else {
    const stability = calculateStability(dna);
    const length = dna.strand1.length;
    const strengthScore = Math.round((stability / length) * 10);
    const guaninesCytosinesPercentage = Math.round((stability / length) * 100);
    const meltingTemperature =
      length < 14
        ? (length - stability) * 2 + stability * 4
        : Math.round(64.9 + (41 * (stability - 16.4)) / length);

    let colorClasses = "bg-green-50 border-green-200 text-green-700";

    if (strengthScore <= 3)
      colorClasses = "bg-red-50 border-red-200 text-red-700";
    else if (strengthScore <= 7)
      colorClasses = "bg-amber-50 border-amber-200 text-amber-700";

    infoPanel.innerHTML = `${message} <br>
      Stability: ${strengthScore}/10 | GC-Content: ${guaninesCytosinesPercentage}% | Tm: ${meltingTemperature}°C<br>
      Estimated lifespan: ${getLifespan(strengthScore)}`;

    colorClasses.split(" ").forEach((cls) => infoPanel.classList.add(cls));

    const sequence = dna.strand1.map((n) => n.type).join("");
    const rnaSequence = isRNAMode ? sequence : sequence.replace(/T/g, "U");
    const codons = rnaSequence.match(/.{1,3}/g);

    if (codons && codons.length > 0) {
      const aminoAcids = codons.map((c) => {
        if (c.length < 3) return `<span class="opacity-50">(${c})</span>`;
        return `<span class="font-bold shrink-0">${codonMap[c] || "?"}</span>`;
      });

      aminoPanel.innerHTML = `<strong>Amino Acids translated:</strong><div class="mt-2 flex flex-wrap gap-2 text-xs justify-center">${aminoAcids.join(" ➔ ")}</div>`;
      aminoPanel.style.display = "block";
    }
  }

  infoPanel.style.display = "block";
};

const downloadDNA = (dnaInstance, strengthScore, filename) => {
  const sequence1 = dnaInstance.strand1.map((n) => n.type).join("");
  const sequence2 = dnaInstance.strand2.map((n) => n.type).join("");
  const lifespan = getLifespan(strengthScore);
  const modeName = isRNAMode ? "RNA" : "DNA";
  const content = `---
${modeName} Search Result
---

Found ${modeName} with stability: ${strengthScore}/10
Estimated lifespan: ${lifespan}

Chain 1: ${sequence1}
Chain 2: ${sequence2}

This ${modeName} has high stability due to a large number of guanine-cytosine (G-C) pairs.`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const handleDNAStrength = (dnaInstance, message) => {
  const stability = calculateStability(dnaInstance);
  const strengthScore = Math.round(
    (stability / dnaInstance.strand1.length) * 10,
  );

  updateInfoPanel(dnaInstance, message);

  if (strengthScore === 10) {
    downloadDNA(
      dnaInstance,
      strengthScore,
      `${isRNAMode ? "RNA" : "DNA"}_Strength_10.txt`,
    );
  }
};

const showScrollDownButton = () => {
  const button = document.getElementById("scrollDownButton");

  if (button && window.innerWidth < 768) {
    button.classList.remove("hidden");
    button.classList.add("flex");
    setTimeout(() => {
      button.classList.add("hidden");
      button.classList.remove("flex");
    }, 4000);
  }
};

const buildAndVisualizeDNA = () => {
  const sequence1Input = document
    .getElementById("sequence1")
    .value.toUpperCase();
  const sequence2Input = document
    .getElementById("sequence2")
    .value.toUpperCase();
  const myDNA = new DNA();
  const isValid = myDNA.build(sequence1Input, sequence2Input);

  if (isValid) {
    drawDNA(myDNA);

    const modeName = isRNAMode ? "RNA" : "DNA";

    handleDNAStrength(myDNA, `${modeName} built successfully!`);

    const singleView = document.getElementById("single-dna-view");
    const comparisonView = document.getElementById("comparison-view");
    const listView = document.getElementById("list-view");

    if (singleView) {
      singleView.classList.remove("hidden");
      singleView.classList.add("flex");
    }

    if (comparisonView) {
      comparisonView.classList.remove("flex");
      comparisonView.classList.add("hidden");
    }

    if (listView) {
      listView.classList.remove("flex");
      listView.classList.add("hidden");
    }

    showScrollDownButton();
  } else {
    clearCanvas();
    updateInfoPanel(
      null,
      "Error! Sequences are not complementary, have different lengths, do not contain all 4 nucleotides, or contain invalid characters.",
    );
  }
};

const generateHumanGenomeDNA = (length) => {
  const probabilities = isRNAMode
    ? { A: 0.2953, U: 0.2957, G: 0.2046, C: 0.2044 }
    : { A: 0.2953, T: 0.2957, G: 0.2046, C: 0.2044 };

  const nucleotides = [];

  let cumulativeProbability = 0;

  for (const type in probabilities) {
    cumulativeProbability += probabilities[type];
    nucleotides.push({ type, cumulativeProbability });
  }

  const strand1 = [];
  const foundNucleotides = new Set();

  let attempts = 0;

  const maxAttempts = 10000;

  while (foundNucleotides.size < 4 && attempts < maxAttempts) {
    const tempStrand = [];

    foundNucleotides.clear();

    for (let i = 0; i < length; i++) {
      const rand = Math.random();

      let chosenNucleotide;

      for (const n of nucleotides) {
        if (rand < n.cumulativeProbability) {
          chosenNucleotide = n.type;

          break;
        }
      }

      tempStrand.push(chosenNucleotide);
      foundNucleotides.add(chosenNucleotide);
    }

    if (foundNucleotides.size === 4) {
      strand1.push(...tempStrand);
    }

    attempts++;
  }

  if (foundNucleotides.size < 4) {
    return null;
  }

  const strand2 = strand1.map((n) =>
    isRNAMode ? complementaryMapRNA[n] : complementaryMap[n],
  );

  return {
    strand1: strand1.join(""),
    strand2: strand2.join(""),
  };
};

const generateAndVisualizeStrongestDNA = () => {
  const numGenerations = 10000;
  const dnaLength = 15;

  let strongestDNA = null;
  let maxStability = -1;

  const strongestSequences = { strand1: "", strand2: "" };

  for (let i = 0; i < numGenerations; i++) {
    const sequences = generateHumanGenomeDNA(dnaLength);

    if (!sequences) continue;

    const tempDNA = new DNA();

    if (tempDNA.build(sequences.strand1, sequences.strand2)) {
      const stability = calculateStability(tempDNA);

      if (stability > maxStability) {
        maxStability = stability;
        strongestDNA = tempDNA;

        Object.assign(strongestSequences, sequences);
      }
    }
  }

  if (strongestDNA) {
    drawDNA(strongestDNA);

    const modeName = isRNAMode ? "RNA" : "DNA";

    handleDNAStrength(strongestDNA, `Generated strongest ${modeName}`);

    document.getElementById("sequence1").value = strongestSequences.strand1;
    document.getElementById("sequence2").value = strongestSequences.strand2;

    const singleView = document.getElementById("single-dna-view");
    const comparisonView = document.getElementById("comparison-view");
    const listView = document.getElementById("list-view");

    if (singleView) {
      singleView.classList.remove("hidden");
      singleView.classList.add("flex");
    }

    if (comparisonView) {
      comparisonView.classList.remove("flex");
      comparisonView.classList.add("hidden");
    }

    if (listView) {
      listView.classList.remove("flex");
      listView.classList.add("hidden");
    }

    showScrollDownButton();
  } else {
    clearCanvas();
    updateInfoPanel(null, "Failed to generate sequence.");
  }
};

const validateAndConvertInput = () => {
  const inputElement = document.getElementById("sequence1");

  let value = inputElement.value;

  const invalidChars = isRNAMode ? /[^augc\n]/gi : /[^atgc\n]/gi;
  const filteredValue = value.replace(invalidChars, "");

  inputElement.value = filteredValue.toUpperCase();

  updateComplementarySequence();
};

const updateComplementarySequence = () => {
  const sequence1 = document.getElementById("sequence1").value;
  const currentMap = isRNAMode ? complementaryMapRNA : complementaryMap;
  const complementarySequence = sequence1
    .split("\n")
    .map((line) =>
      line
        .split("")
        .map((n) => currentMap[n] || "")
        .join(""),
    )
    .join("\n");

  document.getElementById("sequence2").value = complementarySequence;
};

const showNotification = (message) => {
  let container = document.getElementById("notification-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.className =
      "fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none";
    document.body.appendChild(container);
  }

  const notification = document.createElement("div");

  notification.className =
    "bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm transition-all duration-300 opacity-0 translate-y-2 pointer-events-auto";
  notification.textContent = message;

  container.appendChild(notification);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      notification.classList.remove("opacity-0", "translate-y-2");
      notification.classList.add("opacity-100", "translate-y-0");
    });
  });

  setTimeout(() => {
    notification.classList.remove("opacity-100", "translate-y-0");
    notification.classList.add("opacity-0", "translate-y-2");

    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2000);
};

const toggleRNAMode = () => {
  isRNAMode = document.getElementById("rnaToggle").checked;

  const dnaFormSection = document.getElementById("dnaFormSection");

  if (isRNAMode) {
    if (dnaFormSection) dnaFormSection.classList.add("hidden");

    currentDNAForm = "B";
  } else {
    if (dnaFormSection) dnaFormSection.classList.remove("hidden");

    currentDNAForm = document.getElementById("dnaForm")?.value || "B";
  }

  document.getElementById("legend-t").textContent = isRNAMode
    ? "Uracil"
    : "Thymine";
  document.getElementById("validChars").textContent = isRNAMode
    ? "A, U, C, G"
    : "A, T, C, G";

  const sequence1Input = document.getElementById("sequence1");

  if (sequence1Input.value) {
    if (isRNAMode) {
      sequence1Input.value = sequence1Input.value.replace(/T/gi, "U");
    } else {
      sequence1Input.value = sequence1Input.value.replace(/U/gi, "T");
    }
  }

  sequence1Input.placeholder = isRNAMode ? "e.g. UAGC" : "e.g. TAGC";

  const buildButton = document.getElementById("buildButton");

  if (buildButton) {
    buildButton.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Generate ${isRNAMode ? "RNA" : "DNA"}
          `;
    buildButton.setAttribute(
      "aria-label",
      `Generate ${isRNAMode ? "RNA" : "DNA"}`,
    );
  }

  const replicateButton = document.getElementById("replicateButton");

  if (replicateButton) {
    if (isRNAMode) {
      replicateButton.classList.add("hidden");
      replicateButton.classList.remove("flex");
    } else {
      replicateButton.classList.remove("hidden");
      replicateButton.classList.add("flex");
    }
  }

  validateAndConvertInput();
  showNotification(isRNAMode ? "RNA Mode enabled" : "DNA Mode enabled");
};

const setupScrollButton = () => {
  const button = document.getElementById("scrollDownButton");

  if (button) {
    button.addEventListener("click", () => {
      document.querySelector("main").scrollIntoView({ behavior: "smooth" });
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initializeThreeEnvironment();

  document
    .getElementById("sequence1")
    ?.addEventListener("input", validateAndConvertInput);
  document
    .getElementById("buildButton")
    ?.addEventListener("click", buildAndVisualizeDNA);
  document
    .getElementById("strongestButton")
    ?.addEventListener("click", generateAndVisualizeStrongestDNA);
  document
    .getElementById("rnaToggle")
    ?.addEventListener("change", toggleRNAMode);

  document.getElementById("dnaForm")?.addEventListener("change", (e) => {
    if (!isRNAMode) {
      currentDNAForm = e.target.value;

      buildAndVisualizeDNA();
    }
  });

  const customSelectButton = document.getElementById("customSelectBtn");
  const customSelectList = document.getElementById("customSelectList");
  const customSelectValue = document.getElementById("customSelectValue");
  const customSelectIcon = document.getElementById("customSelectIcon");
  const dnaFormSelect = document.getElementById("dnaForm");

  if (customSelectButton && customSelectList) {
    customSelectButton.addEventListener("click", () => {
      const isExpanded =
        customSelectButton.getAttribute("aria-expanded") === "true";

      customSelectButton.setAttribute("aria-expanded", !isExpanded);

      if (!isExpanded) {
        customSelectList.classList.remove(
          "opacity-0",
          "scale-95",
          "pointer-events-none",
        );
        customSelectList.classList.add(
          "opacity-100",
          "scale-100",
          "pointer-events-auto",
        );
        customSelectIcon.classList.add("rotate-180");
      } else {
        customSelectList.classList.add(
          "opacity-0",
          "scale-95",
          "pointer-events-none",
        );
        customSelectList.classList.remove(
          "opacity-100",
          "scale-100",
          "pointer-events-auto",
        );
        customSelectIcon.classList.remove("rotate-180");
      }
    });

    customSelectList.addEventListener("click", (event) => {
      const listItem = event.target.closest("li");

      if (!listItem) return;

      customSelectList.querySelectorAll("li").forEach((element) => {
        element.setAttribute("aria-selected", "false");
        element.classList.remove("bg-teal-50/50");
      });

      listItem.setAttribute("aria-selected", "true");
      listItem.classList.add("bg-teal-50/50");
      customSelectValue.textContent = listItem.textContent.trim();

      const value = listItem.getAttribute("data-value");

      if (dnaFormSelect) {
        dnaFormSelect.value = value;

        const changeEvent = new Event("change");

        dnaFormSelect.dispatchEvent(changeEvent);
      }

      customSelectButton.setAttribute("aria-expanded", "false");
      customSelectList.classList.add(
        "opacity-0",
        "scale-95",
        "pointer-events-none",
      );
      customSelectList.classList.remove(
        "opacity-100",
        "scale-100",
        "pointer-events-auto",
      );
      customSelectIcon.classList.remove("rotate-180");
    });

    document.addEventListener("click", (event) => {
      if (
        !customSelectButton.contains(event.target) &&
        !customSelectList.contains(event.target)
      ) {
        customSelectButton.setAttribute("aria-expanded", "false");
        customSelectList.classList.add(
          "opacity-0",
          "scale-95",
          "pointer-events-none",
        );
        customSelectList.classList.remove(
          "opacity-100",
          "scale-100",
          "pointer-events-auto",
        );
        customSelectIcon.classList.remove("rotate-180");
      }
    });
  }

  const mutateButton = document.getElementById("mutateButton");

  if (mutateButton) {
    mutateButton.addEventListener("click", () => {
      const sequenceInput = document.getElementById("sequence1");

      let sequenceValue = sequenceInput.value;

      if (!sequenceValue) {
        sequenceValue = generateHumanGenomeDNA(10)?.strand1 || "";
      }

      if (sequenceValue) {
        let randomIndex;

        do {
          randomIndex = Math.floor(Math.random() * sequenceValue.length);
        } while (
          sequenceValue[randomIndex] === "\n" &&
          sequenceValue.length > 1
        );

        const availableBases = isRNAMode
          ? ["A", "U", "C", "G"]
          : ["A", "T", "C", "G"];

        let newBase;

        do {
          newBase =
            availableBases[Math.floor(Math.random() * availableBases.length)];
        } while (
          newBase === sequenceValue[randomIndex] &&
          availableBases.length > 1
        );

        let sequenceArray = sequenceValue.split("");

        sequenceArray[randomIndex] = newBase;
        sequenceInput.value = sequenceArray.join("");

        validateAndConvertInput();
        buildAndVisualizeDNA();
        showNotification(
          `Mutated base at position ${randomIndex + 1} to ${newBase}`,
        );
      }
    });
  }

  const replicateButton = document.getElementById("replicateButton");

  if (replicateButton) {
    let animFrameId = null;

    replicateButton.addEventListener("click", () => {
      if (!holder || holder.children.length === 0) return;

      replicationActive = !replicationActive;
      replicateButton.innerHTML = replicationActive
        ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>Stop</span>`
        : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg><span>Replicate</span>`;

      if (holder.userData.separationProgress === undefined) {
        holder.userData.separationProgress = 0;
      }

      const maxSeparation = holder.children.length;

      const animateHelicase = () => {
        let moved = false;

        if (
          replicationActive &&
          holder.userData.separationProgress < maxSeparation
        ) {
          holder.traverse((meshChild) => {
            if (meshChild.isMesh && meshChild.userData) {
              if (meshChild.userData.isTube1 || meshChild.userData.isRung1) {
                meshChild.position.x += 0.1;
                moved = true;
              }

              if (meshChild.userData.isTube2 || meshChild.userData.isRung2) {
                meshChild.position.x -= 0.1;
                moved = true;
              }
            }
          });

          if (moved) {
            holder.userData.separationProgress++;
            animFrameId = requestAnimationFrame(animateHelicase);
          } else {
            replicationActive = false;
            replicateButton.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg><span>Replicate</span>`;
          }
        } else if (
          !replicationActive &&
          holder.userData.separationProgress > 0
        ) {
          holder.traverse((meshChild) => {
            if (meshChild.isMesh && meshChild.userData) {
              if (meshChild.userData.isTube1 || meshChild.userData.isRung1) {
                meshChild.position.x -= 0.1;
                moved = true;
              }

              if (meshChild.userData.isTube2 || meshChild.userData.isRung2) {
                meshChild.position.x += 0.1;
                moved = true;
              }
            }
          });

          if (moved) {
            holder.userData.separationProgress--;
            animFrameId = requestAnimationFrame(animateHelicase);
          }
        }
      };

      if (animFrameId) cancelAnimationFrame(animFrameId);

      animFrameId = requestAnimationFrame(animateHelicase);

      if (replicationActive) {
        showNotification("Replication process started");
      } else {
        showNotification("Replication stopped");
      }
    });
  }

  setupScrollButton();
});
