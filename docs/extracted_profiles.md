# Real SAS-derived profiles

These normalized profiles are built dynamically from every `.docx` file in `source_materials/real_sas_docs/`.

Generation flow:

1. Scan the real SAS folder for Word documents.
2. Parse section headings, metadata tables, interface tables, hosting tables, model tables, and the security questionnaire.
3. Normalize the extracted values into the workshop profile schema.
4. Compute similarity-driven 3D coordinates and write `applications.json`, `sas_real_profiles.json`, and `assets/workshop-data.js`.

## Chubb AI

- Source document: `ChubbAI_SAS.docx`
- Document title: Solution Architecture Specification Chubb AI
- Version / issue date: 1.0 / 10/21/2025
- SI number used in workshop: 4698
- Family: Assistants & Document AI
- Business purpose: Today, the Chubb business team engages in an extensive process of reviewing numerous documents, checklists, and guidelines to conduct research and analysis for decision-making purposes. The motivation behind Chubb AI is to empower business teams, and executives with efficient document management and knowledge retrieval. Provides centralized access to all Chubb documents (e.g., Underwriting Guidelines, Risk Engineering documents, Legal docs) Enables Q&A functionality directly against these documents for fast, accurate information retrieval Deploys Pathfinder as an app on both Chubb mobile phones and desktops for seamless accessibility Includes document sources from critical business units in 
- Capabilities: document Q&A, semantic search, retrieval / RAG
- Tech stack: AKS, Azure Databricks, ADLS, Azure Key Vault, Cosmos DB, Azure AI Search, Azure OpenAI, Azure Blob Storage, APIM, AngularJS, NodeJS, TypeScript, Python, Snowflake
- Data classification: Red SPI
- Interfaces: Mobile App & Chubb AI Service, WebApp App & Chubb AI Service, Plugin UI & Chubb AI Service, Chubb AI Service & AI/RAG Service, AI/RAG Service to AI Search DB, AI/RAG Service to Azure OpenAI Service, Chubb AI Service to Cosmos

## GDP Quantexa

- Source document: `EA_5145_Solution Architecture Specification Quantexa_Gate3.docx`
- Document title: Solution Architecture Specification GDP Quantexa
- Version / issue date: 0.1 / 03/05/2025
- SI number used in workshop: 5145
- Family: Fraud & Entity Intelligence
- Business purpose: Quantexa is a data analytics platform designed to enhance decision-making through advanced contextual decision intelligence. The following are key motivators for the GDP Quantexa platform: Enhanced Data Integration: Organizations often struggle with siloed data across various systems. We are onboarding Quantexa to the platform so that it can be leveraged for Entity Resolution and Network Fraud Detection.
- Capabilities: entity resolution, fraud detection, investigation workflows, retrieval / RAG
- Tech stack: AKS, Azure Databricks, ADLS, Elasticsearch, PostgreSQL, Azure Active Directory, Azure Key Vault, Azure Blob Storage, APIM, Quantexa
- Data classification: N/A (platform scope)
- Interfaces: ADLS to Databricks, Databricks to Elasticsearch, Quantexa to Elasticsearch, Quantexa to PostgreSQL

## North America MS Dynamics Platform for Claims

- Source document: `SI 5877 SAS - Claims Instance of MS Dynamic Platform 0v4.docx`
- Document title: Solution Architecture Specification North America MS Dynamics Platform for Claims
- Version / issue date: 0.4 / 12/Mar/2026
- SI number used in workshop: 5877
- Family: Assistants & Document AI
- Business purpose: The business problem revolves around the significant amount of time adjusters spend accumulating information from various fragmented sources to adjudicate claims. The Claims Adjuster Desktop is a platform that will streamline the certain claims function for adjudication claims in ClaimVision & ClaimConnect claims through a new UI that interfaces with these existing core systems. We are planning to migrate the application from the existing MS Dynamics instance to a new instance in
- Capabilities: document Q&A, dashboarding, retrieval / RAG, summarization
- Tech stack: AKS, Azure Active Directory, Azure Key Vault, APIM, Redis, AngularJS, Power BI, Confluent Kafka, OAuth
- Data classification: Yellow
- Interfaces: Dynamics 365 – UI Transformation Layer (API), ADT UI Transformation Layer – ADT Orchestration Layer, ADT Orchestration Layer - DCP, Orchestration Layer – Core Claim Systems, ADT IFRAME Apps – Claim Analytics APIs, Claims Analytics APIs, Claim Systems DB – Mass Ingestion – ADT Change Log DB, Claims Management Systems – Mass Ingestion – ADT Change Log DB, Claim Systems – Kafka, Claims Management Systems – Kafka, Change Log Access API – Change Log DB, Change Log Access API to DB

## CVPM APAC (Chubb Virtual Portfolio Manager)

- Source document: `Solution Architecture Specification CVPM_APAC.docx`
- Document title: Solution Architecture Specification CVPM APAC(Chubb Virtual Portfolio Manager)
- Version / issue date: 1.0 / 08/21/2025
- SI number used in workshop: 5549
- Family: Pricing & Portfolio Optimization
- Business purpose: Portfolio+ is a strategic initiative aimed at revolutionizing the Flow business by delivering real-time monitoring and comprehensive insights, enabling a more streamlined price decision-making process and faster time-to-market, all aimed at achieving profitable portfolio growth. Chubb has a diverse global portfolio of flow businesses operating at high volumes in dynamic, highly competitive marketplaces, requiring advanced portfolio management to increase the profitability of Chubb products: Improved Decision-Making: Centralized data and real-time analytics support more accurate and timely pricing strategies.
- Capabilities: portfolio monitoring, price optimization, simulation, scenario testing, anomaly detection, decision support, dashboarding, model monitoring, retrieval / RAG
- Tech stack: AKS, Azure Databricks, ADLS, Azure Active Directory, Azure Key Vault, Cosmos DB, APIM, Power BI, Confluent Kafka, Snowflake, OAuth
- Data classification: Red SBI
- Interfaces: L0 Conversion Model Output and Monitoring data to CVPM, L0 Model output, Monitoring data to CVPM, Monitoring Process, Monitoring Execution (Model Execution and write the output to monitoring container), CVPM Middleware, Middleware Orchestrator to Integrate UI, mode execution and data, Decision Engine Model, Decision Engine Model Execution (Smoothing, Simulator), UI, Portfolio UI
