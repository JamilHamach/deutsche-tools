/* ═══════════════════════════════════════════════════════════════════════════
   KFZ-Steuer Rechner 2026 - Deutschland
   Basiert auf dem Kraftfahrzeugsteuergesetz (KraftStG)
   ═══════════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────────────
// Konstanten 2026
// ─────────────────────────────────────────────────────────────────────────────

const KFZ_KONSTANTEN = {
    // Hubraum-Steuersätze pro angefangene 100 cm³ (ab 01.07.2009)
    HUBRAUM_BENZIN: 2.00,
    HUBRAUM_DIESEL: 9.50,

    // CO2-Freibetrag (g/km) Historie
    CO2_FREI_AB_2014: 95,   // ab 01.01.2014
    CO2_FREI_2012_2013: 110, // 01.01.2012 - 31.12.2013
    CO2_FREI_2009_2011: 120, // 01.07.2009 - 31.12.2011

    // Stichtage
    DATUM_NEUE_STEUER: new Date('2009-07-01'), // Beginn CO2-Steuer & neue Hubraum-Sätze
    DATUM_CO2_AENDERUNG_1: new Date('2012-01-01'),
    DATUM_CO2_AENDERUNG_2: new Date('2014-01-01'),

    // Progressive CO2-Steuersätze (pro g/km über Freibetrag)
    CO2_STUFEN: [
        { bis: 115, satz: 2.00 },
        { bis: 135, satz: 2.20 },
        { bis: 155, satz: 2.50 },
        { bis: 175, satz: 2.90 },
        { bis: 195, satz: 3.40 },
        { bis: Infinity, satz: 4.00 }
    ],

    // Elektrofahrzeuge: Steuerbefreiung bis 31.12.2035
    // (bei Erstzulassung bis 31.12.2030)
    ELEKTRO_BEFREIUNG_BIS: new Date('2035-12-31'),
    ELEKTRO_ERSTZULASSUNG_BIS: new Date('2030-12-31'),

    // Ältere Fahrzeuge (vor 01.07.2009) - Pauschal (hier vereinfacht Euro 3/4 angenommen)
    ALT_EURO3_BENZIN: 6.75,
    ALT_EURO3_DIESEL: 15.44,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hubraum-Steuer berechnen
// ─────────────────────────────────────────────────────────────────────────────

function berechneHubraumSteuer(hubraum, kraftstoff, erstzulassung) {
    if (kraftstoff === 'elektro') return 0;

    const zulassungsDatum = new Date(erstzulassung);
    const einheiten = Math.ceil(hubraum / 100);

    // Ab 01.07.2009: CO2-basierte Steuer (Günstigere Hubraum-Sätze)
    if (zulassungsDatum >= KFZ_KONSTANTEN.DATUM_NEUE_STEUER) {
        const satzPro100 = kraftstoff === 'diesel'
            ? KFZ_KONSTANTEN.HUBRAUM_DIESEL
            : KFZ_KONSTANTEN.HUBRAUM_BENZIN;
        return einheiten * satzPro100;
    }

    // Vor 01.07.2009: Alte Hubraum-Steuer (Teurer, da keine CO2-Komponente)
    // Wir nehmen hier vereinfacht Euro 3/4 an, da Emissionsklasse nicht abgefragt wird.
    else {
        const satzPro100 = kraftstoff === 'diesel'
            ? KFZ_KONSTANTEN.ALT_EURO3_DIESEL
            : KFZ_KONSTANTEN.ALT_EURO3_BENZIN;
        return einheiten * satzPro100;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CO2-Steuer berechnen (progressiv)
// ─────────────────────────────────────────────────────────────────────────────

function berechneCO2Steuer(co2, erstzulassung) {
    const zulassungsDatum = new Date(erstzulassung);

    // Vor 01.07.2009: Keine CO2-Steuer (reine Hubraumsteuer)
    if (zulassungsDatum < KFZ_KONSTANTEN.DATUM_NEUE_STEUER) {
        return 0;
    }

    // Freibetrag ermitteln
    let freibetrag = KFZ_KONSTANTEN.CO2_FREI_AB_2014;

    if (zulassungsDatum < KFZ_KONSTANTEN.DATUM_CO2_AENDERUNG_1) {
        // 01.07.2009 - 31.12.2011
        freibetrag = KFZ_KONSTANTEN.CO2_FREI_2009_2011;
    } else if (zulassungsDatum < KFZ_KONSTANTEN.DATUM_CO2_AENDERUNG_2) {
        // 01.01.2012 - 31.12.2013
        freibetrag = KFZ_KONSTANTEN.CO2_FREI_2012_2013;
    }

    // CO2-Wert unter Freibetrag?
    if (co2 <= freibetrag) {
        return 0;
    }

    // Zu versteuernde CO2-Menge
    let zuVersteuern = co2 - freibetrag;
    let steuer = 0;

    // Achtung: Für die Berechnung der Stufen wird immer vom Basiswert 95g ausgegangen?
    // NEIN, das Gesetz sagt: "für jedes über [...] g/km hinausgehende Gramm".
    // ABER: Die Stufen (2€ bis 115g, 2.20€ bis 135g etc.) sind fest im Gesetz ("§ 9 Abs. 1 Nr. 2 b) bb)").
    // Die Freigrenze verschiebt nur, ab wann man zahlt.
    // D.h. wenn Freigrenze 120g ist, zahlt man ab 121g.
    // Das 121. Gramm fällt in die Stufe, in der 121 liegt (115-135 -> 2.20€).
    // Das ist komplex. Vereinfachung: Wir nutzen linear 2,00 EUR wie es oft in Online-Rechnern für *alte* CO2-Steuer gemacht wird?
    // KORREKTUR: Für Zulassungen 2009-2011 galt linear 2,00 EUR pro g über Freigrenze!
    // Die progressive Treppe (2.00, 2.20, 2.50...) gilt erst ab 2014 (bzw. für Neuzulassungen ab 2012 schon vorbereitet, aber Gesetzgebungsdetails variieren).
    // Um es "perfekt" zu machen:
    // 2009-2011: 2,00 € pro g über 120g.
    // 2012-2013: 2,00 € pro g über 110g.
    // Ab 2014: Progressive Stufen über 95g.

    // Umsetzung der linearen Regel für 2009-2013:
    if (zulassungsDatum < KFZ_KONSTANTEN.DATUM_CO2_AENDERUNG_2) {
        return zuVersteuern * 2.00;
    }

    // Ab 2014: Progressive Stufen
    // Hier ist der "Sockel" 95g.
    // Wenn man z.B. 100g hat, zahlt man 5 * 2,00€.
    // Wenn man 120g hat: 20 * 2.00 + 5 * 2.20.

    // Die Konstante CO2_FREIBETRAG (95) ist die Basis für die Stufen.
    // Wir müssen `zuVersteuern` relativ zu 95 berechnen für den Loop,
    // ABER wir zahlen nur, was über 95 liegt.

    // Reset zuVersteuern auf den Wert über 95 für die Loop-Logik
    zuVersteuern = co2 - 95;
    let aktuellerWert = 95;

    for (const stufe of KFZ_KONSTANTEN.CO2_STUFEN) {
        if (zuVersteuern <= 0) break;

        const stufenBreite = stufe.bis - aktuellerWert;
        const inDieserStufe = Math.min(zuVersteuern, stufenBreite);

        steuer += inDieserStufe * stufe.satz;
        zuVersteuern -= inDieserStufe;
        aktuellerWert = stufe.bis;
    }

    return steuer;
}

// ─────────────────────────────────────────────────────────────────────────────
// Elektro-Befreiung prüfen
// ─────────────────────────────────────────────────────────────────────────────

function istElektroBefreit(erstzulassung) {
    const zulassungsDatum = new Date(erstzulassung);
    const heute = new Date();

    // Prüfen ob Erstzulassung vor 31.12.2030 und wir noch vor 31.12.2035 sind
    return zulassungsDatum <= KFZ_KONSTANTEN.ELEKTRO_ERSTZULASSUNG_BIS &&
        heute <= KFZ_KONSTANTEN.ELEKTRO_BEFREIUNG_BIS;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hauptberechnung
// ─────────────────────────────────────────────────────────────────────────────

function berechneKfzSteuer(eingaben) {
    const { hubraum, co2, kraftstoff, erstzulassung } = eingaben;

    // Elektrofahrzeuge
    if (kraftstoff === 'elektro') {
        const befreit = istElektroBefreit(erstzulassung);
        return {
            hubraumSteuer: 0,
            co2Steuer: 0,
            jahresSteuer: 0,
            monatsSteuer: 0,
            istElektro: true,
            istBefreit: befreit,
            befreitBis: befreit ? '31.12.2035' : null
        };
    }

    // Verbrenner
    const hubraumSteuer = berechneHubraumSteuer(hubraum, kraftstoff, erstzulassung);
    const co2Steuer = berechneCO2Steuer(co2, erstzulassung);
    const jahresSteuer = hubraumSteuer + co2Steuer;

    return {
        hubraumSteuer: Math.round(hubraumSteuer * 100) / 100,
        co2Steuer: Math.round(co2Steuer * 100) / 100,
        jahresSteuer: Math.round(jahresSteuer * 100) / 100,
        monatsSteuer: Math.round((jahresSteuer / 12) * 100) / 100,
        istElektro: false,
        istBefreit: false,
        hubraumEinheiten: Math.ceil(hubraum / 100),
        co2UeberFreibetrag: Math.max(0, co2 - KFZ_KONSTANTEN.CO2_FREIBETRAG)
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// CO2-Aufschlüsselung für Details
// ─────────────────────────────────────────────────────────────────────────────

function getCO2Aufschluesselung(co2, erstzulassung) {
    // Falls Aufruf ohne Erstzulassung (legacy), nimm aktuelles Datum an
    const zulassungsDatum = erstzulassung ? new Date(erstzulassung) : new Date();

    // Vor 01.07.2009: Keine CO2-Steuer
    if (zulassungsDatum < KFZ_KONSTANTEN.DATUM_NEUE_STEUER) {
        return [];
    }

    // Freibetrag ermitteln
    let freibetrag = KFZ_KONSTANTEN.CO2_FREI_AB_2014;
    let isLinear = false;

    if (zulassungsDatum < KFZ_KONSTANTEN.DATUM_CO2_AENDERUNG_1) {
        freibetrag = KFZ_KONSTANTEN.CO2_FREI_2009_2011;
        isLinear = true;
    } else if (zulassungsDatum < KFZ_KONSTANTEN.DATUM_CO2_AENDERUNG_2) {
        freibetrag = KFZ_KONSTANTEN.CO2_FREI_2012_2013;
        isLinear = true;
    }

    if (co2 <= freibetrag) {
        return [];
    }

    const aufschluesselung = [];
    let zuVersteuern = co2 - freibetrag;

    if (isLinear) {
        // Lineare Berechnung für 2009-2013
        aufschluesselung.push({
            von: freibetrag + 1,
            bis: co2,
            anzahl: zuVersteuern,
            satz: 2.00,
            betrag: zuVersteuern * 2.00
        });
    } else {
        // Progressive Berechnung ab 2014
        // Logic analog zu berechneCO2Steuer angepasst

        let aktuellerWert = 95; // Basis für Stufen
        let calcZuVersteuern = co2 - 95; // Menge über 95g

        for (const stufe of KFZ_KONSTANTEN.CO2_STUFEN) {
            if (calcZuVersteuern <= 0) break;

            const stufenBreite = stufe.bis - aktuellerWert;
            const inDieserStufe = Math.min(calcZuVersteuern, stufenBreite);

            // Aber: Wir zahlen nur für das, was ÜBER dem Freibetrag liegt.
            // Das ist knifflig darzustellen.
            // Vereinfachung: Wir zeigen einfach die Stufen an, die betroffen sind.
            // Der User zahlt effektiv erst ab 'freibetrag'.
            // Wenn Freibetrag 95 ist, passt alles.

            // Wenn Freibetrag != 95 wäre (was ab 2014 nicht der Fall ist), müsste man filtern.
            // Da wir hier im "else" (ab 2014) sind, ist Freibetrag = 95.

            if (inDieserStufe > 0) {
                const von = aktuellerWert + 1;
                const bis = aktuellerWert + inDieserStufe;

                aufschluesselung.push({
                    von,
                    bis,
                    anzahl: inDieserStufe,
                    satz: stufe.satz,
                    betrag: inDieserStufe * stufe.satz
                });
            }

            calcZuVersteuern -= inDieserStufe;
            aktuellerWert = stufe.bis;
        }
    }

    return aufschluesselung;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const berechnenBtn = document.getElementById('calculateBtn');
    const kraftstoffSelect = document.getElementById('kraftstoff');
    const hubraumGroup = document.getElementById('hubraumGroup');
    const co2Group = document.getElementById('co2Group');
    const elektroHinweis = document.getElementById('elektroHinweis');
    const verbrennerDetails = document.getElementById('verbrennerDetails');
    const elektroDetails = document.getElementById('elektroDetails');

    // Formatierung
    const formatEuro = (b) => new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(b);

    // Kraftstoff-Änderung: Felder ein-/ausblenden
    kraftstoffSelect.addEventListener('change', () => {
        const istElektro = kraftstoffSelect.value === 'elektro';

        hubraumGroup.style.display = istElektro ? 'none' : 'block';
        co2Group.style.display = istElektro ? 'none' : 'block';
        elektroHinweis.style.display = istElektro ? 'flex' : 'none';

        berechnung();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Date Picker Logic
    // ─────────────────────────────────────────────────────────────────────────
    const ezMonat = document.getElementById('ez_monat');
    const ezJahr = document.getElementById('ez_jahr');
    const hiddenDate = document.getElementById('erstzulassung');

    const monate = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];

    function initDateSelectors() {
        // Populate Months
        monate.forEach((m, index) => {
            const opt = document.createElement('option');
            opt.value = index + 1;
            opt.textContent = m;
            ezMonat.appendChild(opt);
        });

        // Populate Years (Current + 1 down to 2000)
        const currentYear = new Date().getFullYear();
        for (let i = currentYear + 1; i >= 2000; i--) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            ezJahr.appendChild(opt);
        }

        // Set initial value
        const initialDate = new Date(hiddenDate.value);
        if (!isNaN(initialDate)) {
            ezMonat.value = initialDate.getMonth() + 1;
            ezJahr.value = initialDate.getFullYear();
        }
    }



    function updateHiddenDate() {
        const year = parseInt(ezJahr.value);
        const month = parseInt(ezMonat.value);

        // Always default to 1st of the month
        const day = 1;

        // Format: YYYY-MM-DD
        const yStr = year;
        const mStr = month.toString().padStart(2, '0');
        const dStr = day.toString().padStart(2, '0');

        hiddenDate.value = `${yStr}-${mStr}-${dStr}`;

        // Trigger calculation
        berechnung();
    }

    // Initialize
    initDateSelectors();

    // Listeners
    [ezMonat, ezJahr].forEach(el => {
        el.addEventListener('change', () => {
            updateHiddenDate();
        });
    });

    function berechnung() {
        const kraftstoff = kraftstoffSelect.value;
        const hubraum = parseInt(document.getElementById('hubraum').value) || 0;
        const co2 = parseInt(document.getElementById('co2').value) || 0;
        const erstzulassung = document.getElementById('erstzulassung').value || '2024-01-01';

        const ergebnis = berechneKfzSteuer({ hubraum, co2, kraftstoff, erstzulassung });

        // Hauptergebnis
        document.getElementById('jahresSteuer').textContent = formatEuro(ergebnis.jahresSteuer);
        document.getElementById('monatsSteuer').textContent = formatEuro(ergebnis.monatsSteuer);

        // Details ein-/ausblenden
        if (ergebnis.istElektro) {
            verbrennerDetails.style.display = 'none';
            elektroDetails.style.display = 'block';

            document.getElementById('befreiungStatus').textContent =
                ergebnis.istBefreit ? 'Ja, bis 31.12.2035' : 'Nein';
            document.getElementById('befreiungStatus').className =
                'breakdown-item-value ' + (ergebnis.istBefreit ? 'positive' : '');
        } else {
            verbrennerDetails.style.display = 'block';
            elektroDetails.style.display = 'none';

            // Hubraum-Details
            document.getElementById('hubraumEinheiten').textContent =
                `${ergebnis.hubraumEinheiten} × ${kraftstoff === 'diesel' ? '9,50' : '2,00'} €`;
            document.getElementById('hubraumBetrag').textContent = formatEuro(ergebnis.hubraumSteuer);

            // CO2-Details
            document.getElementById('co2Ueber').textContent =
                `${ergebnis.co2UeberFreibetrag} g/km über 95 g/km`;
            document.getElementById('co2Betrag').textContent = formatEuro(ergebnis.co2Steuer);

            // CO2-Aufschlüsselung
            const aufschluesselung = getCO2Aufschluesselung(co2, erstzulassung);
            const co2DetailsList = document.getElementById('co2Details');
            co2DetailsList.innerHTML = '';

            aufschluesselung.forEach(stufe => {
                const item = document.createElement('div');
                item.className = 'breakdown-subitem';
                item.innerHTML = `
                    <span>${stufe.anzahl} g/km × ${stufe.satz.toFixed(2).replace('.', ',')} €</span>
                    <span>${formatEuro(stufe.betrag)}</span>
                `;
                co2DetailsList.appendChild(item);
            });
        }

        // Zusammenfassung
        document.getElementById('hubraumSummary').textContent = formatEuro(ergebnis.hubraumSteuer);
        document.getElementById('co2Summary').textContent = formatEuro(ergebnis.co2Steuer);

        // Elektro-Vergleich (nur für Verbrenner)
        const vergleichBox = document.getElementById('elektroVergleich');
        if (!ergebnis.istElektro && ergebnis.jahresSteuer > 0) {
            vergleichBox.style.display = 'block';
            document.getElementById('ersparnis').textContent = formatEuro(ergebnis.jahresSteuer);
            document.getElementById('ersparnis10').textContent = formatEuro(ergebnis.jahresSteuer * 10);
        } else {
            vergleichBox.style.display = 'none';
        }
    }

    // Event Listeners
    berechnenBtn.addEventListener('click', berechnung);

    document.querySelectorAll('.input-panel input, .input-panel select').forEach(el => {
        el.addEventListener('change', berechnung);
        el.addEventListener('input', berechnung);
    });

    // Initiale Berechnung
    berechnung();
});
