/**
 * Gesamt-Einkommensrechner - Logic
 * 2026 German Income Aggregator
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('einkommenForm');
    const totalMonthlyDisplay = document.getElementById('totalMonthly');
    const totalYearlyDisplay = document.getElementById('totalYearly');

    // Category result displays
    const resArbeit = document.getElementById('resArbeit');
    const resFamilie = document.getElementById('resFamilie');
    const resWohnen = document.getElementById('resWohnen');
    const resSonstiges = document.getElementById('resSonstiges');

    // Input groups
    const arbeitInputs = ['nettoGehalt', 'minijob'];
    const familieInputs = ['kindergeld', 'kinderzuschlag', 'elterngeld', 'unterhalt'];
    const wohnenInputs = ['wohngeld', 'buergergeld', 'pflegegeld'];
    const sonstigesInputs = ['bafoeg', 'rente', 'mieteinnahmen', 'sonstiges'];

    const allInputIds = [...arbeitInputs, ...familieInputs, ...wohnenInputs, ...sonstigesInputs];

    // Add event listeners to all inputs
    allInputIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateTotal);
        }
    });

    function calculateTotal() {
        let sumArbeit = 0;
        let sumFamilie = 0;
        let sumWohnen = 0;
        let sumSonstiges = 0;

        // Sum categories
        arbeitInputs.forEach(id => {
            sumArbeit += parseFloat(document.getElementById(id).value) || 0;
        });

        familieInputs.forEach(id => {
            sumFamilie += parseFloat(document.getElementById(id).value) || 0;
        });

        wohnenInputs.forEach(id => {
            sumWohnen += parseFloat(document.getElementById(id).value) || 0;
        });

        sonstigesInputs.forEach(id => {
            sumSonstiges += parseFloat(document.getElementById(id).value) || 0;
        });

        const totalMonthly = sumArbeit + sumFamilie + sumWohnen + sumSonstiges;
        const totalYearly = totalMonthly * 12;

        // Update displays
        totalMonthlyDisplay.textContent = formatCurrency(totalMonthly);
        totalYearlyDisplay.textContent = `Jährlich: ${formatCurrency(totalYearly)}`;

        resArbeit.textContent = formatCurrency(sumArbeit);
        resFamilie.textContent = formatCurrency(sumFamilie);
        resWohnen.textContent = formatCurrency(sumWohnen);
        resSonstiges.textContent = formatCurrency(sumSonstiges);

        // Add animation effect to main result
        totalMonthlyDisplay.classList.add('pulse');
        setTimeout(() => totalMonthlyDisplay.classList.remove('pulse'), 300);
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    }

    // Initialize
    calculateTotal();
});
