# AI Application Landscape Workshop v1.3

This package is an **offline interactive demo** for Alan’s AI application landscape and approval workbench.

## What changed in v1.3

- The workshop uses the attached **real SAS Word documents only**.
- The node-click path was hardened so the selected application panel reliably follows the clicked dot in the 3D landscape.
- Asset URLs now include a version query string to avoid stale browser caching of older workshop JavaScript.
- Remaining screenshot-era references were cleaned out of the package text and profile notes.

## Real SAS documents included

- **Chubb AI** — Assistants & Document AI
- **GDP Quantexa** — Fraud & Entity Intelligence
- **CVPM APAC (Chubb Virtual Portfolio Manager)** — Pricing & Portfolio Optimization

The package includes the real SAS documents under `source_materials/real_sas_docs/` together with the SAS template under `source_materials/template/`.

## What is included

- `index.html` — self-contained offline workshop that runs directly in a browser.
- `data/applications.json` — normalized application profiles used by the workshop.
- `data/sas_real_profiles.json` — identical source-of-truth profile export for the three real SAS documents.
- `docs/extracted_profiles.md` — human-readable extraction summary.
- `scripts/extract_real_sas_profiles.py` — helper script that rebuilds the profiles and the static JS data from the real SAS Word documents.
- `assets/plotly.min.js` — local Plotly runtime for offline use.

## How to run

Open `index.html` directly in a browser. No server is required.

## What the workshop demonstrates

- 3D landscape of application similarity
- Auto-spinning camera for the “3D spinning” experience
- Click any dot to inspect the extracted dimensions behind the dot
- Explainable nearest-neighbor view with component-level similarity breakdown
- Review queue showing the closest current application and an overlap cue

## Notes

- With only three real SAS documents, the map is intentionally sparse but accurate to the source set.
- When more real SAS documents are added, rerun `scripts/extract_real_sas_profiles.py` after extending the configuration map in that script.
