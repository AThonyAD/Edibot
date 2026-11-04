# Changelog

## 2.0.0 — 2026-11-04

Initial versioned **data MVP**, based on the approved design discussed on 2026-11-04. This is not an application release or a production import service.

- Made print editorial topics the primary product; retained selected event sponsorship as an empty optional extension.
- Separated publisher, title, edition, topic, publisher audience profile, circulation, approximate page price, sources and evidence.
- Adopted one `publication_date`, `booking_deadline`, `materials_deadline`, with precision and original labels preserved.
- Treated publisher-offered topics as advertising opportunities; size, format and commercial terms are agreed directly with the publisher.
- Used approximate standard-full-page prices **net of VAT** for the CZ dataset; removed per-record `vat_status`, rate cards and online formats.
- Added versioned IPTC Media Topics URI assignments without scoring or affinity metrics.
- Added source-backed Echo/Hrot reference pilot: 37 editions and 47 top-level topics.
- Recorded explicit user approval for interpreting generic publisher deadlines as advertising booking deadlines.
- Added minimal publisher CSV intake, candidate JSON conversion, validation and meaningful regression tests.
- Defined PDF/email intake first, optional XLSX/CSV next, and publisher JSON exports as a later possible paid service.
- Retained the original application and archived the previous roadmap rather than silently continuing its broader product scope.
