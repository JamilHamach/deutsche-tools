/**
 * Abfindungsrechner - Netto
 * Logic for Fünftelregelung (Severance Pay Tax Rules)
 * Updated for 2026 Tax Brackets
 */

document.addEventListener('DOMContentLoaded', () => {
    // Input Elements
    const severanceGrossInput = document.getElementById('severanceGross');
    const annualGrossInput = document.getElementById('annualGross');
    const taxClassSelect = document.getElementById('taxClass');
    const churchTaxSelect = document.getElementById('churchTax');
    const calculateBtn = document.getElementById('calculateBtn');

    // Estimator Elements
    const yearsOfServiceInput = document.getElementById('yearsOfService');
    const monthlySalaryInput = document.getElementById('monthlySalary');
    const severanceFactorSelect = document.getElementById('severanceFactor');

    // Auto-calculate Severance Gross
    const updateSeveranceGross = () => {
        const years = parseFloat(yearsOfServiceInput.value) || 0;
        const salary = parseFloat(monthlySalaryInput.value) || 0;
        const factor = parseFloat(severanceFactorSelect.value) || 0.5;

        if (years > 0 && salary > 0) {
            severanceGrossInput.value = Math.round(years * salary * factor);
            calculate(); // Re-calculate net immediately
        }
    };

    [yearsOfServiceInput, monthlySalaryInput, severanceFactorSelect].forEach(el => {
        el.addEventListener('input', updateSeveranceGross);
    });

    // Output Elements
    const netSeveranceEl = document.getElementById('netSeverance');
    const summaryTextEl = document.getElementById('summaryText');
    const taxSavingEl = document.getElementById('taxSaving');
    const effectiveTaxEl = document.getElementById('effectiveTax');
    const netWithoutRegEl = document.getElementById('netWithoutReg');
    const totalAnnualNetEl = document.getElementById('totalAnnualNet');

    // 2026 Simplified Tax Constants (Estimates based on current trends)
    const GRUNDFREIBETRAG = 12336; // Estimated for 2026
    const SOLIDARITAET_THRESHOLD = 68413; // For single, very rough estimate

    /**
     * Simplified 2026 Income Tax Calculation
     * This is an estimate for local tool purposes.
     */
    const calculateIncomeTax = (taxableIncome, taxClass) => {
        if (taxableIncome <= GRUNDFREIBETRAG) return 0;

        // Simplified linear-progressive model for 2026
        // Rates: 14% to 42% (or 45% for very high)
        let tax = 0;
        const income = taxableIncome - GRUNDFREIBETRAG;

        if (taxableIncome < 17000) {
            tax = income * 0.14;
        } else if (taxableIncome < 66000) {
            tax = 653 + (income - (17000 - GRUNDFREIBETRAG)) * 0.24; // Very rough progressive mid-band
        } else if (taxableIncome < 277000) {
            tax = 12413 + (income - (66000 - GRUNDFREIBETRAG)) * 0.42;
        } else {
            tax = 101033 + (income - (277000 - GRUNDFREIBETRAG)) * 0.45;
        }

        // Adjust for Tax Class (Very simplified)
        // Class 3/5 logic would need more detail, but for estimate:
        if (taxClass === '3') tax *= 0.7; // Benefit for high earner
        if (taxClass === '5') tax *= 1.3; // Burden for lower earner

        return Math.max(0, tax);
    };

    const calculate = () => {
        const severanceGross = parseFloat(severanceGrossInput.value) || 0;
        const annualGross = parseFloat(annualGrossInput.value) || 0;
        const taxClass = taxClassSelect.value;
        const churchTaxRate = (parseFloat(churchTaxSelect.value) || 0) / 100;

        // Fünftelregelung Step-by-Step:

        // 1. Tax on regular income
        const taxOnRegular = calculateIncomeTax(annualGross, taxClass);

        // 2. Tax on regular income + 1/5 of severance
        const incomeWithOneFifth = annualGross + (severanceGross / 5);
        const taxOnOneFifth = calculateIncomeTax(incomeWithOneFifth, taxClass);

        // 3. Difference (tax spike for 1/5)
        const taxDifference = taxOnOneFifth - taxOnRegular;

        // 4. Total tax on severance = 5 * difference
        let totalTaxOnSeverance = taxDifference * 5;

        // 5. Comparison: Tax without Regelung (Raw spike)
        const taxOnTotal = calculateIncomeTax(annualGross + severanceGross, taxClass);
        const rawTaxOnSeverance = taxOnTotal - taxOnRegular;

        // 6. Church Tax & Soli (Simplified)
        const totalTaxWithSurcharge = totalTaxOnSeverance * (1 + churchTaxRate);
        const rawTaxWithSurcharge = rawTaxOnSeverance * (1 + churchTaxRate);

        // 7. Final Net Amounts
        const netSeverance = severanceGross - totalTaxWithSurcharge;
        const netWithoutReg = severanceGross - rawTaxWithSurcharge;
        const taxSaving = netSeverance - netWithoutReg;

        // 8. Annual Projections
        const netRegular = annualGross - (taxOnRegular * (1 + churchTaxRate));
        const totalAnnualNet = netRegular + netSeverance;

        // Update UI
        netSeveranceEl.textContent = formatCurrency(netSeverance);
        netWithoutRegEl.textContent = formatCurrency(netWithoutReg);
        taxSavingEl.textContent = formatCurrency(Math.max(0, taxSaving));

        const effectiveTaxRate = (totalTaxWithSurcharge / severanceGross) * 100;
        effectiveTaxEl.textContent = `${effectiveTaxRate.toFixed(1)} %`;

        totalAnnualNetEl.textContent = formatCurrency(totalAnnualNet);

        // Summary Text
        if (taxSaving > 10) {
            summaryTextEl.textContent = `Ihr Bonus durch die Fünftelregelung: ${formatCurrency(taxSaving)}`;
        } else {
            summaryTextEl.textContent = 'Steuerlich optimierte Auszahlung';
        }

        // Animation
        netSeveranceEl.classList.remove('pulse');
        void netSeveranceEl.offsetWidth;
        netSeveranceEl.classList.add('pulse');
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
    };

    calculateBtn.addEventListener('click', calculate);

    // Initial calculation
    calculate();
});
