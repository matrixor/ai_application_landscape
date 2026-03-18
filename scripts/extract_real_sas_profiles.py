#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

from docx import Document
from sklearn.manifold import MDS

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / 'data'
ASSETS_DIR = ROOT / 'assets'
DOCS_DIR = ROOT / 'docs'
REAL_SAS_DIR = ROOT / 'source_materials' / 'real_sas_docs'

STOPWORDS = {
    'the','and','for','with','from','that','this','into','through','over','across','their','them','will','then','than','using','used','use',
    'onto','while','where','which','what','when','able','such','like','also','very','more','less','same','different','provide','provides',
    'support','supports','help','helps','allow','allows','application','solution','platform','business','global','regional','region','teams','team',
    'project','section','document','architecture','system','data','user','users','process','processes','model','models','service','services'
}

FAMILY_COLORS = {
    'Fraud & Entity Intelligence': '#2f6df6',
    'Pricing & Portfolio Optimization': '#8a3ffc',
    'Assistants & Document AI': '#119c92',
}

CONFIGS: Dict[str, Dict] = {
    'ChubbAI_SAS.docx': {
        'id': 'chubb_ai',
        'name': 'Chubb AI',
        'short_name': 'Chubb AI',
        'family': 'Assistants & Document AI',
        'review_status': 'Pending Review',
        'owner': 'Enterprise AI / Chubb EA',
        'business_unit': 'Enterprise Document AI',
        'region_scope': ['North America', 'COG'],
        'business_purpose': 'Centralize Chubb document access and GenAI question answering across mobile, desktop, web, and office channels so business teams can find answers faster, reduce manual research, and improve compliant decision-making.',
        'capabilities': [
            'document Q&A', 'semantic search', 'vector search', 'document ingestion', 'metadata extraction',
            'mobile and web access', 'document comparison', 'AI app catalog'
        ],
        'features': [
            'document upload', 'question answering', 'chat history', 'user preferences', 'app store catalog',
            'document comparison', 'semantic retrieval', 'office plugin access'
        ],
        'tech_stack': [
            'AKS', 'AngularJS', 'NodeJS', 'TypeScript', 'Python', 'Cosmos DB', 'Azure AI Search',
            'Azure OpenAI', 'Azure Blob Storage', 'ADLS', 'APIM', 'Redis', 'Azure Key Vault'
        ],
        'data_domains': [
            'underwriting guidelines', 'risk engineering documents', 'legal documents', 'metadata', 'prompts and threads', 'user profile'
        ],
        'data_classification': 'Red SPI',
        'deployment_regions': ['US East 2 (NA Azure)', 'Central US (NA Azure)'],
        'models': ['GPT-4o Mini', 'Azure Document Intelligence', 'text-embedding-3-small'],
        'users': ['business teams', 'executives', 'staff with Chubb LANIDs', 'mobile users', 'desktop users'],
        'interfaces': ['Mobile App', 'WebApp', 'Office Plugin UI', 'AI/RAG API', 'Azure AI Search', 'Azure OpenAI', 'Cosmos DB'],
        'nfr': {'rto_hours': 8, 'rpo_hours': 8, 'availability': '24x5 with business-hour target 99.99%'},
        'priority': 5,
        'notes': 'Uses the real Chubb AI SAS Word document.',
        'source_sections': {
            'business_purpose': ['Background', 'Business Needs and Benefits', 'Objectives and Scope'],
            'capabilities': ['Application Architecture', 'Architecture Layers', 'ML and Analytics'],
            'tech_stack': ['Architecture Layers', 'Cloud Software', 'Security Questionnaire'],
            'data_and_security': ['Data Architecture', 'Security Questionnaire'],
        },
    },
    'EA_5145_Solution Architecture Specification Quantexa_Gate3.docx': {
        'id': 'quantexa',
        'name': 'GDP Quantexa',
        'short_name': 'Quantexa',
        'family': 'Fraud & Entity Intelligence',
        'review_status': 'In Review',
        'owner': 'Global Data Platform',
        'business_unit': 'GDP / Fraud & Entity Resolution',
        'region_scope': ['Global'],
        'business_purpose': 'Provision the Quantexa platform so Chubb teams can perform entity resolution, relationship analytics, and network fraud detection across integrated data sources to improve investigation quality and contextual decision-making.',
        'capabilities': [
            'entity resolution', 'network analytics', 'fraud detection', 'relationship search', 'risk assessment', 'investigation workflows', 'data integration'
        ],
        'features': [
            'entity graph', 'network visualization', 'dynamic entity resolution', 'task creation', 'alert thresholds', 'investigator UI', 'SSO access'
        ],
        'tech_stack': [
            'AKS', 'Azure Databricks', 'ADLS', 'Elasticsearch', 'PostgreSQL', 'Azure Active Directory', 'Azure Key Vault', 'Azure Log Analytics', 'ADF'
        ],
        'data_domains': [
            'individual', 'business', 'address', 'telephone', 'email', 'documents', 'alerts', 'tasks'
        ],
        'data_classification': 'N/A (platform scope)',
        'deployment_regions': ['US East 2 (NA Azure)', 'Central US (NA Azure)'],
        'models': ['entity resolution', 'network fraud model', 'knowledge graph'],
        'users': ['staff with Chubb LANIDs', 'analytics team', 'technology users', 'investigators'],
        'interfaces': ['ADLS', 'Databricks', 'Elasticsearch', 'PostgreSQL', 'Quantexa UI', 'Quantexa APIs'],
        'nfr': {'rto_hours': 8, 'rpo_hours': 12, 'availability': 'Mon-Sat business hours'},
        'priority': 4,
        'notes': 'Platform-oriented SAS. Security classification rows are marked not applicable for business data because future solution TSGs define business-specific data usage.',
        'source_sections': {
            'business_purpose': ['Background', 'Business Needs and Benefits', 'Objectives and Scope'],
            'capabilities': ['Logical Architecture', 'System Topology/Context'],
            'tech_stack': ['Integration Architecture', 'Cloud Infrastructure/Services', 'Security Questionnaire'],
            'data_and_security': ['Data Architecture', 'Security Questionnaire'],
        },
    },
    'Solution Architecture Specification CVPM_APAC.docx': {
        'id': 'cvpm_apac',
        'name': 'CVPM APAC (Chubb Virtual Portfolio Manager)',
        'short_name': 'CVPM APAC',
        'family': 'Pricing & Portfolio Optimization',
        'review_status': 'Pending Review',
        'owner': 'APAC Portfolio Analytics',
        'business_unit': 'APAC BizPack / Flow',
        'region_scope': ['APAC'],
        'business_purpose': 'Support APAC flow business pricing and portfolio management through real-time monitoring, scenario testing, smoothing and simulation models, and unified dashboards that improve time-to-market and profitable growth decisions.',
        'capabilities': [
            'portfolio monitoring', 'price optimization', 'simulation', 'scenario testing', 'anomaly detection', 'decision support', 'dashboarding'
        ],
        'features': [
            'monitoring pipeline', 'configuration upload', 'simulation library', 'embedded Power BI dashboards', 'model monitoring', 'glossary', 'report generation'
        ],
        'tech_stack': [
            'AKS', 'ADLS', 'APIM', 'Cosmos DB', 'Azure Databricks', 'Confluent Kafka', 'FastAPI', 'Python 3.10', 'Power BI', 'Snowflake'
        ],
        'data_domains': [
            'policy', 'claims', 'reference data', 'pricing', 'submissions', 'technical premium', 'loss cost', 'portfolio metadata'
        ],
        'data_classification': 'Red SBI',
        'deployment_regions': ['Southeast Asia (APAC Azure)'],
        'models': ['L0 conversion model', 'discovery/monitoring model', 'smoothing model', 'simulator decision engine'],
        'users': ['underwriting operations', 'IT operations', 'pricing analysts', 'portfolio managers'],
        'interfaces': ['Databricks jobs', 'Middleware', 'Decision Engine', 'Cosmos DB', 'ADLS', 'Kafka', 'Power BI UI'],
        'nfr': {'rto_hours': 48, 'rpo_hours': 12, 'availability': 'Mon-Sat business hours, target latency < 5 minutes'},
        'priority': 5,
        'notes': 'Uses the real CVPM APAC SAS Word document. The TSG section shows SI 5549, while the document history table shows 5591; this workshop displays the explicit TSG SI value.',
        'source_sections': {
            'business_purpose': ['Background', 'Business Needs and Benefits', 'Objectives and Scope'],
            'capabilities': ['Logical Architecture', 'Architecture Layers', 'ML and Analytics'],
            'tech_stack': ['Architecture Layers', 'Cloud Infrastructure/Services', 'Security Questionnaire'],
            'data_and_security': ['Data Dependencies – inputs', 'ML and Analytics', 'Security Questionnaire'],
        },
    },
}

