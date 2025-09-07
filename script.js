let scene, camera, renderer, holder, dnaObject, controls;
let sceneBest, cameraBest, rendererBest, holderBest, controlsBest;
let sceneWorst, cameraWorst, rendererWorst, holderWorst, controlsWorst;

const nucleotideColors = {
  A: 0x008000,
  T: 0x0000ff,
  C: 0xffa500,
  G: 0xff0000,
};

const complementaryMap = {
  A: "T",
  T: "A",
  C: "G",
  G: "C",
};

class Nucleotide {
  constructor(type) {
    this.type = type.toUpperCase();
  }

  bind(partnerNucleotide) {
    return complementaryMap[this.type] === partnerNucleotide.type;
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

    const validChars = /^[TACG]+$/i;
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

const initThree = () => {
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

  window.addEventListener("resize", onWindowResize, false);

  animate();
};

const initThreeBest = () => {
  const container = document.getElementById("best-dna-canvas");
  const width = container.clientWidth;
  const height = container.clientHeight;

  sceneBest = new THREE.Scene();
  cameraBest = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  rendererBest = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  rendererBest.setSize(width, height);
  container.appendChild(rendererBest.domElement);

  cameraBest.position.z = 50;

  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(10, 20, 30);
  sceneBest.add(light);
  sceneBest.add(new THREE.AmbientLight(0x404040));

  controlsBest = new THREE.OrbitControls(cameraBest, rendererBest.domElement);
  controlsBest.enablePan = false;
  controlsBest.minDistance = 20;
  controlsBest.maxDistance = 150;

  window.addEventListener("resize", onWindowResizeBest, false);

  animateBest();
};

// Initialize the worst DNA scene
const initThreeWorst = () => {
  const container = document.getElementById("worst-dna-canvas");
  const width = container.clientWidth;
  const height = container.clientHeight;

  sceneWorst = new THREE.Scene();
  cameraWorst = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  rendererWorst = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  rendererWorst.setSize(width, height);
  container.appendChild(rendererWorst.domElement);

  cameraWorst.position.z = 50;

  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(10, 20, 30);
  sceneWorst.add(light);
  sceneWorst.add(new THREE.AmbientLight(0x404040));

  controlsWorst = new THREE.OrbitControls(
    cameraWorst,
    rendererWorst.domElement
  );
  controlsWorst.enablePan = false;
  controlsWorst.minDistance = 20;
  controlsWorst.maxDistance = 150;

  window.addEventListener("resize", onWindowResizeWorst, false);

  animateWorst();
};

const onWindowResize = () => {
  const container = document.getElementById("three-canvas-container");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
};

const onWindowResizeBest = () => {
  const container = document.getElementById("best-dna-canvas");
  cameraBest.aspect = container.clientWidth / container.clientHeight;
  cameraBest.updateProjectionMatrix();
  rendererBest.setSize(container.clientWidth, container.clientHeight);
};

const onWindowResizeWorst = () => {
  const container = document.getElementById("worst-dna-canvas");
  cameraWorst.aspect = container.clientWidth / container.clientHeight;
  cameraWorst.updateProjectionMatrix();
  rendererWorst.setSize(container.clientWidth, container.clientHeight);
};

const animate = () => {
  requestAnimationFrame(animate);
  if (holder) {
    holder.rotation.y += 0.01;
  }
  controls.update();
  renderer.render(scene, camera);
};

const animateBest = () => {
  requestAnimationFrame(animateBest);
  if (holderBest) {
    holderBest.rotation.y += 0.01;
  }
  controlsBest.update();
  rendererBest.render(sceneBest, cameraBest);
};

const animateWorst = () => {
  requestAnimationFrame(animateWorst);
  if (holderWorst) {
    holderWorst.rotation.y += 0.01;
  }
  controlsWorst.update();
  rendererWorst.render(sceneWorst, cameraWorst);
};

const drawDNA = (dnaInstance, targetScene = "main") => {
  let currentScene, currentHolder;

  if (targetScene === "best") {
    currentScene = sceneBest;
    if (holderBest) {
      sceneBest.remove(holderBest);
    }
    currentHolder = new THREE.Object3D();
    holderBest = currentHolder;
  } else if (targetScene === "worst") {
    currentScene = sceneWorst;
    if (holderWorst) {
      sceneWorst.remove(holderWorst);
    }
    currentHolder = new THREE.Object3D();
    holderWorst = currentHolder;
  } else {
    currentScene = scene;
    if (holder) {
      scene.remove(holder);
    }
    currentHolder = new THREE.Object3D();
    holder = currentHolder;
  }

  if (!dnaInstance || dnaInstance.strand1.length === 0) {
    return;
  }

  const backboneRadius = 0.4;
  const backboneHeight = 2.0;
  const nucleotideRadius = 3;

  const tubeGeometry = new THREE.CylinderGeometry(
    backboneRadius,
    backboneRadius,
    backboneHeight,
    16
  );

  const backboneMaterial1 = new THREE.MeshPhongMaterial({
    color: 0xffffff,
  });
  const backboneMaterial2 = new THREE.MeshPhongMaterial({
    color: 0xffffff,
  });

  const numNucleotides = dnaInstance.strand1.length;
  const pitch = 2;

  for (let i = 0; i < numNucleotides; i++) {
    const y = i * pitch - (numNucleotides * pitch) / 2;
    const angle = (i * Math.PI) / 8;

    const nucleotide1 = dnaInstance.strand1[i];
    const nucleotide2 = dnaInstance.strand2[i];

    const color1 = nucleotideColors[nucleotide1.type];
    const color2 = nucleotideColors[nucleotide2.type];

    const pos1_at_y = new THREE.Vector3(
      nucleotideRadius * Math.cos(angle),
      y,
      nucleotideRadius * Math.sin(angle)
    );
    const pos2_at_y = new THREE.Vector3(
      -nucleotideRadius * Math.cos(angle),
      y,
      -nucleotideRadius * Math.sin(angle)
    );

    if (i < numNucleotides - 1) {
      const nextY = (i + 1) * pitch - (numNucleotides * pitch) / 2;
      const nextAngle = ((i + 1) * Math.PI) / 8;

      const pos1_next_y = new THREE.Vector3(
        nucleotideRadius * Math.cos(nextAngle),
        nextY,
        nucleotideRadius * Math.sin(nextAngle)
      );
      const pos2_next_y = new THREE.Vector3(
        -nucleotideRadius * Math.cos(nextAngle),
        nextY,
        -nucleotideRadius * Math.sin(nextAngle)
      );

      const tube1 = new THREE.Mesh(tubeGeometry, backboneMaterial1);
      tube1.position.copy(pos1_at_y).add(pos1_next_y).divideScalar(2);
      tube1.lookAt(pos1_next_y);
      tube1.rotateX(Math.PI / 2);
      currentHolder.add(tube1);

      const tube2 = new THREE.Mesh(tubeGeometry, backboneMaterial2);
      tube2.position.copy(pos2_at_y).add(pos2_next_y).divideScalar(2);
      tube2.lookAt(pos2_next_y);
      tube2.rotateX(Math.PI / 2);
      currentHolder.add(tube2);
    }

    const halfRungLength = nucleotideRadius;
    const halfRungRadius = 0.5;

    const halfRungGeometry = new THREE.CylinderGeometry(
      halfRungRadius,
      halfRungRadius,
      halfRungLength,
      32
    );

    const rungMaterial1 = new THREE.MeshPhongMaterial({ color: color1 });
    const rungMaterial2 = new THREE.MeshPhongMaterial({ color: color2 });

    const rungHalf1 = new THREE.Mesh(halfRungGeometry, rungMaterial1);
    rungHalf1.position.set(
      (nucleotideRadius / 2) * Math.cos(angle),
      y,
      (nucleotideRadius / 2) * Math.sin(angle)
    );
    rungHalf1.lookAt(pos1_at_y);
    rungHalf1.rotateX(Math.PI / 2);
    currentHolder.add(rungHalf1);

    const rungHalf2 = new THREE.Mesh(halfRungGeometry, rungMaterial2);
    rungHalf2.position.set(
      (-nucleotideRadius / 2) * Math.cos(angle),
      y,
      (-nucleotideRadius / 2) * Math.sin(angle)
    );
    rungHalf2.lookAt(pos2_at_y);
    rungHalf2.rotateX(Math.PI / 2);
    currentHolder.add(rungHalf2);
  }

  currentScene.add(currentHolder);

  if (targetScene === "best") {
    cameraBest.position.z = Math.max(50, numNucleotides * pitch * 1.5);
  } else if (targetScene === "worst") {
    cameraWorst.position.z = Math.max(50, numNucleotides * pitch * 1.5);
  } else {
    camera.position.z = Math.max(50, numNucleotides * pitch * 1.5);
  }
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
  const infoPanel = document.querySelector(".info-panel");
  if (dna?.strand1?.length === 0) {
    infoPanel.innerHTML = message;
    infoPanel.className = "info-panel error";
  } else {
    const stability = calculateStability(dna);
    const length = dna.strand1.length;
    const strengthScore = Math.round((stability / length) * 10);
    const colorClass =
      strengthScore <= 3 ? "low" : strengthScore <= 7 ? "medium" : "high";

    infoPanel.innerHTML = `${message} <br> DNA Stability: ${strengthScore}/10 <br> Estimated lifespan: ${getLifespan(
      strengthScore
    )}`;
    infoPanel.className = `info-panel ${colorClass}`;
  }
  infoPanel.style.display = "block";
};

const downloadDNA = (dnaInstance, strengthScore, filename) => {
  const sequence1 = dnaInstance.strand1.map((n) => n.type).join("");
  const sequence2 = dnaInstance.strand2.map((n) => n.type).join("");
  const lifespan = getLifespan(strengthScore);
  const content = `---
DNA Search Result
---

Found DNA with stability: ${strengthScore}/10
Estimated lifespan: ${lifespan}

Chain 1: ${sequence1}
Chain 2: ${sequence2}

This DNA has high stability due to a large number of guanine-cytosine (G-C) pairs.`;

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
    (stability / dnaInstance.strand1.length) * 10
  );
  updateInfoPanel(dnaInstance, message);

  if (strengthScore === 10) {
    downloadDNA(dnaInstance, strengthScore, "DNA_Strength_10.txt");
  }
};

const buildAndVisualizeDNA = () => {
  const seq1Input = document.getElementById("sequence1").value.toUpperCase();
  const seq2Input = document.getElementById("sequence2").value.toUpperCase();

  const myDNA = new DNA();
  const isValid = myDNA.build(seq1Input, seq2Input);

  if (isValid) {
    drawDNA(myDNA);
    handleDNAStrength(myDNA, "DNA built successfully!");
  } else {
    clearCanvas();
    updateInfoPanel(
      null,
      "Error! Sequences are not complementary, have different lengths, do not contain all 4 nucleotides, or contain invalid characters."
    );
  }
};

const generateHumanGenomeDNA = (length) => {
  const probabilities = {
    A: 0.2953,
    T: 0.2957,
    G: 0.2046,
    C: 0.2044,
  };

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

  const strand2 = strand1.map((n) => complementaryMap[n]);

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
    handleDNAStrength(strongestDNA, "Generated strongest DNA");
    document.getElementById("sequence1").value = strongestSequences.strand1;
    document.getElementById("sequence2").value = strongestSequences.strand2;
  } else {
    clearCanvas();
    updateInfoPanel(null, "Failed to generate DNA.");
  }
};

