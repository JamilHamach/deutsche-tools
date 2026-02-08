/* ═══════════════════════════════════════════════════════════════════════════
   Brutto-Netto Rechner 2026 - Deutschland
   Basiert auf BMF Programmablaufplan 2026
   Mit neuer Vorsorgepauschale ab 01.01.2026
   ═══════════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────────────
// Konstanten 2026
// ─────────────────────────────────────────────────────────────────────────────

const KONSTANTEN_2026 = {
    // Beitragsbemessungsgrenzen monatlich
    BBG_RV_AV: 8450,        // RV und AV
    BBG_KV_PV: 5812.50,     // KV und PV

    // Sozialversicherungssätze (Arbeitnehmeranteil)
    RV_SATZ: 0.093,         // 9.3%
    AV_SATZ: 0.013,         // 1.3%
    KV_SATZ: 0.073,         // 7.3%
    PV_SATZ_BASIS: 0.018,   // 1.8%
    PV_KINDERLOS: 0.006,    // +0.6% für Kinderlose

    // Einkommensteuer 2026
    GRUNDFREIBETRAG: 12348,
    ZONE2_ENDE: 17799,
    ZONE3_ENDE: 69878,
    ZONE4_ENDE: 277825,

    // Soli
    SOLI_FREIGRENZE: 19488,
    SOLI_SATZ: 0.055,

    // Pauschalen
    WERBUNGSKOSTEN: 1230,
    SONDERAUSGABEN: 36,
};

const KIRCHENSTEUER = {
    'baden-wuerttemberg': 0.08,
    'bayern': 0.08,
    'berlin': 0.09,
    'brandenburg': 0.09,
    'bremen': 0.09,
    'hamburg': 0.09,
    'hessen': 0.09,
    'mecklenburg-vorpommern': 0.09,
    'niedersachsen': 0.09,
    'nordrhein-westfalen': 0.09,
    'rheinland-pfalz': 0.09,
    'saarland': 0.09,
    'sachsen': 0.09,
    'sachsen-anhalt': 0.09,
    'schleswig-holstein': 0.09,
    'thueringen': 0.09
};

// ─────────────────────────────────────────────────────────────────────────────
// Sozialversicherungsbeiträge berechnen
// ─────────────────────────────────────────────────────────────────────────────

function berechneSozialversicherung(bruttoMonat, kinder, bundesland, kvZusatzbeitrag) {
    const K = KONSTANTEN_2026;

    // Bemessungsgrundlagen
    const basisRV = Math.min(bruttoMonat, K.BBG_RV_AV);
    const basisKV = Math.min(bruttoMonat, K.BBG_KV_PV);

    // Rentenversicherung: 9.3%
    const rv = basisRV * K.RV_SATZ;

    // Arbeitslosenversicherung: 1.3%
    const av = basisRV * K.AV_SATZ;

    // Krankenversicherung: 7.3% + halber Zusatzbeitrag
    const kvZusatz = (kvZusatzbeitrag / 100) / 2;
    const kv = basisKV * (K.KV_SATZ + kvZusatz);

    // Pflegeversicherung: variabel
    let pvSatz = K.PV_SATZ_BASIS;
    if (kinder === 0) {
        pvSatz += K.PV_KINDERLOS;
    } else if (kinder >= 2) {
        const abschlag = Math.min(kinder - 1, 4) * 0.0025;
        pvSatz -= abschlag;
    }
    if (bundesland === 'sachsen') {
        pvSatz += 0.005;
    }
    const pv = basisKV * Math.max(pvSatz, 0.008);

    return { rv, av, kv, pv, gesamt: rv + av + kv + pv };
}

// ─────────────────────────────────────────────────────────────────────────────
// Vorsorgepauschale 2026 - Neue Berechnung ab 01.01.2026
// ─────────────────────────────────────────────────────────────────────────────

function berechneVorsorgepauschale(bruttoJahr, kinder, bundesland, kvZusatzbeitrag) {
    const K = KONSTANTEN_2026;

    // Jährliche Bemessungsgrundlagen
    const basisRV_Jahr = Math.min(bruttoJahr, K.BBG_RV_AV * 12);
    const basisKV_Jahr = Math.min(bruttoJahr, K.BBG_KV_PV * 12);

    // Teilbetrag 1: Rentenversicherung (Arbeitnehmeranteil)
    const tb1_RV = basisRV_Jahr * K.RV_SATZ;

    // Teilbetrag 2: Kranken- und Pflegeversicherung
    const kvZusatz = (kvZusatzbeitrag / 100) / 2;
    const tb2_KV = basisKV_Jahr * (K.KV_SATZ + kvZusatz);

    let pvSatz = K.PV_SATZ_BASIS;
    if (kinder === 0) pvSatz += K.PV_KINDERLOS;
    else if (kinder >= 2) pvSatz -= Math.min(kinder - 1, 4) * 0.0025;
    if (bundesland === 'sachsen') pvSatz += 0.005;
    const tb2_PV = basisKV_Jahr * Math.max(pvSatz, 0.008);

    // Teilbetrag 3: Private Versicherung (hier 0, da gesetzlich)
    const tb3_Privat = 0;

    // Teilbetrag 4: Arbeitslosenversicherung (NEU ab 2026!)
    const tb4_AV = basisRV_Jahr * K.AV_SATZ;

    // Summe der auf volle Euro aufgerundeten Teilbeträge
    const vorsorgepauschale = Math.ceil(tb1_RV) + Math.ceil(tb2_KV) + Math.ceil(tb2_PV) + Math.ceil(tb3_Privat) + Math.ceil(tb4_AV);

    return vorsorgepauschale;
}

// ─────────────────────────────────────────────────────────────────────────────
// Einkommensteuer nach § 32a EStG 2026
// ─────────────────────────────────────────────────────────────────────────────

function berechneEinkommensteuer(zvE) {
    const K = KONSTANTEN_2026;
    zvE = Math.floor(zvE);

    if (zvE <= K.GRUNDFREIBETRAG) return 0;

    let steuer;

    if (zvE <= K.ZONE2_ENDE) {
        const y = (zvE - K.GRUNDFREIBETRAG) / 10000;
        steuer = (914.51 * y + 1400) * y;
    } else if (zvE <= K.ZONE3_ENDE) {
        const z = (zvE - K.ZONE2_ENDE) / 10000;
        steuer = (173.10 * z + 2397) * z + 1034.87;
    } else if (zvE <= K.ZONE4_ENDE) {
        steuer = 0.42 * zvE - 11135.63;
    } else {
        steuer = 0.45 * zvE - 19470.38;
    }

    return Math.floor(steuer);
}

// ─────────────────────────────────────────────────────────────────────────────
// Lohnsteuer monatlich berechnen
// ─────────────────────────────────────────────────────────────────────────────

function berechneLohnsteuer(bruttoMonat, steuerklasse, kinder, bundesland, kvZusatzbeitrag) {
    const K = KONSTANTEN_2026;
    const bruttoJahr = bruttoMonat * 12;

    // Werbungskostenpauschale und Sonderausgabenpauschale
    const pauschalen = K.WERBUNGSKOSTEN + K.SONDERAUSGABEN;

    // Vorsorgepauschale 2026 (neue Berechnung)
    const vorsorgepauschale = berechneVorsorgepauschale(bruttoJahr, kinder, bundesland, kvZusatzbeitrag);

    // Zu versteuerndes Einkommen
    let zvE = bruttoJahr - pauschalen - vorsorgepauschale;
    if (zvE < 0) zvE = 0;

    let lohnsteuerJahr;

    switch (steuerklasse) {
        case 1:
        case 4:
            lohnsteuerJahr = berechneEinkommensteuer(zvE);
            break;
        case 2:
            // Alleinerziehend: Entlastungsbetrag
            const entlastung = 4260 + Math.max(0, kinder - 1) * 240;
            zvE = Math.max(0, zvE - entlastung);
            lohnsteuerJahr = berechneEinkommensteuer(zvE);
            break;
        case 3:
            // Splitting
            lohnsteuerJahr = 2 * berechneEinkommensteuer(zvE / 2);
            break;
        case 5:
            // Höhere Belastung
            lohnsteuerJahr = berechneEinkommensteuer(zvE) * 1.25;
            break;
        case 6:
            // Kein Grundfreibetrag
            const y = zvE / 10000;
            lohnsteuerJahr = Math.max((914.51 * y + 1400) * y, zvE * 0.14);
            break;
        default:
            lohnsteuerJahr = berechneEinkommensteuer(zvE);
    }

    return Math.max(0, Math.floor(lohnsteuerJahr)) / 12;
}

// ─────────────────────────────────────────────────────────────────────────────
// Solidaritätszuschlag
// ─────────────────────────────────────────────────────────────────────────────

function berechneSoli(lohnsteuerJahr) {
    const K = KONSTANTEN_2026;

    if (lohnsteuerJahr <= K.SOLI_FREIGRENZE) return 0;

    const vollerSoli = lohnsteuerJahr * K.SOLI_SATZ;
    const gemilderterSoli = (lohnsteuerJahr - K.SOLI_FREIGRENZE) * 0.119;

    return Math.min(vollerSoli, gemilderterSoli);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hauptberechnung
// ─────────────────────────────────────────────────────────────────────────────

function berechneNetto(eingaben) {
    const { bruttoMonat, steuerklasse, bundesland, kirchensteuer, kinder, kvZusatzbeitrag, arbeitsstunden } = eingaben;

    // Sozialversicherung
    const sv = berechneSozialversicherung(bruttoMonat, kinder, bundesland, kvZusatzbeitrag);

    // Lohnsteuer
    const lohnsteuer = berechneLohnsteuer(bruttoMonat, steuerklasse, kinder, bundesland, kvZusatzbeitrag);

    // Soli
    const lohnsteuerJahr = lohnsteuer * 12;
    const soliJahr = berechneSoli(lohnsteuerJahr);
    const soli = soliJahr / 12;

    // Kirchensteuer
    let kirchensteuerBetrag = 0;
    if (kirchensteuer) {
        const satz = KIRCHENSTEUER[bundesland] || 0.09;
        kirchensteuerBetrag = lohnsteuer * satz;
    }

    // Summen
    const steuernGesamt = lohnsteuer + soli + kirchensteuerBetrag;
    const abzuegeGesamt = steuernGesamt + sv.gesamt;
    const nettoMonat = bruttoMonat - abzuegeGesamt;

    // Stundenlohn
    const stundenlohn = nettoMonat / (arbeitsstunden * 4.33);

    return {
        lohnsteuer,
        soli,
        kirchensteuerBetrag,
        steuernGesamt,
        rentenversicherung: sv.rv,
        arbeitslosenversicherung: sv.av,
        krankenversicherung: sv.kv,
        pflegeversicherung: sv.pv,
        sozialabgabenGesamt: sv.gesamt,
        abzuegeGesamt,
        nettoMonat,
        nettoJahr: nettoMonat * 12,
        bruttoMonat,
        bruttoJahr: bruttoMonat * 12,
        stundenlohnNetto: stundenlohn,
        abzugsquote: (abzuegeGesamt / bruttoMonat) * 100
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// UI
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const berechnenBtn = document.getElementById('calculateBtn');
    const bundeslandSelect = document.getElementById('bundesland');
    const kirchensteuerInfo = document.getElementById('kirchensteuerInfo');

    bundeslandSelect.addEventListener('change', () => {
        const satz = KIRCHENSTEUER[bundeslandSelect.value] || 0.09;
        kirchensteuerInfo.textContent = `Kirchensteuersatz: ${Math.round(satz * 100)}%`;
    });

    const formatEuro = (b) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(b);
    const formatEuroGanz = (b) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(b);
    const formatProzent = (z) => z.toFixed(1).replace('.', ',') + ' %';

    function berechnung() {
        const brutto = parseFloat(document.getElementById('bruttogehalt').value) || 0;
        const istMonatlich = document.querySelector('input[name="period"]:checked').value === 'monthly';

        if (brutto <= 0) return;

        const bruttoMonat = istMonatlich ? brutto : brutto / 12;

        const e = berechneNetto({
            bruttoMonat,
            steuerklasse: parseInt(document.getElementById('steuerklasse').value),
            bundesland: document.getElementById('bundesland').value,
            kirchensteuer: document.getElementById('kirchensteuer').checked,
            kinder: parseInt(document.getElementById('kinder').value),
            kvZusatzbeitrag: parseFloat(document.getElementById('kvZusatzbeitrag').value) || 2.9,
            arbeitsstunden: parseFloat(document.getElementById('arbeitsstunden').value) || 40
        });

        const m = istMonatlich ? 1 : 12;

        document.getElementById('nettogehalt').textContent = formatEuro(e.nettoMonat * m);
        document.getElementById('nettogehaltPeriod').textContent = istMonatlich ? 'pro Monat' : 'pro Jahr';

        document.getElementById('lohnsteuer').textContent = '-' + formatEuro(e.lohnsteuer * m);
        document.getElementById('soli').textContent = '-' + formatEuro(e.soli * m);
        document.getElementById('kirchensteuerBetrag').textContent = '-' + formatEuro(e.kirchensteuerBetrag * m);
        document.getElementById('kirchensteuerRow').style.display = document.getElementById('kirchensteuer').checked ? 'flex' : 'none';

        document.getElementById('rentenversicherung').textContent = '-' + formatEuro(e.rentenversicherung * m);
        document.getElementById('krankenversicherung').textContent = '-' + formatEuro(e.krankenversicherung * m);
        document.getElementById('pflegeversicherung').textContent = '-' + formatEuro(e.pflegeversicherung * m);
        document.getElementById('arbeitslosenversicherung').textContent = '-' + formatEuro(e.arbeitslosenversicherung * m);

        document.getElementById('bruttoJahr').textContent = formatEuroGanz(e.bruttoJahr);
        document.getElementById('nettoJahr').textContent = formatEuroGanz(e.nettoJahr);
        document.getElementById('abzuegeGesamt').textContent = formatEuroGanz(e.abzuegeGesamt * 12);
        document.getElementById('abzugsquote').textContent = formatProzent(e.abzugsquote);

        document.getElementById('stundenlohn').textContent = formatEuro(e.stundenlohnNetto);
    }

    berechnenBtn.addEventListener('click', berechnung);
    document.querySelectorAll('.input-panel input, .input-panel select').forEach(el => {
        el.addEventListener('change', berechnung);
        el.addEventListener('keypress', e => e.key === 'Enter' && berechnung());
    });

    berechnung();
});
