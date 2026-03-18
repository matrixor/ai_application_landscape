# Real SAS-derived profiles

These normalized profiles are built from the attached Word-format SAS documents.

## Chubb AI

- Source document: `ChubbAI_SAS.docx`
- Document title: Solution Architecture Specification Chubb AI
- Version / issue date: 1.0 / 10/21/2025
- SI number used in workshop: 4698
- Family: Assistants & Document AI
- Business purpose: Centralize Chubb document access and GenAI question answering across mobile, desktop, web, and office channels so business teams can find answers faster, reduce manual research, and improve compliant decision-making.
- Capabilities: document Q&A, semantic search, vector search, document ingestion, metadata extraction, mobile and web access, document comparison, AI app catalog
- Tech stack: AKS, AngularJS, NodeJS, TypeScript, Python, Cosmos DB, Azure AI Search, Azure OpenAI, Azure Blob Storage, ADLS, APIM, Redis, Azure Key Vault
- Data classification: Red SPI
- Notes: Uses the real Chubb AI SAS Word document.

## GDP Quantexa

- Source document: `EA_5145_Solution Architecture Specification Quantexa_Gate3.docx`
- Document title: Solution Architecture Specification GDP Quantexa
- Version / issue date: 0.1 / 03/05/2025
- SI number used in workshop: 5145
- Family: Fraud & Entity Intelligence
- Business purpose: Provision the Quantexa platform so Chubb teams can perform entity resolution, relationship analytics, and network fraud detection across integrated data sources to improve investigation quality and contextual decision-making.
- Capabilities: entity resolution, network analytics, fraud detection, relationship search, risk assessment, investigation workflows, data integration
- Tech stack: AKS, Azure Databricks, ADLS, Elasticsearch, PostgreSQL, Azure Active Directory, Azure Key Vault, Azure Log Analytics, ADF
- Data classification: N/A (platform scope)
- Notes: Platform-oriented SAS. Security classification rows are marked not applicable for business data because future solution TSGs define business-specific data usage.

## CVPM APAC (Chubb Virtual Portfolio Manager)

- Source document: `Solution Architecture Specification CVPM_APAC.docx`
- Document title: Solution Architecture Specification CVPM APAC(Chubb Virtual Portfolio Manager)
- Version / issue date: 1.0 / 08/21/2025
- SI number used in workshop: 5549
- Family: Pricing & Portfolio Optimization
- Business purpose: Support APAC flow business pricing and portfolio management through real-time monitoring, scenario testing, smoothing and simulation models, and unified dashboards that improve time-to-market and profitable growth decisions.
- Capabilities: portfolio monitoring, price optimization, simulation, scenario testing, anomaly detection, decision support, dashboarding
- Tech stack: AKS, ADLS, APIM, Cosmos DB, Azure Databricks, Confluent Kafka, FastAPI, Python 3.10, Power BI, Snowflake
- Data classification: Red SBI
- Notes: Uses the real CVPM APAC SAS Word document. The TSG section shows SI 5549, while the document history table shows 5591; this workshop displays the explicit TSG SI value.
