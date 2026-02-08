/**
 * Überstunden Rechner Logic
 * Updated for 2026 Regulations
 */

document.addEventListener('DOMContentLoaded', () => {
    const monthlyGrossInput = document.getElementById('monthlyGross');
    const weeklyHoursInput = document.getElementById('weeklyHours');
    const overtimeHoursInput = document.getElementById('overtimeHours');
    const surchargeSelect = document.getElementById('surcharge');
    const calculateBtn = document.getElementById('calculateBtn');

    // UI Elements for output
    const hourlyRateEl = document.getElementById('hourlyRate');
    const baseOvertimePayEl = document.getElementById('baseOvertimePay');
    const surchargePayEl = document.getElementById('surchargePay');
    const totalGrossPayEl = document.getElementById('totalGrossPay');
    const taxFreeAmountEl = document.getElementById('taxFreeAmount');
    const timeOffBasicEl = document.getElementById('timeOffBasic');
    const timeOffTotalEl = document.getElementById('timeOffTotal');
    const summaryTextEl = document.getElementById('summaryText');
    const totalNetPayEl = document.getElementById('totalNetPay');
    const taxRateInput = document.getElementById('taxRate');

    const calculate = () => {
        const monthlyGross = parseFloat(monthlyGrossInput.value) || 0;
        const weeklyHours = parseFloat(weeklyHoursInput.value) || 0;
        const overtimeHours = parseFloat(overtimeHoursInput.value) || 0;
        const surchargePercent = parseFloat(surchargeSelect.value) || 0;
        const taxRate = (parseFloat(taxRateInput.value) || 35) / 100;

        if (weeklyHours <= 0) return;

        // 1. Calculate Hourly Rate (German standard: monthly / 4.333 / weekly)
        const avgWeeksPerMonth = 4.333;
        const hourlyRate = monthlyGross / (weeklyHours * avgWeeksPerMonth);

        // 2. Base Overtime Pay
        const baseOvertimeValue = overtimeHours * hourlyRate;

        // 3. Surcharge Pay
        const surchargeValue = baseOvertimeValue * (surchargePercent / 100);

        // 4. Total Gross
        const totalGross = baseOvertimeValue + surchargeValue;

        // 5. 2026 Tax-Free Logic
        // Planned: Surcharges up to 25% are tax-free if working >= 40h/week
        let taxFreeAmount = 0;
        if (weeklyHours >= 40 && surchargePercent > 0) {
            const maxTaxFreeSurchargePercent = Math.min(surchargePercent, 25);
            taxFreeAmount = baseOvertimeValue * (maxTaxFreeSurchargePercent / 100);
        }

        // 6. Net Calculation (Estimated)
        // Net = TaxFreeAmount + (Remainder * (1 - TaxRate))
        const taxableAmount = totalGross - taxFreeAmount;
        const netAmount = taxFreeAmount + (taxableAmount * (1 - taxRate));

        // 7. Time Off
        const timeOffBasic = overtimeHours;
        const timeOffTotal = overtimeHours * (1 + (surchargePercent / 100));

        // Update UI
        hourlyRateEl.textContent = formatCurrency(hourlyRate);
        baseOvertimePayEl.textContent = formatCurrency(baseOvertimeValue);
        surchargePayEl.textContent = formatCurrency(surchargeValue);
        totalGrossPayEl.textContent = formatCurrency(totalGross);
        taxFreeAmountEl.textContent = formatCurrency(taxFreeAmount);
        totalNetPayEl.textContent = formatCurrency(netAmount);

        timeOffBasicEl.textContent = `${timeOffBasic.toFixed(1)}h`;
        timeOffTotalEl.textContent = `${timeOffTotal.toFixed(1)}h`;

        // Dynamic Summary
        if (overtimeHours > 0) {
            summaryTextEl.textContent = `Voraussichtliches Netto-Plus für ${overtimeHours}h mit ${surchargePercent}% Zuschlag`;
        } else {
            summaryTextEl.textContent = 'Bereit für die Berechnung';
        }

        // Visual feedback
        totalNetPayEl.classList.remove('pulse');
        void totalNetPayEl.offsetWidth;
        totalNetPayEl.classList.add('pulse');
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
    };

    calculateBtn.addEventListener('click', calculate);

    // Initial calculation
    calculate();
});
