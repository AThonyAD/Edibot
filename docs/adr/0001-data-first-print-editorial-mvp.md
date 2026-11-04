# ADR 0001: Datové MVP zaměřené na tisková ediční témata

Datum: 2026-11-04. Stav: přijato v uživatelské diskusi.

## Kontext

Původní roadmapa směřovala k široké aplikaci s opportunities, eventovými balíčky a rozhraními. Uživatel schválil primárně kurátorovaná data tiskových témat, vydavatelský profil, orientační celostranu a IPTC. Aplikace se nyní nerozvíjí.

## Varianty

Jedna plochá tabulka by rychle začala duplikovat termíny, profil a ceny. Převzetí celého NewsML-G2 by přineslo redakční distribuční model a náklady, které současný záměr nevyžaduje. Propojené JSON kolekce se schématem jsou přenosné a dovolují malý pilot bez rozhodnutí o databázové technologii.

## Rozhodnutí

Vést samostatné datové MVP 2.0 v `data-mvp/`. Zachovat entity médium/vydání/téma, zdroje a doklady, doplňkové profily a odhady. Převzít IPTC Media Topics se stabilními URI. Nepřidávat žádná skóre nebo placená výzkumná data. Vybrané fyzické akce připustit jako prázdné volitelné rozšíření, nikoli hlavní produkt.

## Důsledky

Existující aplikace zůstává starším prototypem a nečte automaticky nový kontrakt. Validace a CSV převod jsou samostatné datové nástroje. Aktuální produktový směr je popsán v nové roadmapě; původní znění je archivováno.