SECTION_HEADINGS = [
    'Background',
    'Business Needs and Benefits',
    'Objectives and Scope',
    'Assumptions',
    'Out of scope',
    'Technology Solution Governance (TSG)',
    'User Accessibility',
    'Availability Hours',
    'System Failure Conditions',
    'Logical Architecture',
    'System Topology/Context',
    'Architecture Layers',
    'Data Architecture',
    'Introduction',
    'Data Dependencies – inputs',
    'ML and Analytics',
    'ML and Analytics (LLM Models included)',
    'Security Questionnaire',
]


def normalize_whitespace(text: str) -> str:
    return re.sub(r'\s+', ' ', text or '').strip()


def title_from_table(doc: Document) -> str:
    try:
        raw = doc.tables[0].cell(0, 0).text
        parts = [normalize_whitespace(p) for p in raw.split('|') if normalize_whitespace(p)]
        return parts[-1] if parts else 'Unknown title'
    except Exception:
        return 'Unknown title'


def metadata_from_table(doc: Document) -> Dict[str, str]:
    result: Dict[str, str] = {}
    try:
        table = doc.tables[1]
        for row in table.rows:
            if len(row.cells) >= 2:
                key = normalize_whitespace(row.cells[0].text).rstrip(':')
                value = normalize_whitespace(row.cells[1].text)
                if key:
                    result[key] = value
    except Exception:
        pass
    return result


