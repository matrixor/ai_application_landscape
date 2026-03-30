# Mapping from normalized profile to SAS template

The workshop JSON schema was designed to line up with the SAS template so that more applications can be added later without changing the review experience.

| Workshop field | SAS template section | Notes |
|---|---|---|
| `business_purpose`, `business_unit`, `region_scope`, `si_number` | Business Architecture | Captures the “why”, scope, and governance identity of the application. |
| `capabilities`, `features`, `users` | Business Architecture + Application Architecture | Used to cluster applications that solve similar business problems. |
| `interfaces`, `tech_stack` | Application Architecture | Used for relationship scoring and reuse decisions. |
| `data_domains`, `data_classification` | Data Architecture + Security | Helps distinguish apps that look similar functionally but process very different data. |
| `deployment_regions`, `nfr` | Infrastructure / Cloud Architecture + NFRs | Useful for regional clone detection and resiliency comparisons. |
| `models` | Data Architecture → ML and Analytics | Identifies applications that share AI/ML patterns. |
| `evidence_pages` | Cross-reference to source screenshots | Allows the clicked node to point back to the evidence used in the profile. |

## Suggested extraction workflow for future SAS documents

1. Extract the business purpose, scope, and benefits.
2. Normalize AI capabilities into a controlled vocabulary.
3. Normalize features into a controlled vocabulary.
4. Normalize tech stack and major integrations.
5. Classify data domains and highest data classification.
6. Record region, owner, review status, and SI number.
7. Generate similarity and embed into the landscape.
