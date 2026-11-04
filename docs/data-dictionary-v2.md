# Datový slovník 2.0.0

Odvozeno ze závazného JSON schématu. Povinné pole může mít hodnotu `null`, pokud ji schéma připouští. Neznámé vlastnosti se odmítají.

Koncepty, stavy a datové typy doplňuje [výklad modelu](data-model-v2.md).

## dataset

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `schema_version` | enum: 2.0.0 | ano | — |
| `dataset_id` | string | ano | — |
| `dataset_version` | string | ano | — |
| `as_of` | string (date) | ano | Den sestavení a posouzení tohoto datasetu. |
| `scope` | enum: reference_pilot, curated_dataset | ano | Výslovně přiznaný rozsah dat či slovníku. |
| `market` | enum: CZ | ano | — |
| `price_convention` | enum: standard_full_page_net | ano | Jednotná konvence české sady: standardní 1/1 bez DPH. |
| `taxonomy` | object | ano | — |
| `publishers` | array<publisher> | ano | — |
| `media_titles` | array<media_title> | ano | — |
| `audience_profiles` | array<audience_profile> | ano | — |
| `editions` | array<edition> | ano | — |
| `editorial_topics` | array<editorial_topic> | ano | — |
| `page_price_estimates` | array<page_price_estimate> | ano | — |
| `circulation_observations` | array<circulation_observation> | ano | — |
| `sources` | array<source> | ano | — |
| `evidence` | array<evidence> | ano | — |
| `changes` | array<change> | ano | — |
| `events` | array<event> | ano | — |
| `sponsorship_offers` | array<sponsorship_offer> | ano | — |

## temporal

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `start` | string (date) | ano | — |
| `end` | string (date) | ano | — |
| `precision` | enum: day, month, year, range | ano | — |
| `text_raw` | string | ano | — |
| `normalization` | enum: explicit, year_from_document, period_from_label, context_interpreted, calculated | ano | — |

## contact

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `name` | string / null | ano | — |
| `role` | string / null | ano | — |
| `email` | string (email) / null | ano | — |
| `phone` | string / null | ano | — |
| `evidence_ids` | array<string> | ano | Odkazy na doklady pro tento záznam. |

## assignment

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `concept_uri` | string | ano | Stabilní identifikátor pojmu IPTC Media Topics. |
| `taxonomy_release` | string (date) | ano | Použitá verze slovníku IPTC. |
| `assignment_origin` | enum: publisher, curator, automated | ano | Kdo klasifikaci přiřadil; publisher, curator nebo automated. |
| `assignment_status` | enum: proposed, reviewed | ano | Návrh nebo zkontrolované přiřazení; bez číselného hodnocení. |
| `evidence_ids` | array<string> | ano | Odkazy na doklady pro tento záznam. |

## publisher

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `id` | string | ano | Stabilní identifikátor záznamu; nemění se se změnou názvu či data. |
| `version` | integer | ano | Verze daného záznamu. |
| `curation_status` | enum: draft, reviewed, needs_review, superseded | ano | Stav datové kontroly, nikoli hodnocení média. |
| `created_on` | string (date) | ano | Datum založení záznamu v EdiBotu. |
| `updated_on` | string (date) | ano | Datum poslední změny záznamu. |
| `last_checked_on` | string (date) / null | ano | Datum poslední kontroly vůči uvedeným zdrojům. |
| `evidence_ids` | array<string> | ano | Odkazy na doklady pro tento záznam. |
| `name` | string | ano | — |
| `legal_name` | string / null | ano | — |
| `registration_number` | string / null | ano | — |
| `website` | string (uri) / null | ano | — |
| `notes` | string / null | ano | — |