def document_text(doc: Document) -> str:
    pieces: List[str] = []
    for paragraph in doc.paragraphs:
        text = normalize_whitespace(paragraph.text)
        if text:
            pieces.append(text)
    for table in doc.tables:
        for row in table.rows:
            row_text = ' | '.join(normalize_whitespace(cell.text) for cell in row.cells if normalize_whitespace(cell.text))
            if row_text:
                pieces.append(row_text)
    return '\n'.join(pieces)


def paragraphs(doc: Document) -> List[str]:
    return [normalize_whitespace(p.text) for p in doc.paragraphs if normalize_whitespace(p.text)]


def extract_si_number(text: str) -> str:
    match = re.search(r'SI Number:\s*([A-Za-z0-9\-]+)', text)
    return match.group(1) if match else ''


def split_sections(paragraph_lines: List[str]) -> Dict[str, str]:
    idxs: List[Tuple[int, str]] = []
    for i, line in enumerate(paragraph_lines):
        if line in SECTION_HEADINGS:
            idxs.append((i, line))
    sections: Dict[str, str] = {}
    for pos, (start_idx, heading) in enumerate(idxs):
        end_idx = idxs[pos + 1][0] if pos + 1 < len(idxs) else len(paragraph_lines)
        body = ' '.join(paragraph_lines[start_idx + 1:end_idx]).strip()
        if body:
            sections[heading] = body
    return sections


def tokenize(text: str) -> set[str]:
    return {
        token for token in re.sub(r'[^a-z0-9\s]', ' ', text.lower()).split()
        if len(token) > 2 and token not in STOPWORDS
    }


def list_tokens(values: Iterable[str]) -> set[str]:
    merged: set[str] = set()
    for value in values:
        merged |= tokenize(value)
    return merged


def jaccard(a: set[str], b: set[str]) -> float:
    if not a and not b:
        return 0.0
    union = a | b
    if not union:
        return 0.0
    return len(a & b) / len(union)


