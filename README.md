# Edibot

Edibot je jednoduchá webová aplikace pro evidenci, správu a vyhledávání komunikačních příležitostí.

Cílem MVP je nahradit roztříštěné PDF, Excel tabulky, e-maily a telefonické ověřování jedním levným katalogem, kde lze hledat napříč:

- edičními plány médií,
- tematickými přílohami,
- speciálními vydáními,
- konferencemi a eventy,
- sponsoringem,
- newslettery,
- podcastovými speciály,
- dalšími PR a marketingovými příležitostmi.

## Produktový směr

Základní entita systému je `Opportunity` - obecná příležitost. Mediální téma je jen jeden z jejích typů.

AI nemá být úložiště dat. Data zůstávají v SQLite databázi a AI má později sloužit jen jako vyhledávací, interpretační a doporučovací vrstva nad aplikačním API.

## Aktuální technický směr

Projekt zatím zůstává maximálně jednoduchý:

- React + Vite frontend
- Express backend
- SQLite databáze
- jeden Node server pro lokální běh i levný hosting

Supabase/PostgreSQL je odložený krok pro chvíli, kdy bude potřeba silnější správa rolí, audit nebo vyšší provoz.

## Lokální spuštění

Požadavky:

- Node.js

Postup:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Aplikace běží na:

```text
http://localhost:3000
```

## Demo účty

Aktuální prototyp seeduje demo účty při prázdné databázi:

- vydavatel: `vydavatel1@test.cz` / `heslo123`
- vydavatel: `vydavatel2@test.cz` / `heslo123`
- klient: `klient1@test.cz` / `heslo123`
- admin: `admin@test.cz` / `admin123`

Tyto účty jsou pouze pro vývoj. Před produkčním provozem je potřeba doplnit hashování hesel a autorizaci API podle rolí.

## Nejbližší cíle

1. Uklidit prototyp a odstranit duplicitní soubory.
2. Zavést obecný datový model `Opportunity`.
3. Převést současná témata na příležitosti.
4. Přidat jednoduché role a oprávnění.
5. Připravit import existujících dat.
6. Přidat katalog, filtry a export.