## media_title

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `id` | string | ano | Stabilní identifikátor záznamu; nemění se se změnou názvu či data. |
| `version` | integer | ano | Verze daného záznamu. |
| `curation_status` | enum: draft, reviewed, needs_review, superseded | ano | Stav datové kontroly, nikoli hodnocení média. |
| `created_on` | string (date) | ano | Datum založení záznamu v EdiBotu. |
| `updated_on` | string (date) | ano | Datum poslední změny záznamu. |
| `last_checked_on` | string (date) / null | ano | Datum poslední kontroly vůči uvedeným zdrojům. |
| `evidence_ids` | array<string> | ano | Odkazy na doklady pro tento záznam. |
| `name` | string | ano | — |
| `publisher_id` | string / null | ano | Doložený vydavatel; obchodní zastoupení se za něj automaticky nepovažuje. |
| `parent_media_title_id` | string / null | ano | — |
| `title_type` | enum: newspaper, magazine, supplement | ano | — |
| `language` | string | ano | — |
| `country` | enum: CZ | ano | — |
| `editorial_focus_raw` | string / null | ano | — |
| `editorial_focus_summary` | string / null | ano | — |
| `frequency_raw` | string / null | ano | — |
| `issues_per_year` | integer / null | ano | — |
| `distribution_notes_raw` | string / null | ano | — |
| `sales_representation_raw` | string / null | ano | — |
| `contacts` | array<contact> | ano | — |
| `cooperation_notes_raw` | string / null | ano | Doložené možnosti či omezení; inzerovatelnost nabídnutých témat se předpokládá. |
| `materials_delivery_rule_raw` | string / null | ano | Doložené obecné pravidlo dodání podkladů, bez automatického dopočtu. |

## audience_profile

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `id` | string | ano | Stabilní identifikátor záznamu; nemění se se změnou názvu či data. |
| `version` | integer | ano | Verze daného záznamu. |
| `curation_status` | enum: draft, reviewed, needs_review, superseded | ano | Stav datové kontroly, nikoli hodnocení média. |
| `created_on` | string (date) | ano | Datum založení záznamu v EdiBotu. |
| `updated_on` | string (date) | ano | Datum poslední změny záznamu. |
| `last_checked_on` | string (date) / null | ano | Datum poslední kontroly vůči uvedeným zdrojům. |
| `evidence_ids` | array<string> | ano | Odkazy na doklady pro tento záznam. |
| `media_title_id` | string | ano | Vazba na konkrétní tištěné médium. |
| `profile_raw` | string / null | ano | — |
| `summary_cs` | string / null | ano | Věrná kurátorská parafráze doloženého obsahu. |
| `roles` | array<string> | ano | — |
| `industries` | array<string> | ano | — |
| `interests` | array<string> | ano | — |
| `age_min` | integer / null | ano | — |
| `age_max` | integer / null | ano | — |
| `demographic_notes_raw` | string / null | ano | — |
| `geographic_notes_raw` | string / null | ano | — |
| `claim_origin` | enum: publisher_declared | ano | Původ tvrzení o publiku; nyní pouze deklarace vydavatele. |
| `reference_period` | temporal / null | ano | Období, ke kterému se údaj vztahuje, pokud je doloženo. |
| `measurement_period` | temporal / null | ano | Skutečné období měření, pokud je uvedeno; není totožné s rokem mediakitu. |
| `methodology_raw` | string / null | ano | Metodika uvedená vydavatelem, jinak neznámá. |