const updateInfoText = (message) => {
  const infoPanel = document.querySelector(".info-panel");
  infoPanel.innerHTML = message;
  infoPanel.style.display = "block";
};

const findDNAWithStrengthTen = () => {
  const buildButton = document.getElementById("buildButton");
  const strongestButton = document.getElementById("strongestButton");
  const findTenButton = document.getElementById("findTenButton");
  const attemptsInput = document.getElementById("attemptsInput");
  const numAttempts = parseInt(attemptsInput.value) || 1000;

  buildButton.disabled = true;
  strongestButton.disabled = true;
  findTenButton.disabled = true;

  let dnaFound = false;
  let iteration = 0;

  let bestDNAFound = null;
  let maxScore = -1;
  let worstDNAFound = null;
  let minScore = 11;

  const searchLoop = () => {
    if (dnaFound || iteration >= numAttempts) {
      document.getElementById("single-dna-view").style.display = "none";
      document.getElementById("comparison-view").style.display = "block";

      if (bestDNAFound) {
        drawDNA(bestDNAFound, "best");

        const stability = calculateStability(bestDNAFound);
        const strengthScore = Math.round(
          (stability / bestDNAFound.strand1.length) * 10
        );

        document.querySelector(
          ".dna-title"
        ).textContent = `Best DNA Found (Stability: ${strengthScore}/10)`;
      }

      if (worstDNAFound) {
        drawDNA(worstDNAFound, "worst");

        const stability = calculateStability(worstDNAFound);
        const strengthScore = Math.round(
          (stability / worstDNAFound.strand1.length) * 10
        );

        document.querySelectorAll(
          ".dna-title"
        )[1].textContent = `Worst DNA Found (Stability: ${strengthScore}/10)`;
      }

      // Update comparison info
      const comparisonInfo = document.getElementById("comparisonInfo");
      if (bestDNAFound && worstDNAFound) {
        const bestStability = calculateStability(bestDNAFound);
        const bestScore = Math.round(
          (bestStability / bestDNAFound.strand1.length) * 10
        );

        const worstStability = calculateStability(worstDNAFound);
        const worstScore = Math.round(
          (worstStability / worstDNAFound.strand1.length) * 10
        );

        comparisonInfo.innerHTML = `
                <div>Best DNA Lifespan: ${getLifespan(bestScore)}</div>
                <div>Worst DNA Lifespan: ${getLifespan(worstScore)}</div>
              `;
      }

      if (dnaFound) {
        handleDNAStrength(bestDNAFound, "Found DNA with stability 10!");
      } else {
        const infoPanel = document.querySelector(".info-panel");
        infoPanel.innerHTML = `
                <div style="display:flex; justify-content:space-between; width:100%;">
                    <div style="flex-basis: 48%; text-align: left;">
                        <p><b>Best DNA:</b></p>
                        <p>Stability: ${maxScore}/10<br>Lifespan: ${getLifespan(
          maxScore
        )}</p>
                    </div>
                    <div style="flex-basis: 48%; text-align: right;">
                        <p><b>Worst DNA:</b></p>
                        <p>Stability: ${minScore}/10<br>Lifespan: ${getLifespan(
          minScore
        )}</p>
                    </div>
                </div>
              `;
        infoPanel.className = "info-panel medium";
        infoPanel.style.display = "block";

        if (bestDNAFound) {
          const bestSequences = {
            strand1: bestDNAFound.strand1.map((n) => n.type).join(""),
            strand2: bestDNAFound.strand2.map((n) => n.type).join(""),
          };
          document.getElementById("sequence1").value = bestSequences.strand1;
          document.getElementById("sequence2").value = bestSequences.strand2;
        }
      }

      // Restore buttons
      buildButton.disabled = false;
      strongestButton.disabled = false;
      findTenButton.disabled = false;
      return;
    }

    const dnaLength = 15;
    const sequences = generateHumanGenomeDNA(dnaLength);

    if (sequences) {
      const myDNA = new DNA();
      if (myDNA.build(sequences.strand1, sequences.strand2)) {
        const stability = calculateStability(myDNA);
        const strengthScore = Math.round((stability / dnaLength) * 10);

        updateInfoText(
          `Searching for DNA with stability 10... Attempt ${
            iteration + 1
          }/${numAttempts}, Stability: ${strengthScore}/10`
        );
        drawDNA(myDNA);

        if (bestDNAFound === null || strengthScore > maxScore) {
          maxScore = strengthScore;
          bestDNAFound = myDNA;
        }

        if (worstDNAFound === null || strengthScore < minScore) {
          minScore = strengthScore;
          worstDNAFound = myDNA;
        }

        if (strengthScore === 10) {
          bestDNAFound = myDNA;
          dnaFound = true;
        }
      }
    }

    iteration++;
    setTimeout(searchLoop, 10);
  };

  searchLoop();
};

