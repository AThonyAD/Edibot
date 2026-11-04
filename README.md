# EdiBot — datové MVP 2.0

Aktuální směr od 4. listopadu 2026: **kurátorovaná databáze edičních témat tištěných médií**, doplněná IPTC, termíny, profilem publika a přibližnou cenou celostrany bez DPH. Vybrané fyzické akce jsou volitelný doplněk.

Začněte v [data-mvp/README.md](data-mvp/README.md). Samostatná datová sada obsahuje 37 vydání/příloh a 47 témat Echo/Hrot, datová schémata, CSV šablonu, validátor a testy.

- [Produktové vymezení MVP 2.0](docs/mvp-v2.md)
- [Datový model](docs/data-model-v2.md)
- [Datový slovník](docs/data-dictionary-v2.md)
- [Příjem a aktualizace dat](docs/data-intake.md)
- [Roadmapa](ROADMAP.md)
- [Změny verze](data-mvp/CHANGELOG.md)

Původní aplikace je zachovaný starší prototyp. Tato změna nerozvíjí její kód ani netvrdí, že již používá nový datový model. Následující původní pokyny slouží pouze ke spuštění tohoto prototypu.

---

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/de4719e5-b8d2-4db6-9751-89fb93dbe6a6

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