## edition

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `id` | string | ano | Stabilní identifikátor záznamu; nemění se se změnou názvu či data. |
| `version` | integer | ano | Verze daného záznamu. |
| `curation_status` | enum: draft, reviewed, needs_review, superseded | ano | Stav datové kontroly, nikoli hodnocení média. |
| `created_on` | string (date) | ano | Datum založení záznamu v EdiBotu. |
| `updated_on` | string (date) | ano | Datum poslední změny záznamu. |
| `last_checked_on` | string (date) / null | ano | Datum poslední kontroly vůči uvedeným zdrojům. |
| `evidence_ids` | array<string> | ano | Odkazy na doklady pro tento záznam. |
| `media_title_id` | string | ano | Vazba na konkrétní tištěné médium. |
| `parent_edition_id` | string / null | ano | Doložené mateřské vydání přílohy. |
| `edition_type` | enum: regular_issue, supplement, special, unspecified | ano | — |
| `edition_label_raw` | string / null | ano | — |
| `issue_number` | string / null | ano | — |
| `title_raw` | string / null | ano | Původní název podle zdroje. |
| `coverage_period` | temporal / null | ano | Období označující vydání, nikoli další den publikace. |
| `publication_date` | temporal / null | ano | Jediný termín vydání dodaný vydavatelem, včetně označení V prodeji od. |
| `booking_deadline` | temporal / null | ano | Uzávěrka příjmu inzerce. |
| `materials_deadline` | temporal / null | ano | Uzávěrka dodání inzertních podkladů. |
| `edition_status` | enum: planned, cancelled, published, unknown | ano | Stav podle podkladu; minulý termín neprokazuje vydání. |
| `cooperation_notes_raw` | string / null | ano | Doložené možnosti či omezení; inzerovatelnost nabídnutých témat se předpokládá. |

## editorial_topic

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `id` | string | ano | Stabilní identifikátor záznamu; nemění se se změnou názvu či data. |
| `version` | integer | ano | Verze daného záznamu. |
| `curation_status` | enum: draft, reviewed, needs_review, superseded | ano | Stav datové kontroly, nikoli hodnocení média. |
| `created_on` | string (date) | ano | Datum založení záznamu v EdiBotu. |
| `updated_on` | string (date) | ano | Datum poslední změny záznamu. |
| `last_checked_on` | string (date) / null | ano | Datum poslední kontroly vůči uvedeným zdrojům. |
| `evidence_ids` | array<string> | ano | Odkazy na doklady pro tento záznam. |
| `media_title_id` | string | ano | Vazba na konkrétní tištěné médium. |
| `edition_id` | string / null | ano | Vazba na konkrétní vydání, může být neznámá. |
| `parent_topic_id` | string / null | ano | Nadřazené téma stejného média a vydání. |
| `title_raw` | string | ano | Původní název podle zdroje. |
| `description_raw` | string / null | ano | Původní popis, pokud je převzat; ne kurátorský výmysl. |
| `summary_cs` | string / null | ano | Věrná kurátorská parafráze doloženého obsahu. |
| `keywords` | array<string> | ano | Kurátorská klíčová slova, nikoli skóre. |
| `planning_period` | temporal / null | ano | Období plánovaného tématu bez konkrétního vydání. |
| `editorial_status` | enum: planned, cancelled, published, unknown | ano | Stav plánovaného tématu, nepřepočítává se podle aktuálního dne. |
| `classification_status` | enum: pending, reviewed, reviewed_unmapped | ano | Rozpracovaná, zkontrolovaná nebo zkontrolovaná bez obhajitelného kódu. |
| `iptc_assignments` | array<assignment> | ano | Přiřazení pojmů IPTC; nejsou hodnocením účinnosti. |
| `cooperation_notes_raw` | string / null | ano | Doložené možnosti či omezení; inzerovatelnost nabídnutých témat se předpokládá. |
| `booking_deadline_override` | temporal / null | ano | Výslovný odlišný termín tématu; null znamená použít termín vydání, je-li známý. |
| `materials_deadline_override` | temporal / null | ano | Výslovný odlišný termín podkladů pro téma; jinak použít vydání. |

