# EdiBot — datové MVP 2.0

Schválený směr k 2026-11-04. Verze datového kontraktu a referenční sady: **2.0.0**.

## Problém a cíl

Vydavatelé distribuují ediční plány jako grafická PDF a e-maily. Agentury potřebují dohledat plánované téma, jeho kontext a termíny napříč tituly. EdiBot sjednocuje tato data a zachovává jejich původ. Kvantitativní plánování si klient doplní svými výzkumnými daty.

Jádro: **médium → konkrétní vydání/příloha → témata → tři důležité termíny → zdroj**. Klasifikace IPTC doplňuje původní popisy. Profil publika je vydavatelská informace. Cena slouží pouze k hrubé rozpočtové orientaci.

## Schválená pravidla

1. Obsah nabídnutý vydavatelem je příležitostí pro umístění inzerce. Jednotlivé formáty a podmínky domlouvá inzerent s vydavatelem. Nevyžadujeme nové potvrzení dostupnosti každého tématu. Výslovné omezení přesto zachováme.
2. Jediným dnem vydání je vydavatelem dodaný termín, ať zdroj píše „Vydání“ nebo „V prodeji od“.
3. Zajímají nás uzávěrka příjmu inzerce a uzávěrka dodání podkladů. Další produkční termíny se nepřevádějí na tyto dvě kategorie bez doložení.
4. Obecné „Uzávěrky“ Echo/Hrot byly pro tento pilot schváleny jako příjem inzerce; tuto interpretaci neděláme neviditelně u budoucích zdrojů.
5. Všechny orientační ceny v CZ sadě jsou bez DPH za standardní inzertní 1/1. Obálky, balíčky, skutečně sjednané ceny a PR produkce nejsou ceníkovým produktem EdiBotu.
6. Žádné skórování účinnosti, vlastní indexy, CPT ani dopočítávaná afinita. Mediaprojekt a MML-TGI nepřebíráme. Online inventář nyní neřešíme.
7. Výslovná nabídka PR spolupráce se může zachovat v poznámce. Plošná inzerce sama nedokládá možnost vydat PR článek.
8. Téma nesmí ztratit původní název a vazbu na konkrétní zdroj. Nejasnosti zůstávají viditelné.

## Nutné v této verzi

- Přenosná JSON data, jednoznačný kontrakt a kontrola dat bez běhu aplikace.
- Model schopný zapsat více témat jednoho vydání, dvojměsíce, přesná i částečná data a náměty bez určeného vydání.
- Ověření identit, vazeb, zdrojových stránek a aktivních kódů IPTC.
- Ochrana před tichým přepsáním a záměnou historického podkladu za nový plán.
- Reálná referenční sada Echo/Hrot a oddělená syntetická ukázka publisher CSV.

## Co je záměrně až dále

Vlastní příjmová adresa, provoz příjmu e-mailů, AI extrakce z PDF, podpora XLSX a ruční provozní kontrola. Popis procesu je hotový, tyto služby nejsou spuštěné.

JSON exporty z vydavatelských systémů lze později nabídnout jako samostatnou implementační a servisní službu. Jde o obchodní hypotézu, nikoli ověřený příjem. XML/NewsML-G2 přidáme podle konkrétního partnera; není podmínkou poskytování dat. IPTC Media Topics využíváme nezávisle na výměnném formátu.

## Jak poznáme použitelná data

Záznam má původní téma, médium, zdroj a stav kontroly; pokud vydání a termíny existují, má je jednoznačně přiřazené. Přesnost není uměle zvýšena. Klasifikace je zkontrolovaná nebo výslovně nerozhodnutá. Chybějící cena, profil či náklad neblokují evidenci tématu.

Samostatná kontrola `--publishable` odděluje technicky validní referenční pilot od dokončené kurátorské sady. Tato verze obsahuje navržené IPTC klasifikace a neslibuje živou obchodní aktuálnost.

## Rizika a kompromisy

PDF vyžadují kontrolu rozložení a významu sloupců. Stabilní identifikátory a aktualizační režim potřebujeme dohodnout s vydavateli. Nedostatek detailů v názvu nelze napravit domýšlením obsahu. Proto dva obecné Echo speciály zatím nemají kód IPTC.

Rozdělení modelu do propojených kolekcí je o něco rozsáhlejší než jedna tabulka, ale brání duplikaci termínů, cen a profilu publika u desítek témat. Pro vydavatele přesto zůstává pouze jednoduchý tabulkový vstup.
