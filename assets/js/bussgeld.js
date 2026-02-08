/* ═══════════════════════════════════════════════════════════════════════════
   Bußgeldrechner Logic - 2026
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
    // Inputs
    const locationSelect = document.getElementById('location');
    const vehicleTypeSelect = document.getElementById('vehicleType');
    const probezeitCheckbox = document.getElementById('probezeit');
    const allowedSpeedInput = document.getElementById('allowedSpeed');
    const drivenSpeedInput = document.getElementById('drivenSpeed');
    const calculateBtn = document.getElementById('calculateBtn');

    // Outputs
    const netSpeedDisplay = document.getElementById('netSpeed');
    const toleranceDisplay = document.getElementById('toleranceValue');
    const overSpeedDisplay = document.getElementById('overSpeed');
    const fineAmountDisplay = document.getElementById('fineAmount');
    const pointsDisplay = document.getElementById('pointsAmount');
    const banDisplay = document.getElementById('banDuration');
    const resultSummary = document.getElementById('resultSummary');

    function calculate() {
        const location = locationSelect.value; // 'innerorts' | 'ausserorts'
        const vehicle = vehicleTypeSelect.value;
        const isProbezeit = probezeitCheckbox.checked;
        let allowed = parseInt(allowedSpeedInput.value);
        let driven = parseInt(drivenSpeedInput.value);

        // Limit maximum speed to 350 km/h and update UI
        if (allowed > 350) {
            allowed = 350;
            allowedSpeedInput.value = 350;
        }
        if (driven > 350) {
            driven = 350;
            drivenSpeedInput.value = 350;
        }

        if (isNaN(allowed) || isNaN(driven)) {
            resetResults("Geben Sie Ihre Daten ein für eine Schätzung.");
            return;
        }

        if (driven <= allowed) {
            resetResults("Keine Geschwindigkeitsüberschreitung festgestellt.");
            return;
        }

        // 1. Tolerance Calculation
        let tolerance = 0;
        if (driven < 100) {
            tolerance = 3;
        } else {
            tolerance = Math.ceil(driven * 0.03);
        }

        const netSpeed = driven - tolerance;
        const overSpeed = Math.max(0, netSpeed - allowed);

        if (overSpeed <= 0) {
            resetResults("Nach Abzug der Toleranz liegt keine Überschreitung vor.");
            return;
        }

        // 2. Fine Lookup
        let fine = 0;
        let points = 0;
        let ban = "Kein Fahrverbot";

        const isHeavy = vehicle === 'lkw' || vehicle === 'gespann';
        let table;

        if (isHeavy) {
            table = (location === 'innerorts') ? getLKWInnerortsTable() : getLKWAusserortsTable();
        } else {
            table = (location === 'innerorts') ? getInnerortsTable() : getAusserortsTable();
        }

        // Find tier
        const tier = table.find(t => overSpeed >= t.min && overSpeed <= t.max);

        if (tier) {
            fine = tier.fine;
            points = tier.points;
            ban = tier.ban || "Kein Fahrverbot";
        }

        // 3. Probezeit Consequences
        let probezeitInfo = "";
        if (isProbezeit && overSpeed >= 21) {
            probezeitInfo = `<div class="probezeit-warning" style="margin-top: 15px; padding: 10px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid var(--color-error); border-radius: 4px;">
                <strong style="color: var(--color-error);">⚠️ Probezeit-Maßnahme (A-Verstoß):</strong><br>
                <ul style="margin: 5px 0 0 18px; font-size: 0.85rem; color: var(--color-text-secondary);">
                    <li>Probezeit-Verlängerung um 2 Jahre</li>
                    <li>Anordnung eines Aufbauseminars (Kosten ca. 300-500€)</li>
                </ul>
            </div>`;
        }

        // Fees (Gebühren & Auslagen)
        // >= 60€ fine usually attracts 28.50€ fees
        const totalFine = (fine >= 60) ? fine + 28.50 : fine;

        // UI Update
        netSpeedDisplay.textContent = netSpeed + " km/h";
        toleranceDisplay.textContent = "-" + tolerance + " km/h";
        overSpeedDisplay.textContent = overSpeed + " km/h";

        fineAmountDisplay.textContent = formatCurrency(totalFine);
        pointsDisplay.textContent = points;
        banDisplay.textContent = ban;

        let summaryText = "";
        if (fine >= 60) {
            summaryText = `Sie waren nach Abzug der Toleranz <strong>${overSpeed} km/h</strong> zu schnell. 
            <br>Das Bußgeld beträgt ${formatCurrency(fine)} zzgl. 28,50 € Gebühren.`;
        } else {
            summaryText = `Sie waren nach Abzug der Toleranz <strong>${overSpeed} km/h</strong> zu schnell.`;
        }

        resultSummary.innerHTML = summaryText + probezeitInfo;
    }

    function getInnerortsTable() {
        return [
            { min: 1, max: 10, fine: 30, points: 0 },
            { min: 11, max: 15, fine: 50, points: 0 },
            { min: 16, max: 20, fine: 70, points: 0 },
            { min: 21, max: 25, fine: 115, points: 1 },
            { min: 26, max: 30, fine: 180, points: 1, ban: "1 Monat*" }, // *if repeated
            { min: 31, max: 40, fine: 260, points: 2, ban: "1 Monat" },
            { min: 41, max: 50, fine: 400, points: 2, ban: "1 Monat" },
            { min: 51, max: 60, fine: 560, points: 2, ban: "2 Monate" },
            { min: 61, max: 70, fine: 700, points: 2, ban: "3 Monate" },
            { min: 71, max: 999, fine: 800, points: 2, ban: "3 Monate" }
        ];
    }

    function getAusserortsTable() {
        return [
            { min: 1, max: 10, fine: 20, points: 0 },
            { min: 11, max: 15, fine: 40, points: 0 },
            { min: 16, max: 20, fine: 60, points: 0 },
            { min: 21, max: 25, fine: 100, points: 1 },
            { min: 26, max: 30, fine: 150, points: 1 },
            { min: 31, max: 40, fine: 200, points: 1 },
            { min: 41, max: 50, fine: 320, points: 2, ban: "1 Monat" },
            { min: 51, max: 60, fine: 480, points: 2, ban: "1 Monat" },
            { min: 61, max: 70, fine: 600, points: 2, ban: "2 Monate" },
            { min: 71, max: 999, fine: 700, points: 2, ban: "3 Monate" }
        ];
    }

    function getLKWInnerortsTable() {
        return [
            { min: 1, max: 10, fine: 40, points: 0 },
            { min: 11, max: 15, fine: 60, points: 0 },
            { min: 16, max: 20, fine: 160, points: 1 },
            { min: 21, max: 25, fine: 175, points: 1 },
            { min: 26, max: 30, fine: 235, points: 2, ban: "1 Monat" },
            { min: 31, max: 40, fine: 340, points: 2, ban: "1 Monat" },
            { min: 41, max: 50, fine: 560, points: 2, ban: "2 Monate" },
            { min: 51, max: 60, fine: 700, points: 2, ban: "3 Monate" },
            { min: 61, max: 999, fine: 800, points: 2, ban: "3 Monate" }
        ];
    }

    function getLKWAusserortsTable() {
        return [
            { min: 1, max: 10, fine: 30, points: 0 },
            { min: 11, max: 15, fine: 50, points: 0 },
            { min: 16, max: 20, fine: 140, points: 1 },
            { min: 21, max: 25, fine: 150, points: 1 },
            { min: 26, max: 30, fine: 175, points: 1 },
            { min: 31, max: 40, fine: 255, points: 2, ban: "1 Monat" },
            { min: 41, max: 50, fine: 480, points: 2, ban: "1 Monat" },
            { min: 51, max: 60, fine: 600, points: 2, ban: "2 Monate" },
            { min: 61, max: 999, fine: 700, points: 2, ban: "3 Monate" }
        ];
    }

    function resetResults(msg) {
        netSpeedDisplay.textContent = "-";
        toleranceDisplay.textContent = "-";
        overSpeedDisplay.textContent = "-";
        fineAmountDisplay.textContent = "0,00 €";
        pointsDisplay.textContent = "0";
        banDisplay.textContent = "Kein Fahrverbot";
        resultSummary.innerHTML = msg;
    }

    // Event Listeners
    calculateBtn.addEventListener('click', calculate);

    // Auto-calculate on changes
    [locationSelect, vehicleTypeSelect, probezeitCheckbox, allowedSpeedInput, drivenSpeedInput].forEach(el => {
        el.addEventListener('input', calculate);
        if (el.type === 'checkbox') el.addEventListener('change', calculate);
    });

    calculate();
});
