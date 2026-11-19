# IT & AV Technical Lab

A hands-on, browser-based training simulator for CompTIA A+, CompTIA Network+, Dante, AVIXA/CTS, and Q-SYS topics.

## Design philosophy
This project is deliberately a technical training lab, not an RPG or video game. It emphasizes visual equipment models, patching, routing, configuration, signal flow, diagnostic decisions, and immediate feedback.

## Included simulation benches
- **PC hardware (A+):** component identification and a guided no-display troubleshooting ticket.
- **Network rack (Network+):** select endpoints, patch switch ports, configure VLANs, and test modeled connectivity.
- **Dante audio:** create transmitter-to-receiver subscriptions and explore sample-rate compatibility.
- **AV signal flow (AVIXA/CTS):** verify a laptop-to-display chain one hop at a time.
- **Q-SYS DSP:** adjust gain, mute/unmute, and observe simplified signal meters.
- **Knowledge review:** short questions with explanations.

## Run locally
Open `index.html` in a modern browser. No build step, server, or external JavaScript dependency is required. Google Fonts are optional; the system falls back to installed fonts if unavailable.

## Publish on GitHub Pages
1. Create a new repository, such as `it-av-technical-lab`.
2. Extract this ZIP and upload the contents of the `it-av-technical-lab` folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main` and `/(root)`, then Save.
5. Open the published URL shown on the Pages settings screen.

## Progress
Bench completion markers are stored in the current browser using localStorage. They do not sync between devices and may be erased if browser site data is cleared.

## Important limitations
These are simplified educational models. They do not emulate electrical behavior, real switch firmware, Dante Controller, Q-SYS Designer, or vendor-specific device behavior. Use current official exam objectives, product manuals, and supervised hands-on practice for certification preparation. The content is original and is not an official exam bank.

## Official study resources
- CompTIA A+: https://www.comptia.org/certifications/a
- CompTIA Network+: https://www.comptia.org/certifications/network
- Audinate Dante training: https://www.audinate.com/learning/training-certification
- AVIXA CTS resources: https://www.avixa.org/training-certification/certification/cts-document-and-resources
- Q-SYS training: https://training.qsc.com/
