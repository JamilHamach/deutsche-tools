/* ═══════════════════════════════════════════════════════════════════════════
   Kündigungsfrist Rechner (BGB § 622)
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate'); // Optional Kündigungsdatum
    const calculateBtn = document.getElementById('calculateBtn');

    const noticePeriodResult = document.getElementById('noticePeriodResult');
    const tenureInfo = document.getElementById('tenureInfo');

    // Details
    const terminationDetails = document.getElementById('terminationDetails');
    const termDateDisplay = document.getElementById('termDateDisplay');
    const lastWorkDay = document.getElementById('lastWorkDay');

    // Date Selectors
    const monate = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];

    function initDateSelects(prefix, defaultDate = null) {
        const daySelect = document.getElementById(`${prefix}_tag`);
        const monthSelect = document.getElementById(`${prefix}_monat`);
        const yearSelect = document.getElementById(`${prefix}_jahr`);
        const hiddenInput = document.getElementById(prefix === 'start' ? 'startDate' : 'endDate');

        // Populate Days
        // Start with 31, update later based on month/year
        for (let i = 1; i <= 31; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            daySelect.appendChild(opt);
        }

        // Populate Months
        monate.forEach((m, index) => {
            const opt = document.createElement('option');
            opt.value = index + 1;
            opt.textContent = m;
            monthSelect.appendChild(opt);
        });

        // Populate Years (Current + 2 to 1950)
        const currentYear = new Date().getFullYear();
        for (let i = currentYear + 2; i >= 1950; i--) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            yearSelect.appendChild(opt);
        }

        // Add "Empty" option for End Date if optional
        if (prefix === 'end') {
            const optY = document.createElement('option');
            optY.value = "";
            optY.textContent = "-";
            // Insert at top? usually users just leave it. 
            // We'll handle "empty" by checking if value is set. 
            // Actually, let's set it to "Empty" by default or Current Date?
            // User instruction: "Leer lassen für Heute".
            // So we need an "empty" state.

            // Let's add an empty placeholder option at the top
            [daySelect, monthSelect, yearSelect].forEach(sel => {
                const opt = document.createElement('option');
                opt.value = "";
                opt.textContent = "-";
                sel.insertBefore(opt, sel.firstChild);
                sel.value = "";
            });
        }

        // Set Default if provided
        if (defaultDate) {
            daySelect.value = defaultDate.getDate();
            monthSelect.value = defaultDate.getMonth() + 1;
            yearSelect.value = defaultDate.getFullYear();
            updateHiddenInput(prefix);
        }

        // Listeners
        [daySelect, monthSelect, yearSelect].forEach(el => {
            el.addEventListener('change', () => {
                validateDays(prefix);
                updateHiddenInput(prefix);
            });
        });
    }

    function validateDays(prefix) {
        const daySelect = document.getElementById(`${prefix}_tag`);
        const monthSelect = document.getElementById(`${prefix}_monat`);
        const yearSelect = document.getElementById(`${prefix}_jahr`);

        const year = parseInt(yearSelect.value);
        const month = parseInt(monthSelect.value);

        if (!year || !month) return;

        const daysInMonth = new Date(year, month, 0).getDate();
        const currentDay = parseInt(daySelect.value);

        // Adjust options if needed? 
        // Simpler: Just ensure selected day isn't out of bounds.
        // We could rebuild options, but that resets selection if we aren't careful.

        // Let's iterate options and hide/show or remove?
        // Rebuilding is safer to ensure correct count.

        // Save current selection
        let selected = currentDay;

        // Clear value? No, keep it if valid.

        if (currentDay > daysInMonth) {
            daySelect.value = daysInMonth;
        }
    }

    function updateHiddenInput(prefix) {
        const day = document.getElementById(`${prefix}_tag`).value;
        const month = document.getElementById(`${prefix}_monat`).value;
        const year = document.getElementById(`${prefix}_jahr`).value;
        const hiddenInput = document.getElementById(prefix === 'start' ? 'startDate' : 'endDate');

        if (day && month && year) {
            const d = day.toString().padStart(2, '0');
            const m = month.toString().padStart(2, '0');
            hiddenInput.value = `${year}-${m}-${d}`;
        } else {
            hiddenInput.value = "";
        }
    }

    // Initialize
    initDateSelects('start', new Date()); // Default to Today
    initDateSelects('end'); // Default Empty

    function calculateNoticePeriod() {
        // ... (Logic remains mostly the same, reading from hidden inputs)

        const startVal = startDateInput.value;
        const endVal = endDateInput.value;

        if (!startVal) {
            alert("Bitte geben Sie ein gültiges Startdatum an.");
            return;
        }

        const start = new Date(startVal);
        let terminationDate = endVal ? new Date(endVal) : new Date();

        if (isNaN(start.getTime())) {
            alert("Bitte geben Sie ein gültiges Startdatum an.");
            return;
        }

        // ... Existing Logic ...

        // Calculate Tenure (Betriebszugehörigkeit)
        let years = terminationDate.getFullYear() - start.getFullYear();
        let months = terminationDate.getMonth() - start.getMonth();
        let days = terminationDate.getDate() - start.getDate();

        if (days < 0) {
            months--;
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        // Output Tenure
        tenureInfo.textContent = `Betriebszugehörigkeit: ${years} Jahre, ${months} Monate`;

        // Determine statutory notice period (BGB § 622)
        // Default: Employer dismissal or aligned contract
        let fristText = "";
        let durationMonths = 0; // for calculation
        let durationWeeks = 0;  // for calculation
        let isEndOfMonth = true; // most are to end of month
        let isTo15th = false;     // some are to 15th or end

        if (years === 0 && months <= 6) {
            // Probation (Probezeit) - up to 6 months
            fristText = "2 Wochen (während Probezeit)";
            durationWeeks = 2;
            isEndOfMonth = false; // any day
        } else if (years < 2) {
            // Standard (Grundkündigungsfrist)
            fristText = "4 Wochen zum 15. oder zum Monatsende";
            durationWeeks = 4;
            isEndOfMonth = true;
            isTo15th = true;
        } else {
            // Extended (§ 622 Abs. 2) - All to End of Month
            isEndOfMonth = true;
            isTo15th = false;

            if (years >= 20) {
                fristText = "7 Monate zum Monatsende";
                durationMonths = 7;
            } else if (years >= 15) {
                fristText = "6 Monate zum Monatsende";
                durationMonths = 6;
            } else if (years >= 12) {
                fristText = "5 Monate zum Monatsende";
                durationMonths = 5;
            } else if (years >= 10) {
                fristText = "4 Monate zum Monatsende";
                durationMonths = 4;
            } else if (years >= 8) {
                fristText = "3 Monate zum Monatsende";
                durationMonths = 3;
            } else if (years >= 5) {
                fristText = "2 Monate zum Monatsende";
                durationMonths = 2;
            } else {
                // >= 2 years
                fristText = "1 Monat zum Monatsende";
                durationMonths = 1;
            }
        }

        noticePeriodResult.textContent = fristText;

        // Calculate specific End Date
        let targetDate = new Date(terminationDate);

        // Add duration
        if (durationMonths > 0) {
            targetDate.setMonth(targetDate.getMonth() + durationMonths);
        } else if (durationWeeks > 0) {
            targetDate.setDate(targetDate.getDate() + (durationWeeks * 7));
        }

        // Apply "zum..." rule
        if (years === 0 && months <= 6) {
            // Probation: Exact date
        } else {
            if (isTo15th) {
                // 15th or End of Month logic
                const currentDay = targetDate.getDate();
                const lastDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();

                if (currentDay <= 15) {
                    targetDate.setDate(15);
                } else {
                    targetDate.setDate(lastDayOfMonth);
                }
            } else if (isEndOfMonth) {
                // End of target month
                targetDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
            }
        }

        // Display Details
        terminationDetails.style.display = 'block';

        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        termDateDisplay.textContent = terminationDate.toLocaleDateString('de-DE', options);
        lastWorkDay.textContent = targetDate.toLocaleDateString('de-DE', options);
    }

    calculateBtn.addEventListener('click', calculateNoticePeriod);
});