def pair_score(app_a: Dict, app_b: Dict, weights: Dict[str, float]) -> float:
    purpose = jaccard(tokenize(app_a['business_purpose']), tokenize(app_b['business_purpose']))
    capabilities = jaccard(list_tokens(app_a['capabilities']), list_tokens(app_b['capabilities']))
    features = jaccard(list_tokens(app_a['features']), list_tokens(app_b['features']))
    tech = jaccard(list_tokens(app_a['tech_stack']), list_tokens(app_b['tech_stack']))
    data_domains = jaccard(list_tokens(app_a['data_domains']), list_tokens(app_b['data_domains']))
    region = jaccard(list_tokens(app_a['region_scope']), list_tokens(app_b['region_scope']))
    classification = 1.0 if app_a['data_classification'] == app_b['data_classification'] else 0.0
    data = (0.6 * data_domains) + (0.2 * region) + (0.2 * classification)
    total_weight = sum(weights.values()) or 1.0
    return (
        weights['purpose'] * purpose +
        weights['capabilities'] * capabilities +
        weights['features'] * features +
        weights['tech'] * tech +
        weights['data'] * data
    ) / total_weight


def compute_layout(apps: List[Dict], weights: Dict[str, float], scale: float = 7.0) -> Dict[str, Dict[str, float]]:
    n = len(apps)
    distances = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            score = pair_score(apps[i], apps[j], weights)
            dist = max(0.05, 1.0 - score)
            distances[i][j] = distances[j][i] = dist
    mds = MDS(n_components=3, dissimilarity='precomputed', random_state=42, normalized_stress='auto', n_init=4, init='random')
    coords = mds.fit_transform(distances)
    max_abs = max(abs(value) for row in coords for value in row) or 1.0
    scaled = coords / max_abs * scale
    result: Dict[str, Dict[str, float]] = {}
    for app, row in zip(apps, scaled):
        result[app['id']] = {'x': round(float(row[0]), 3), 'y': round(float(row[1]), 3), 'z': round(float(row[2]), 3)}
    return result


def build_profile(doc_path: Path, config: Dict) -> Dict:
    doc = Document(doc_path)
    raw_text = document_text(doc)
    para_lines = paragraphs(doc)
    sections = split_sections(para_lines)
    metadata = metadata_from_table(doc)
    title = title_from_table(doc)
    si_number = extract_si_number(raw_text) or config.get('si_number') or ''
    profile = {
        **config,
        'source_type': 'Real SAS document',
        'document': {
            'filename': doc_path.name,
            'path': f"source_materials/real_sas_docs/{doc_path.name}",
            'title': title,
            'version': metadata.get('Version', ''),
            'author': metadata.get('Author', ''),
            'issue_date': metadata.get('Issue Date', ''),
            'document_status': metadata.get('Document Status', ''),
        },
        'si_number': si_number,
        'source_excerpt': {
            'background': sections.get('Background', '')[:900],
            'objectives': sections.get('Objectives and Scope', '')[:900],
            'architecture_layers': sections.get('Architecture Layers', '')[:900],
            'security': sections.get('Security Questionnaire', '')[:900],
        },
    }
    return profile


def build_profiles() -> List[Dict]:
    profiles: List[Dict] = []
    for filename, config in CONFIGS.items():
        path = REAL_SAS_DIR / filename
        profiles.append(build_profile(path, config))

    layouts = {
        'embedding3d': {'purpose': 0.30, 'capabilities': 0.25, 'features': 0.20, 'tech': 0.15, 'data': 0.10},
        'tech_focus': {'purpose': 0.20, 'capabilities': 0.18, 'features': 0.15, 'tech': 0.35, 'data': 0.12},
        'purpose_focus': {'purpose': 0.42, 'capabilities': 0.22, 'features': 0.18, 'tech': 0.10, 'data': 0.08},
    }
    coords_by_layout = {layout_key: compute_layout(profiles, weights) for layout_key, weights in layouts.items()}
    for profile in profiles:
        profile['coords'] = {layout_key: coords[profile['id']] for layout_key, coords in coords_by_layout.items()}
    return profiles


