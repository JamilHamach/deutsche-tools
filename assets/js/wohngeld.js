/* ═══════════════════════════════════════════════════════════════════════════
   Wohngeld Rechner 2026
   Basis: Wohngeldgesetz (WoGG) 2025/2026 (Zweite Fortschreibung)
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
    const calculateBtn = document.getElementById('calculateBtn');

    // Inputs
    const householdSizeSelect = document.getElementById('householdSize');
    const grossIncomeInput = document.getElementById('grossIncome');
    const werbungskostenInput = document.getElementById('werbungskosten');
    const coldRentInput = document.getElementById('coldRent');
    const rentLevelSelect = document.getElementById('rentLevel');

    const deductTax = document.getElementById('deductTax');
    const deductHealth = document.getElementById('deductHealth');
    const deductPension = document.getElementById('deductPension');

    // City Search
    const citySearch = document.getElementById('citySearch');
    const citySuggestions = document.getElementById('citySuggestions');
    const mietstufeFeedback = document.getElementById('mietstufeFeedback');
    const detectedLevelSpan = document.getElementById('detectedLevel');
    const manualMietstufe = document.getElementById('manualMietstufe');
    const toggleManual = document.getElementById('toggleManual');

    let currentMietstufe = null;

    // Results
    const wohngeldResult = document.getElementById('wohngeldResult');
    const calcIncome = document.getElementById('calcIncome');
    const calcRent = document.getElementById('calcRent');
    const displayActualRent = document.getElementById('displayActualRent');
    const displayMaxRent = document.getElementById('displayMaxRent');

    // ─────────────────────────────────────────────────────────────────────────────
    // Data: Höchstbeträge für die Miete (Cold) WoGG Anlage 1 (2025/2026)
    // Structure: [Size 1..8] -> [Mietstufe 1..7]
    // ─────────────────────────────────────────────────────────────────────────────
    const rentLimitsCold = [
        null,
        [361, 408, 456, 511, 562, 615, 677], // 1 Person
        [437, 493, 551, 619, 680, 745, 820], // 2 Personen
        [521, 587, 657, 737, 809, 887, 975], // 3 Personen
        [607, 684, 764, 856, 940, 1029, 1131], // 4 Personen
        [693, 781, 874, 976, 1074, 1173, 1293], // 5 Personen
        [779, 878, 984, 1096, 1208, 1317, 1455], // 6 Personen
        [865, 975, 1094, 1216, 1342, 1461, 1617], // 7 Personen
        [951, 1072, 1204, 1336, 1476, 1605, 1779]  // 8 Personen
    ];

    // Heating Components (Entlastung bei den Heizkosten) WoGG § 12 Abs. 7 (2025)
    // Based on sqm (48, 62, 72, 85, 97...) and fixed rates.
    const heatingComponents = [null, 110.40, 118.60, 139.80, 160.20, 180.60, 201.00, 221.40, 241.80];

    // Climate Components WoGG § 12 Abs. 6 (2025)
    const climateComponents = [null, 19.20, 24.80, 29.60, 34.00, 38.80, 43.60, 48.40, 53.20];

    // Coefficients (a, b, c) from WoGG Anlage 2 (2025 Update)
    const coefficients = [
        null,
        { a: 0.04, b: 0.0004797, c: 0.0000408 }, // 1
        { a: 0.03, b: 0.0003571, c: 0.0000304 }, // 2
        { a: 0.02, b: 0.0002917, c: 0.0000245 }, // 3
        { a: 0.01, b: 0.0002163, c: 0.0000176 }, // 4
        { a: 0.00, b: 0.0001907, c: 0.0000172 }, // 5
        { a: -0.01, b: 0.0001722, c: 0.0000166 }, // 6
        { a: -0.02, b: 0.0001592, c: 0.0000165 }, // 7
        { a: -0.03, b: 0.0001583, c: 0.0000165 }  // 8
    ];

    const formatEuro = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

    // ═══════════════════════════════════════════════════════════════════════════
    // City Search
    // ═══════════════════════════════════════════════════════════════════════════

    citySearch.addEventListener('input', function () {
        const query = this.value.trim();
        currentMietstufe = null;
        mietstufeFeedback.style.display = 'none';

        if (query.length < 2) {
            citySuggestions.style.display = 'none';
            return;
        }

        const matches = findMietstufe(query);
        if (matches.length > 0) {
            citySuggestions.innerHTML = '';
            matches.slice(0, 10).forEach(match => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.style.padding = '0.75rem 1rem';
                div.style.cursor = 'pointer';
                div.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                div.textContent = `${match.city} (${match.state})`;
                div.addEventListener('click', () => {
                    citySearch.value = match.city;
                    citySuggestions.style.display = 'none';
                    currentMietstufe = match.level;
                    detectedLevelSpan.textContent = match.level;
                    mietstufeFeedback.style.display = 'block';
                    manualMietstufe.style.display = 'none';
                    calculateWohngeld();
                });
                citySuggestions.appendChild(div);
            });
            citySuggestions.style.display = 'block';
        } else {
            citySuggestions.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!citySearch.contains(e.target) && !citySuggestions.contains(e.target)) {
            citySuggestions.style.display = 'none';
        }
    });

    toggleManual.addEventListener('click', (e) => {
        e.preventDefault();
        manualMietstufe.style.display = manualMietstufe.style.display === 'none' ? 'block' : 'none';
        if (manualMietstufe.style.display === 'block') {
            currentMietstufe = null;
            mietstufeFeedback.style.display = 'none';
        }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // Calculation
    // ═══════════════════════════════════════════════════════════════════════════

    function calculateWohngeld() {
        const size = Math.min(parseInt(householdSizeSelect.value), 8);
        const grossYearly = parseFloat(grossIncomeInput.value) || 0;
        const wkYearly = parseFloat(werbungskostenInput.value) || 0;
        const coldRent = parseFloat(coldRentInput.value) || 0;

        let level = currentMietstufe;
        if (level === null) {
            level = parseInt(rentLevelSelect.value);
        }
        const levelIndex = level - 1;

        // 1. Y (Monthly Net)
        const adjustedGrossYearly = Math.max(0, grossYearly - wkYearly);
        const monthlyBasis = adjustedGrossYearly / 12; // Do not round yet

        let deductionRate = 0;
        if (deductTax.checked) deductionRate += 0.10;
        if (deductHealth.checked) deductionRate += 0.10;
        if (deductPension.checked) deductionRate += 0.10;

        const Y = Math.floor(monthlyBasis * (1 - deductionRate));

        // 2. M (Rent)
        const coldLimit = rentLimitsCold[size][levelIndex];
        const recognizedCold = Math.min(coldRent, coldLimit);

        const heatComp = heatingComponents[size];
        const climComp = climateComponents[size];

        const M = Math.ceil(recognizedCold + heatComp + climComp);

        // 3. Formula
        const { a, b, c } = coefficients[size];
        const z = a + (b * M) + (c * Y);

        // Gesetzliche Formel: 1,15 * (M - (a + bM + cY) * Y)
        const unroundedWohngeld = 1.15 * (M - (z * Y));

        let result = Math.floor(Math.max(0, unroundedWohngeld));
        if (result < 10) result = 0;

        // 4. Update UI
        wohngeldResult.textContent = formatEuro(result);
        calcIncome.textContent = formatEuro(Y);
        calcRent.textContent = formatEuro(M);
        displayActualRent.textContent = formatEuro(coldRent);
        displayMaxRent.textContent = formatEuro(coldLimit + heatComp + climComp);
    }

    calculateBtn.addEventListener('click', calculateWohngeld);
});
