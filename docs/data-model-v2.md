# Datový model EdiBot 2.0.0

Závazná strojová definice: [dataset.schema.json](../data-mvp/schemas/dataset.schema.json). Přehled jednotlivých polí: [data-dictionary-v2.md](data-dictionary-v2.md). Tato verze nahrazuje návrh 1.0 z chatu včetně následně schválených zjednodušení.

## Struktura

`publishers → media_titles → editions → editorial_topics` tvoří hlavní vazby. Profil, náklad a přibližná cena patří k médiu; u ceny je možná doložená odchylka pro konkrétní vydání. Zdrojové dokumenty a doklady se uchovávají samostatně. Vydání může mít více témat; téma může mít nepřiřazené vydání a pouze plánovací období.

| Kolekce | Význam |
|---|---|
| `publishers` | Doložené identity vydavatelů; právní název může chybět |
| `media_titles` | Výhradně tištěná média a dlouhodobě samostatně evidované přílohy |
| `audience_profiles` | Vydavatelské charakteristiky publika s původem a obdobím |
| `editions` | Konkrétní čísla, přílohy a speciály; termín vydání a dvě uzávěrky |
| `editorial_topics` | Původní témata, popisy, kurátorská shrnutí a IPTC |
| `page_price_estimates` | Přibližná cena standardní celostrany bez DPH |
| `circulation_observations` | Oddělené druhy nákladu, původ a stav auditu |
| `sources` | Konkrétní verze PDF, e-mailu, tabulky nebo webu |
| `evidence` | Doklad podpírající konkrétní pole konkrétního záznamu |
| `changes` | Podstatné změny hodnot a jejich důvody |
| `events`, `sponsorship_offers` | Prázdné volitelné rozšíření pro doložené fyzické akce |

V této verzi nejsou samostatné obecné `opportunities`, reklamní produkty, ceníky, účty ani aplikační entity. Uzávěrky jsou přímo dvě pojmenovaná pole vydání, nikoli obecný katalog produkčních dat. Téma může mít výslovně doložené `booking_deadline_override` a `materials_deadline_override`; `null` zde znamená, že se použije termín vydání, pokud je známý.

## Tři termíny a přesnost

`publication_date`, `booking_deadline`, `materials_deadline` používají tentýž nullable typ:

```json
{
  "start": "2026-11-05",
  "end": "2026-11-05",
  "precision": "day",
  "text_raw": "5. listopadu",
  "normalization": "year_from_document"
}
```

Pro přesný den jsou hranice stejné. Pro měsíc či rozsah měsíců vymezují interval, nikoli vymyšlený přesný den. Celý neznámý termín je `null`. `coverage_period` označuje období vydání, nikoli další termín: Hrot leden/únor má období dvou měsíců a jeden den vydání 14. ledna.

`normalization` rozlišuje `explicit`, `year_from_document`, `period_from_label`, `context_interpreted`, `calculated`. V pilotu je rok doplněn z plánu 2026 a význam obecné uzávěrky zaznamenán jako `context_interpreted`. Původní datum "V prodeji od" zůstává v dokladu; žádné `on_sale_date` se nevede.

Uzávěrka po vydání vytváří upozornění ke kontrole, ne automatickou opravu. Uplynutí data nemění záznam na `published`, `cancelled` ani nedostupný. Relativní pravidlo dodání podkladů je zatím původní text u média; nevede k neoznačenému dopočtu termínů.

## Identita, duplicity a změny

Interní ID se nemění s názvem nebo datem. Dvě témata v jednom Hrotu nejsou dvě vydání. Shodný název ve dvou různých číslech není duplicita. Dva zdroje téhož vydání se připojí k jednomu záznamu až po kontrole; samotná tematická podobnost ke sloučení nestačí.

Pozdější zpráva vydavatele založí novou verzi zdroje a změnu existujícího záznamu v `changes`. Není nutné při každém převzetí znovu vytvářet původní téma. Nahrazené údaje zůstávají dohledatelné. Příchozí publisher ID se uchovává v kandidátním podání; finální párování do kanonických ID je zatím kurátorské, nikoli automatické.

## Fakta, shrnutí a klasifikace

- `title_raw`, `description_raw` jsou vydavatelské znění, pokud se přebírá; nepřepisují se shrnutím.
- `summary_cs` je věrná kurátorská parafráze a má doklad s původem `normalized`.
- `keywords` a přiřazení IPTC jsou kurátorské popisy, pokud je nevydal sám vydavatel.
- Přesná citace je `evidence.source_text`; vysvětlení převodu či parafráze je oddělené `interpretation_note`.
- `verification_method=source_checked` neznamená `publisher_confirmed`.

Zdrojový název s lomítkem se při dělení na témata zachová také u vydání. Hrot má v pilotu 11 vydání a 21 hlavních témat. HrotArt zůstává v kurátorském popisu říjnového tématu; do počtu 47 se nepřidává jako další hlavní téma. Echo má 26 jednotek plánu příloh/speciálů, nikoli všechna čísla týdeníku.

## IPTC

Identitou je plné URI `http://cv.iptc.org/newscodes/mediatopic/…`. Slovník má vlastní verzi a může být jen výslovně označeným podmnožinovým výřezem včetně předků. U každého přiřazení ukládáme původ a stav. Vyřazené nebo neznámé kódy validátor odmítne. České názvy nelze vydávat za oficiální překlad IPTC.

`classification_status=pending` znamená návrh ke kontrole; `reviewed` dokončené přiřazení; `reviewed_unmapped` dokončenou kontrolu bez obhajitelného kódu. Pro poslední stav musí být odůvodnění v dokladu/poznámce. Stav `curation_status=reviewed` nelze použít k zakrytí nedokončené klasifikace.

## Ceny, publikum a náklad

V kořeni sady je jediná konvence `market=CZ` a `price_convention=standard_full_page_net`. Cena `approx_page_price_net` je odhad v CZK, nikoli sjednaná nabídka. Měna je v této verzi omezena na CZK; další země a jejich konvence vyžadují novou verzi schématu. Nepoužíváme `vat_status` ani prodejní jednotky CPT/týden.

U profilu rozlišujeme referenční období mediakitu a skutečné období měření. Chybějící období/metodika nejsou doplněny. V pilotu není profil Echo24 přiřazen tištěnému Echu. U nákladu je měřené období neznámé, i když zdrojem je mediakit 2026. `printed_copies` a `sold_plus_subscriptions` jsou různé metriky a nesčítají se.

## Kontrola a historie

Verze záznamu, datum vytvoření/změny a poslední kontroly jsou samostatné. Zde používáme přesnost celého dne (`created_on`, `updated_on`, `last_checked_on`); nevymýšlíme čas vzniku podkladů. `curation_status` je stav datové práce, nikoli účinnost média.

Strojová validace ověřuje schéma, data, vazby, cykly, koncepty, zdrojové stránky a cesty k polím. Nenahrazuje věcnou kontrolu významu textu. Režim `--publishable` navíc vyžaduje dokončenou kuraci. Pilot s navrženými IPTC přiřazeními má technicky projít, ale tento přísnější režim zatím správně neprojde.

Neveřejné originály nejsou součástí veřejné sady. `sources.access_level` popisuje přístupnost originálu, nikoli samotnou přístupnost metadat o zdroji. `redistribution_note=null` není tvrzení o souhlasu vydavatele.
