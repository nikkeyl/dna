# DNA Visualizer

![AI](https://img.shields.io/badge/AI-red)

An interactive educational 3D visualization of DNA and RNA using Three.js.

[Open the demo](https://nikkeyl.github.io/dna/)

## Overview

DNA Visualizer is a browser experiment for exploring nucleotide sequences,
complementary base pairing, and simplified 3D structures.
It builds visual models from entered or randomly generated sequences.

This is an illustrative learning tool. It does not generate a human genome,
use real genomic datasets, or provide validated biological predictions.

## Features

- Enter a sequence and automatically derive its complementary strand.
- Rotate and inspect a 3D model with orbit controls.
- Switch between simplified A-DNA, B-DNA, and Z-DNA representations.
- Switch to an RNA mode using uracil instead of thymine.
- Inspect GC content and a simplified melting-temperature estimate.
- Explore random sequence generation, single-base changes, and a strand
  separation animation.
- Display amino-acid labels from sequence triplets.

## Getting started

Requirements: Git and a browser with WebGL support.
No package installation or build step is required.

```sh
git clone https://github.com/nikkeyl/dna.git
cd dna
```

Open `index.html` in your browser.
The page loads Three.js, OrbitControls, and Tailwind CSS from external CDNs,
so an internet connection is required.

To explore a sequence:

1. Enter `ATGC` in **Chain 1**. The complementary strand appears automatically.
2. Select **Generate DNA** to build the visual model.
3. Rotate the model and switch the DNA form.
4. Enable **RNA Mode** to explore the corresponding simplified representation.

## Implementation

- `index.html` defines the interface and loads external libraries.
- `script.js` handles sequence validation, model construction, controls,
  random generation, and displayed metrics.
- `style.css` contains additional styling.

The application uses vanilla JavaScript and Three.js without a frontend
framework or build pipeline. This keeps the experiment directly inspectable,
while depending on CDN-hosted libraries at runtime.

The source code and original documentation were generated with AI.

## Trade-offs and scientific limitations

- Random generation samples bases using fixed probabilities. It does not
  reproduce the structure or function of a human genome.
- The displayed **Stability** score is the GC fraction mapped to a 0–10 scale.
  It is an application heuristic, not a validated measure of overall stability.
- **Estimated lifespan** is selected from hard-coded ranges. It has no
  documented scientific basis and should not be interpreted as a prediction.
- The **strongest** sequence is the candidate with the most G/C bases among
  the sampled sequences, rather than a biologically optimal sequence.
- Melting-temperature values use simplified formulas without experimental
  conditions and are illustrative only.
- RNA mode, amino-acid labels, and the replication animation are simplified
  demonstrations rather than complete biological simulations.
- The current validator requires all four base types to be present across
  the paired strands. That is an application restriction, not a biological rule.

These limitations apply to the current implementation, including values
shown in the interface or exported as text.

## Verification

For changes to the model or controls, manually check:

1. Build `ATGC` and verify that its complementary strand is `TACG`.
2. Enter invalid characters and check the input filtering.
3. Switch among A-, B-, and Z-DNA views and rotate the model.
4. Enable RNA mode and verify that `AUGC` pairs with `UACG`.
5. Try the random-generation, mutation, and strand-separation controls.
6. Check the layout on desktop and mobile and inspect the browser console.

The repository does not currently include an automated test suite.

## License

[MIT](./LICENSE)