## page_price_estimate

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `id` | string | ano | Stabilní identifikátor záznamu; nemění se se změnou názvu či data. |
| `version` | integer | ano | Verze daného záznamu. |
| `curation_status` | enum: draft, reviewed, needs_review, superseded | ano | Stav datové kontroly, nikoli hodnocení média. |
| `created_on` | string (date) | ano | Datum založení záznamu v EdiBotu. |
| `updated_on` | string (date) | ano | Datum poslední změny záznamu. |
| `last_checked_on` | string (date) / null | ano | Datum poslední kontroly vůči uvedeným zdrojům. |
| `evidence_ids` | array<string> | ano | Odkazy na doklady pro tento záznam. |
| `media_title_id` | string | ano | Vazba na konkrétní tištěné médium. |
| `edition_id` | string / null | ano | Vazba na konkrétní vydání, může být neznámá. |
| `approx_page_price_net` | number | ano | Přibližná cena standardní inzertní celostrany bez DPH. |
| `currency` | enum: CZK | ano | — |
| `estimate_basis` | enum: publisher_estimate, publisher_rate_rounded | ano | Způsob získání odhadu; zaokrouhlení základní celostrany nebo odhad vydavatele. |
| `reference_period` | temporal / null | ano | Období, ke kterému se údaj vztahuje, pokud je doloženo. |
| `note` | string / null | ano | — |

## circulation_observation

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `id` | string | ano | Stabilní identifikátor záznamu; nemění se se změnou názvu či data. |
| `version` | integer | ano | Verze daného záznamu. |
| `curation_status` | enum: draft, reviewed, needs_review, superseded | ano | Stav datové kontroly, nikoli hodnocení média. |
| `created_on` | string (date) | ano | Datum založení záznamu v EdiBotu. |
| `updated_on` | string (date) | ano | Datum poslední změny záznamu. |
| `last_checked_on` | string (date) / null | ano | Datum poslední kontroly vůči uvedeným zdrojům. |
| `evidence_ids` | array<string> | ano | Odkazy na doklady pro tento záznam. |
| `media_title_id` | string | ano | Vazba na konkrétní tištěné médium. |
| `metric` | enum: printed_copies, sold_copies, sold_plus_subscriptions, controlled_distribution | ano | — |
| `value` | integer | ano | Doložená hodnota; nula není chybějící údaj. |
| `reference_period` | temporal / null | ano | Období, ke kterému se údaj vztahuje, pokud je doloženo. |
| `source_origin` | enum: publisher, abc | ano | Původ údaje o nákladu; publisher a ABC se odlišují. |
| `audit_status` | enum: audited, not_yet_audited, unspecified | ano | Skutečně doložený stav ověření nákladu. |
| `label_raw` | string | ano | — |

## source

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `id` | string | ano | Stabilní identifikátor záznamu; nemění se se změnou názvu či data. |
| `source_type` | enum: pdf, spreadsheet, document, email, web, publisher_confirmation, csv | ano | — |
| `title` | string | ano | — |
| `filename` | string / null | ano | — |
| `url` | string (uri) / null | ano | — |
| `parent_source_id` | string / null | ano | — |
| `originator_raw` | string / null | ano | — |
| `document_date` | string (date) / null | ano | Datum zdroje, pokud je doloženo. |
| `received_on` | string (date) / null | ano | Den přijetí podkladu, pokud je známý. |
| `reference_period` | temporal / null | ano | Období, ke kterému se údaj vztahuje, pokud je doloženo. |
| `sha256` | string / null | ano | Kontrolní součet přesné verze souboru. |
| `page_count` | integer / null | ano | — |
| `access_level` | enum: public, internal, restricted | ano | Přístupnost originálního podkladu, nikoli jeho metadat. |
| `redistribution_note` | string / null | ano | Doložené podmínky dalšího použití; null neznamená udělený souhlas. |

## evidence

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `id` | string | ano | Stabilní identifikátor záznamu; nemění se se změnou názvu či data. |
| `source_id` | string | ano | Odkaz na konkrétní verzi zdroje. |
| `collection` | enum: publishers, media_titles, audience_profiles, editions, editorial_topics, page_price_estimates, circulation_observations, sources, events, sponsorship_offers | ano | Kolekce cílového záznamu. |
| `record_id` | string | ano | Odkaz na podporovaný nebo změněný záznam. |
| `field_paths` | array<string> | ano | JSON Pointer cesty k polím podporovaného záznamu. |
| `page` | integer / null | ano | Pořadí stránky PDF od 1; u webu může chybět. |
| `locator` | string / null | ano | — |
| `source_text` | string / null | ano | Původní krátký úsek zdroje pro kontrolu; parafráze patří do interpretation_note. |
| `interpretation_note` | string / null | ano | Vysvětlení normalizace, parafráze nebo kontextové interpretace. |
| `value_origin` | enum: stated, normalized, curator_assigned, context_interpreted, calculated | ano | Rozlišení doslovného převzetí, normalizace, kurátorského přiřazení a výpočtu. |
| `verification_method` | enum: source_checked, publisher_confirmed | ano | Kontrola podkladu není automaticky nové potvrzení vydavatelem. |
| `checked_on` | string (date) | ano | — |

