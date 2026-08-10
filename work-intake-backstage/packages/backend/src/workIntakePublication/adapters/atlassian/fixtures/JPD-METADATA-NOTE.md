# JPD metadata capture

This is a factual, read-only capture from the configured Atlassian Cloud tenant
on 2026-08-10. `MDP` is a simplified, next-generation
`product_discovery` project with one `Idea` issue type (`10040`). Jira
createmeta reports `project`, `summary`, and `reporter` as required. An existing
Idea returned an ADF description, an attachment field, and no issue properties.

The capture used `GET /project/MDP`, `GET /issue/createmeta`, `GET /field`,
`GET /search/jql`, `GET /issue/{key}/properties`, and `GET /issue/{key}`. No
external writes occurred. The JSON fixture intentionally contains no mapping
choice. It records that create, attachment upload, property write, and a
publication-label reconciliation strategy still need sandbox verification.