def render_extracted_profiles_md(profiles: List[Dict]) -> str:
    lines = [
        '# Real SAS-derived profiles',
        '',
        'These normalized profiles are built from the attached Word-format SAS documents.',
        '',
    ]
    for app in profiles:
        doc = app['document']
        lines.extend([
            f"## {app['name']}",
            '',
            f"- Source document: `{doc['filename']}`",
            f"- Document title: {doc['title']}",
            f"- Version / issue date: {doc['version']} / {doc['issue_date']}",
            f"- SI number used in workshop: {app['si_number']}",
            f"- Family: {app['family']}",
            f"- Business purpose: {app['business_purpose']}",
            f"- Capabilities: {', '.join(app['capabilities'])}",
            f"- Tech stack: {', '.join(app['tech_stack'])}",
            f"- Data classification: {app['data_classification']}",
            f"- Notes: {app['notes']}",
            '',
        ])
    return '\n'.join(lines)


def render_readme(profiles: List[Dict]) -> str:
    profile_lines = '\n'.join(f"- **{app['name']}** — {app['family']}" for app in profiles)
    return f"""# AI Application Landscape Workshop v1.1

This package is an **offline interactive demo** for Alan’s AI application landscape and approval workbench.

## What changed from v1

- The workshop now uses the attached **real SAS Word documents only**.
- The click-selection behavior was refactored so the selected application panel follows the clicked node instead of staying stuck on the initial app.

## Real SAS documents included

{profile_lines}

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
"""


def render_mapping_md() -> str:
    return """# Mapping to SAS template

The normalized workshop profile keeps the same core sections as the SAS template:

| Normalized field | SAS section(s) |
|---|---|
| `business_purpose` | Background, Business Needs and Benefits, Objectives and Scope |
| `capabilities` | Application Architecture, Architecture Layers, ML and Analytics |
| `features` | Logical Architecture, System Topology/Context, Interface / Integration Item |
| `tech_stack` | Architecture Layers, Cloud Infrastructure/Services, Security Questionnaire |
| `data_domains` | Data Dependencies – inputs, Data Architecture |
| `data_classification` | Security Questionnaire |
| `deployment_regions` | Environments and Hosting Location |
| `models` | ML and Analytics |
| `nfr` | Availability Hours, System Failure Conditions, Application Resiliency and Recovery |
| `document` | SAS cover/title metadata |

This package links back to the original SAS Word documents used for the workshop.
"""


def render_demo_script(profiles: List[Dict]) -> str:
    steps = [
        '# Demo script',
        '',
        '1. Open `index.html` and let the landscape auto-spin for a few seconds.',
        '2. Click each node to show that the Selected application panel now follows the clicked dot correctly.',
        '3. Use the lens selector to compare the balanced, tech-focused, and purpose-focused layouts.',
        '4. Use the weight sliders to show why two apps move closer in relationship logic even when the base map stays stable.',
        '5. Open the linked source SAS document from the details panel to show traceability back to the real Word document.',
        '',
        'Current real-document nodes:',
    ]
    steps.extend([f"- {app['name']}" for app in profiles])
    return '\n'.join(steps)


def main() -> None:
    profiles = build_profiles()
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    json_text = json.dumps(profiles, indent=2)
    (DATA_DIR / 'applications.json').write_text(json_text, encoding='utf-8')
    (DATA_DIR / 'sas_real_profiles.json').write_text(json_text, encoding='utf-8')
    (ASSETS_DIR / 'workshop-data.js').write_text('window.WORKSHOP_APPS = ' + json_text + ';\n', encoding='utf-8')
    (DOCS_DIR / 'extracted_profiles.md').write_text(render_extracted_profiles_md(profiles), encoding='utf-8')
    (DOCS_DIR / 'mapping_to_sas_template.md').write_text(render_mapping_md(), encoding='utf-8')
    (DOCS_DIR / 'demo_script.md').write_text(render_demo_script(profiles), encoding='utf-8')
    (ROOT / 'README.md').write_text(render_readme(profiles), encoding='utf-8')
    (ASSETS_DIR / 'version.txt').write_text('v1.1-real-sas\n', encoding='utf-8')


if __name__ == '__main__':
    main()
