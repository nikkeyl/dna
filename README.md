# DNA Visualizer

![AI](https://img.shields.io/badge/AI-red)

Educational DNA/RNA visualization with Three.js. Code and original documentation
were generated with AI.

## Run

Open `index.html` in a WebGL-capable browser. No server, installation or build
is required. Internet access is needed for Three.js, OrbitControls and Tailwind
CSS loaded from CDNs.

## Decisions

- Vanilla JavaScript and CDN dependencies keep the experiment directly runnable.

- Complementary pairing and A/B/Z forms are simplified illustrations. RNA,
  amino-acid labels and strand separation are demonstrations, not validated
  biological simulations or human genome generation.

- GC content measures composition, not overall stability or lifespan.
  Melting-temperature estimates omit experimental conditions.

- High-GC search compares 10,000 random 15-base samples; the 95% GC auto-export
  threshold does not indicate biological quality.

- Requiring all four base types across paired strands is an application
  restriction, not a biological rule.

## License

[MIT](LICENSE).