## change

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `id` | string | ano | Stabilní identifikátor záznamu; nemění se se změnou názvu či data. |
| `collection` | enum: publishers, media_titles, audience_profiles, editions, editorial_topics, page_price_estimates, circulation_observations, sources, evidence, events, sponsorship_offers | ano | Kolekce cílového záznamu. |
| `record_id` | string | ano | Odkaz na podporovaný nebo změněný záznam. |
| `field_path` | string | ano | — |
| `old_value` | libovolná JSON hodnota | ano | Hodnota před doloženou změnou. |
| `new_value` | libovolná JSON hodnota | ano | Hodnota po doložené změně. |
| `changed_on` | string (date) | ano | — |
| `changed_by` | string | ano | Identifikace kurátora či procesu provádějícího změnu. |
| `reason` | string | ano | Důvod změny. |
| `evidence_ids` | array<string> | ano | Odkazy na doklady pro tento záznam. |

## event

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `id` | string | ano | Stabilní identifikátor záznamu; nemění se se změnou názvu či data. |
| `version` | integer | ano | Verze daného záznamu. |
| `curation_status` | enum: draft, reviewed, needs_review, superseded | ano | Stav datové kontroly, nikoli hodnocení média. |
| `created_on` | string (date) | ano | Datum založení záznamu v EdiBotu. |
| `updated_on` | string (date) | ano | Datum poslední změny záznamu. |
| `last_checked_on` | string (date) / null | ano | Datum poslední kontroly vůči uvedeným zdrojům. |
| `evidence_ids` | array<string> | ano | Odkazy na doklady pro tento záznam. |
| `name` | string | ano | — |
| `organizer_raw` | string / null | ano | — |
| `description_raw` | string / null | ano | Původní popis, pokud je převzat; ne kurátorský výmysl. |
| `location_raw` | string / null | ano | — |
| `event_period` | temporal / null | ano | — |
| `iptc_assignments` | array<assignment> | ano | Přiřazení pojmů IPTC; nejsou hodnocením účinnosti. |

## sponsorship_offer

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `id` | string | ano | Stabilní identifikátor záznamu; nemění se se změnou názvu či data. |
| `version` | integer | ano | Verze daného záznamu. |
| `curation_status` | enum: draft, reviewed, needs_review, superseded | ano | Stav datové kontroly, nikoli hodnocení média. |
| `created_on` | string (date) | ano | Datum založení záznamu v EdiBotu. |
| `updated_on` | string (date) | ano | Datum poslední změny záznamu. |
| `last_checked_on` | string (date) / null | ano | Datum poslední kontroly vůči uvedeným zdrojům. |
| `evidence_ids` | array<string> | ano | Odkazy na doklady pro tento záznam. |
| `event_id` | string | ano | — |
| `description_raw` | string | ano | Původní popis, pokud je převzat; ne kurátorský výmysl. |
| `deliverables_raw` | string / null | ano | — |
| `booking_deadline` | temporal / null | ano | Uzávěrka příjmu inzerce. |
| `contact` | contact / null | ano | — |

## concept

| Pole | Typ | Povinné | Význam |
|---|---|---|---|
| `uri` | string | ano | — |
| `code` | string | ano | — |
| `label_en` | string | ano | — |
| `parent_uri` | string (uri) / null | ano | — |
| `retired` | boolean | ano | — |
