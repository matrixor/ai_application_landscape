# AI Application Landscape Workshop v1.6.1

This package is an **offline interactive demo** for Alan’s AI application landscape and approval workbench.

## What changed in v1.6.1

- The workshop data is now generated **dynamically from every real SAS `.docx` file** in `source_materials/real_sas_docs/`.
- The old hardcoded filename-to-profile map was removed.
- The extractor now parses section headings, interface tables, model tables, hosting tables, and the security questionnaire directly from each Word document.
- An optional `config/profile_overrides.json` file is supported for manual cleanup, but it is **not required** for new files to appear in the demo.
- `scripts/serve_workshop.py` auto-rebuilds the data when files in `real_sas_docs/` change and serves the workshop locally.
- The front-end stays on the v1.3 workshop interaction model, with the additional scatter3d click fix from the attached v1.3 patch (event rebind + native mouseup fallback).

## Real SAS documents currently included

- **Chubb AI** — Assistants & Document AI
- **GDP Quantexa** — Fraud & Entity Intelligence
- **North America MS Dynamics Platform for Claims** — Assistants & Document AI
- **CVPM APAC (Chubb Virtual Portfolio Manager)** — Pricing & Portfolio Optimization

## How the generated files work

- `data/sas_real_profiles.json` — source-of-truth normalized profiles built from the real SAS Word docs.
- `data/applications.json` — the same normalized profiles, kept for the workshop UI.
- `assets/workshop-data.js` — browser-ready copy of the same profile data, used by `index.html` when the workshop runs offline.

These three files are regenerated together by `scripts/extract_real_sas_profiles.py`.

## Dynamic workflow

### Option A — rebuild on demand

1. Drop a new real SAS Word document into `source_materials/real_sas_docs/`
2. Run:

```bash
python scripts/extract_real_sas_profiles.py
```

3. Refresh the workshop.

### Option B — auto-rebuild while serving locally

Run:

```bash
python scripts/serve_workshop.py
```

Then open the local URL that the script prints. When you add or replace a SAS file in `real_sas_docs/`, refresh the browser and the server will rebuild the workshop data automatically.

## Optional overrides

If you want to tweak a label without changing the parser, edit:

- `config/profile_overrides.json`

Example uses:
- rename an app display name
- force a preferred family
- enrich `business_unit` or `owner`
- refine a list such as `capabilities` or `tech_stack`

## Notes

- Direct `index.html` opening still works with the **last generated** data snapshot.
- Auto-detection of newly dropped SAS files requires running `scripts/serve_workshop.py` or rerunning the extractor script.
- This build keeps the v1.3 visual workshop structure rather than the later v1.4 node-trace redesign.

- Fixed a regression where the first node click worked but later clicks stopped updating the Selected application panel because Plotly event handlers were being rebound before Plotly.react() fully finished.
