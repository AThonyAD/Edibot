# ADR 0002: Jednoduché termíny, čistá celostrana a snadný příjem dat

Datum: 2026-11-04. Stav: přijato; upřesnění generic deadlines výslovně potvrzeno uživatelem během přípravy.

## Rozhodnutí a důvody

- Jeden `publication_date` přebírá termín vydavatele, včetně „V prodeji od“. Oddělené `on_sale_date` nemá pro tento produkt dostatečný užitek.
- Dva inzertní termíny jsou `booking_deadline` a `materials_deadline`. U Echo/Hrot se samotná „Uzávěrka“ převádí na příjem inzerce jako zaznamenaná kontextová interpretace. Obecné relativní pravidlo se nepřevádí na konkrétní datum bez vyřešení výjimek.
- Nabídnuté ediční téma je inzerovatelná příležitost. Individuální formát a podmínky řeší inzerent s vydavatelem. Nevytváříme další povinnou dostupnostní bránu.
- Pro CZ sadu jsou ceny orientační, bez DPH za standardní 1/1; nepoužíváme proměnný `vat_status` ani katalog formátů. Jiný trh vyžaduje novou vědomou úpravu konvence.
- Příjem začíná e-mailem/PDF, preferovanou dobrovolnou tabulkou. JSON exporty lze později realizovat jako placenou implementaci a údržbu; povinný XML feed by zvyšoval překážku zapojení.

## Kompromisy

Jednotné produktové pole data zachovává původní označení ve zdroji. Přibližná cena neumožňuje nákladové srovnání efektivity a nemá je umožňovat. Přijetí PDF znamená potřebu kurátorské kontroly. Jednoduchý vstup pro vydavatele se nemusí strukturou shodovat s vnitřním normalizovaným modelem.
