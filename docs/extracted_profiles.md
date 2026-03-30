# Extraction notes for the two SAS-derived applications

## Quantexa

**Observed pattern**
- Entity resolution and fraud network analytics platform on Chubb managed Azure.
- Logical and deployment architecture show AKS, Databricks, ADLS, Elasticsearch, PostgreSQL, APIM, Azure AD, and Key Vault.
- Security pages indicate Azure AD / SSO patterns and managed secret handling.
- The SAS appears to position Quantexa as a platform-level approval rather than a single narrow use case.

**Workshop normalization**
- Family: Fraud & Entity Intelligence
- Review status: Pending
- Purpose focus: entity resolution + fraud networks + investigator workflow
- Data classification: `TBD / Platform scope` because the screenshots read like a platform SAS with future solution-specific approvals

**Evidence used**
- Business: `IMG_1175`, `IMG_1176`
- Application architecture: `IMG_1179`, `IMG_1180`, `IMG_1181`
- Data architecture: `IMG_1182`
- Infrastructure: `IMG_1185`, `IMG_1186`, `IMG_1187`
- Security: `IMG_1191`, `IMG_1192`, `IMG_1193`, `IMG_1194`

## CVPM Core APAC

**Observed pattern**
- Portfolio management and flow business monitoring for APAC BizPack.
- Architecture pages show model-driven pricing, monitoring, simulation, dashboards, and a strong AKS / Databricks / ADLS / Cosmos / Kafka / Power BI pattern.
- Security pages show Red SBI data handling.
- Infrastructure pages show regional Azure deployment and passive failover posture.

**Workshop normalization**
- Family: Pricing & Portfolio Optimization
- Review status: Pending
- Purpose focus: portfolio monitoring + conversion / smoothing models + simulation + decision support
- Data classification: Red SBI

**Evidence used**
- Business: `IMG_1291`, `IMG_1293`
- Application architecture: `IMG_1295`, `IMG_1296`, `IMG_1301`
- Data architecture: `IMG_1303`, `IMG_1304`, `IMG_1305`
- Infrastructure: `IMG_1306`, `IMG_1307`, `IMG_1308`, `IMG_1309`
- Security: `IMG_1310`, `IMG_1311`, `IMG_1312`
