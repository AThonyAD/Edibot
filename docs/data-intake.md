# Příjem a aktualizace dat

## První cesta: dosavadní e-mail a PDF

Vydavatel přidá příjmovou adresu EdiBotu ke stávajícím obchodním příjemcům. Pokud už má zdrojovou tabulku, může ji přiložit. Nevyžadujeme, aby si kvůli nám pořizoval nový systém nebo opisoval celý mediakit.

1. Uchovat originál, datum přijetí a kontrolní součet; oddělit původní zprávu, přeposlání a přílohu.
2. Zjistit rok a rozsah plánu. Nově doručený plán 2024 zůstává plánem 2024.
3. Připravit médium, vydání a témata s odkazy na stránky. Automatické vytěžení je návrh ke kontrole.
4. Přiřadit termín vydání, příjem inzerce a podklady. Původní názvy sloupců zachovat v dokladech.
5. Zkontrolovat změny proti předchozím záznamům a přidat IPTC.
6. Schválit zápis do kurátorované sady a zaznamenat podstatné změny.

Příjmová adresa ani PDF extrakce nejsou v MVP 2.0 implementované. Schválený datový proces a již vytěžený referenční pilot slouží jako podklad pro jejich zavedení.

## Tabulkový vstup

Šablona: [publisher-topics.csv](../data-mvp/templates/publisher-topics.csv).

Sedm základních sloupců: `medium`, `edition`, `topic`, `description`, `publication_date`, `booking_deadline`, `materials_deadline`. V řádku musí být vyplněno médium a téma, další buňky mohou být prázdné. Hlavičky sedmi sloupců jsou povinné pro jednoznačnou kontrolu. Jeden řádek znamená jedno téma; opakované vydání a jeho termíny se při následném kurátorském převodu propojí.

Volitelné sloupce: `publisher_item_id`, `publisher_edition_id`, `status`, `updated_at`. Stabilní identifikátory od vydavatele umožní spolehlivější párování budoucích změn. Datum má tvar `YYYY-MM-DD`. Čas aktualizace, pokud existuje, je ISO 8601 včetně časového pásma. Vydavatel nemusí vyplňovat IPTC, cenu ani profil v každém řádku.

Převod přijímá UTF-8 s případným BOM a běžné CSV oddělovače čárka/středník/tabulátor. Připraví validované kandidátní JSON podání a odmítne nejednoznačné datum či neznámou hlavičku. **Neprovádí automatické sloučení, mazání ani přepis hlavní sady.** XLSX je plánované rozšíření stejné vstupní struktury, nikoli již hotový importér.

Částečné datum lze v JSON podání vyjádřit intervalem a přesností. Jednoduché CSV nyní přijímá pouze přesná data; měsíční plány z PDF zachytí kurátor do kanonického modelu.

## Aktualizační režim

- Výchozí `export_scope` je `partial_update`. Chybějící položka neznamená zrušení.
- `full_plan` musí mít jasně dohodnutý rozsah, například médium a rok. Ani tento příznak v současném převodníku nevyvolává mazání.
- Zrušení oznamuje výslovný `status=cancelled` se stabilním identifikátorem nebo je potvrdí kurátor.
- Párování podle názvu/data je jen návrh. Změna názvu nesmí vytvářet automaticky nové téma a shodná témata v různých vydáních se neslučují.
- Originální vydavatelský identifikátor se při převodu uchová; interní ID EdiBotu zůstává stabilní i po změně termínu.
- Identický soubor lze rozpoznat kontrolním součtem. Nová verze zdroje má vlastní identitu; podporuje aktualizaci existujícího tématu.

## Pozdější exportní služba

Začít mapováním existující tabulky, CMS nebo redakčního systému na malý dohodnutý JSON export. Klíčové jsou stabilní ID, rozsah exportu, změny, zrušení a datum aktualizace. Hostování stálého souboru, přístup a frekvence aktualizací jsou věcí konkrétní integrace.

Existující XML či NewsML-G2 partnera lze mapovat adaptérem. Není důvod zavádět plný standard redakční distribuce všem vydavatelům jen kvůli několika sloupcům edičního plánu.