const validateAndConvertInput = () => {
  const inputElement = document.getElementById("sequence1");
  let value = inputElement.value;

  const invalidChars = /[^atgc]/gi;

  const filteredValue = value.replace(invalidChars, "");

  inputElement.value = filteredValue.toUpperCase();

  updateComplementarySequence();
};

const updateComplementarySequence = () => {
  const sequence1 = document.getElementById("sequence1").value;
  const complementarySequence = sequence1
    .split("")
    .map((n) => complementaryMap[n] || "")
    .join("");
  document.getElementById("sequence2").value = complementarySequence;
};

document.addEventListener("DOMContentLoaded", () => {
  initThree();
  initThreeBest();
  initThreeWorst();
  document
    .getElementById("sequence1")
    .addEventListener("input", validateAndConvertInput);
  document
    .getElementById("buildButton")
    .addEventListener("click", buildAndVisualizeDNA);
  document
    .getElementById("strongestButton")
    .addEventListener("click", generateAndVisualizeStrongestDNA);
  document
    .getElementById("findTenButton")
    .addEventListener("click", findDNAWithStrengthTen);

  document.getElementById("set1KButton").addEventListener("click", () => {
    document.getElementById("attemptsInput").value = 1000;
  });
  document.getElementById("set10KButton").addEventListener("click", () => {
    document.getElementById("attemptsInput").value = 10000;
  });
  document.getElementById("set100KButton").addEventListener("click", () => {
    document.getElementById("attemptsInput").value = 100000;
  });
});
