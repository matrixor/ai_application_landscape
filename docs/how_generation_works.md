# How generation works

The workshop no longer depends on a hardcoded list of known filenames.

## Scan step

The extractor reads every `.docx` file from:

- `source_materials/real_sas_docs/`

It ignores temporary Word lock files such as `~$...docx`.

## Parse step

For each SAS document the extractor reads:

- the cover/title table
- the document metadata table
- heading-based sections such as Background, Objectives and Scope, Architecture Layers, Data Dependencies, ML and Analytics, and Security Questionnaire
- interface tables
- model tables
- cloud location / hosting tables
- the security questionnaire table

## Normalize step

The parser converts those signals into the workshop schema:

- name, id, family, review status
- business purpose
- capabilities
- features
- tech stack
- data domains
- data classification
- deployment regions
- models
- users
- interfaces
- RTO/RPO and availability

## Layout step

After all profiles are built, the script calculates pairwise similarity and derives three 3D coordinate sets:

- `embedding3d`
- `tech_focus`
- `purpose_focus`

## Output step

The extractor writes:

- `data/sas_real_profiles.json`
- `data/applications.json`
- `assets/workshop-data.js`

`workshop-data.js` is simply the browser-ready copy of the same profile list for offline use in `index.html`.

## Optional cleanup

If a new SAS document uses unusual wording, you can refine the generated profile by editing:

- `config/profile_overrides.json`

This is optional. A brand-new SAS document should still appear automatically without adding code.
