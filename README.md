# AI Application Landscape Workshop v1

This package is a **demo workshop** for Alan's AI application landscape and approval workbench. It turns the supplied SAS material into normalized application profiles and shows them in an interactive 3D landscape.

## What is included

- `index.html` — self-contained offline workshop that runs directly in a browser.
- `data/applications.json` — normalized application profiles used by the workshop.
- `data/sas_derived_profiles.json` — the two profiles derived from the provided SAS screenshot sets.
- `docs/demo_script.md` — suggested live demo flow.
- `docs/mapping_to_sas_template.md` — how the normalized data model maps back to the SAS template.
- `docs/extracted_profiles.md` — extraction notes for the two SAS-derived applications.
- `source_materials/` — SAS template, contact sheets, and selected evidence pages used for the extraction.
- `assets/plotly.min.js` — local Plotly runtime so the workshop can run without internet access.

## Real vs synthetic data

This v1 workshop contains:

- **2 SAS-derived applications** from the documents you supplied: Quantexa and CVPM Core APAC.
- **15 workshop seed applications** that are synthetic and clearly labeled in the UI. They exist only to make the landscape meaningful for a demo; they are not claimed to come from the supplied SAS documents.

Synthetic nodes are included because a 3D similarity landscape with only two applications would not show the clustering, duplicate detection, and approval cues that Alan wants to demonstrate.

## How to run

Open `index.html` directly in a desktop browser.

No server is required.

## What the workshop demonstrates

- 3D landscape of application similarity
- Auto-spinning camera for the “3D spinning” experience
- Click any dot to inspect the **real extracted dimensions** behind the dot
- Explainable nearest-neighbor view with component-level similarity breakdown
- Pending review queue showing the closest approved alternative and a recommendation:
  - Potential duplicate
  - Likely variant / extension
  - Novel

## Important v1 limitation

The 3D coordinates are a **seeded baseline layout** that mirrors the intended hybrid similarity neighborhoods. The weight sliders update the relationship edges, queue, and similarity explanations live, but they do not recompute the underlying 3D positions in-browser. A server-backed v2 could recompute the embedding live.
