# EdiBot Data MVP 2.0.0

Verze z 4. listopadu 2026. Hlavním produktem je kurátorovaná databáze edičních témat tištěných médií. Tato samostatná datová část nevyžaduje spuštění původní aplikace.

## Co je hotové

- Schválený model médium → vydání/příloha → témata, doložené zdroji.
- Jediný termín vydání, uzávěrka příjmu inzerce a uzávěrka podkladů.
- Klasifikace IPTC Media Topics se stabilními URI, verzí a původem přiřazení.
- Orientační cena standardní celostrany bez DPH pro český trh.
- Doplňkový vydavatelský profil publika a oddělené údaje o nákladu.
- Pilot Echo/Hrot: **2 média, 37 vydání/příloh, 47 témat, 2 cenové odhady, 4 údaje o nákladu, 155 dokladů**.
- Schémata JSON Schema, kontrola vazeb a zdrojů, CSV šablona a převod CSV do návrhu importu.

## Rychlé ověření

Ověřeno s Pythonem 3.12. Příkazy spouštějte z kořene repozitáře.

```console
python -m pip install -r data-mvp/requirements.txt
python data-mvp/tools/validate.py
python -m unittest discover -s data-mvp/tests -v
```

Ověření neprovádí žádné síťové dotazy ani změny aplikace. Standardní validace připouští rozpracovanou kurátorskou klasifikaci; `--publishable` navíc vyžaduje dokončenou kontrolu. U tohoto referenčního pilotu má tento přísnější režim zatím selhat: přiřazení IPTC jsou návrhy, ne finální schválené záznamy.

## Příjem tabulky od vydavatele

```console
python data-mvp/tools/import_csv.py data-mvp/examples/publisher-submission.csv --source-id source-example --received-on 2026-11-04 --output candidate.json
python data-mvp/tools/validate.py candidate.json --submission
```

Převod vytváří kandidátní podání. Nikdy neslučuje data do hlavní sady a nepřepisuje existující výstupní soubor. Ukázkové CSV je výslovně syntetické, aby nebylo zaměněno za skutečnou nabídku.

## Obsah a omezení pilotu

Hlavní data jsou v [data/dataset.json](data/dataset.json). Obě PDF byla zkontrolována; soubory, e-maily ani osobní kontakty do této sady nepřikládáme. Zdroje mají název, kontrolní součet a stránkové odkazy. Hrotův právní vydavatel zůstává neurčený; SPM MEDIA nezaměňujeme automaticky za konkrétní právnickou osobu.

Obecný sloupec „Uzávěrka“ byl **na výslovné schválení uživatele 2026-11-04** převeden na příjem inzerce. Každý takový převod má původ `context_interpreted`. Původní označení je zachováno. Datum „V prodeji od“ je jednotně `publication_date`.

Uzávěrky dodání podkladů u konkrétních vydání nejsou v pilotu doplněné domněnkou. Echo uvádí obecné pravidlo 10 dní před otištěním; toto znění je zachováno u média, ale bez automatického přepočítání na všechny konkrétní termíny.

Slovník obsahuje pouze použité pojmy a jejich předky: **44 pojmů z oficiálního vydání IPTC 2026-10-16**, nikoli celý číselník. Dvě obecně pojmenované položky Echa („Rozhovory“ a „The Best of“) nemají dostatečně určitý předmět pro přiřazení kódu; validátor je hlásí jako dvě známá upozornění.

Historické plánované datum se automaticky nemění na „vydáno“. Data nejsou živým potvrzením současné obchodní nabídky. Neobsahují skórování, CPT, afinitu, online inventář, podrobný ceník ani placená výzkumná data.

## Dokumentace

- [Produktový rozsah a podoba MVP](../docs/mvp-v2.md)
- [Datový model a slovník](../docs/data-model-v2.md)
- [Pravidla příjmu a aktualizací](../docs/data-intake.md)
- [Roadmapa](../ROADMAP.md)
- [Změny](CHANGELOG.md)
- [Attribution a zdroje standardů](NOTICE.md)

Příjem e-mailů/PDF a automatická AI extrakce jsou popsané provozní kroky k zavedení, nikoli již běžící služby. Hosting, veřejné API a přepis aplikace nejsou součástí této verze.
