/* ═══════════════════════════════════════════════════════════════════════════
   Elterngeld Rechner 2026
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
    const calculateBtn = document.getElementById('calculateBtn');

    // Inputs
    const incomeLimitExceeded = document.getElementById('incomeLimitExceeded');
    const incomeError = document.getElementById('incomeError');

    const hasPartner = document.getElementById('hasPartner');
    const netIncomeInput = document.getElementById('netIncome');
    const partnerIncomeGroup = document.getElementById('partnerIncomeGroup');
    const partnerNetIncomeInput = document.getElementById('partnerNetIncome');

    const isMultiple = document.getElementById('isMultiple');
    const multipleCountGroup = document.getElementById('multipleCountGroup');
    const childCount = document.getElementById('childCount');
    const hasSibling = document.getElementById('hasSibling');

    // Results
    const basisElterngeld = document.getElementById('basisElterngeld');
    const plusElterngeld = document.getElementById('plusElterngeld');

    const partnerResult = document.getElementById('partnerResult');
    const partnerBasisElterngeld = document.getElementById('partnerBasisElterngeld');
    const partnerPlusElterngeld = document.getElementById('partnerPlusElterngeld');

    // Breakdown (Only showing Parent 1 details for simplicity in breakdown for now, or just the rates)
    // We'll keep the breakdown generic or hide it if complex. 
    // Let's keep it simple: Just show calculation for Parent 1 in breakdown list.
    const calcNetto = document.getElementById('calcNetto');
    const calcRate = document.getElementById('calcRate');
    const calcMultiple = document.getElementById('calcMultiple');
    const calcSibling = document.getElementById('calcSibling');

    // Toggle Inputs
    incomeLimitExceeded.addEventListener('change', () => {
        if (incomeLimitExceeded.checked) {
            incomeError.style.display = 'block';
            document.getElementById('incomeGroup').style.opacity = '0.5';
            document.getElementById('incomeGroup').style.pointerEvents = 'none';
        } else {
            incomeError.style.display = 'none';
            document.getElementById('incomeGroup').style.opacity = '1';
            document.getElementById('incomeGroup').style.pointerEvents = 'auto';
        }
    });

    hasPartner.addEventListener('change', () => {
        if (hasPartner.checked) {
            partnerIncomeGroup.style.display = 'block';
            partnerResult.style.display = 'block';
        } else {
            partnerIncomeGroup.style.display = 'none';
            partnerResult.style.display = 'none';
        }
    });

    isMultiple.addEventListener('change', () => {
        multipleCountGroup.style.display = isMultiple.checked ? 'block' : 'none';
    });

    // Formatting
    const formatEuro = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
    const formatPercent = (val) => new Intl.NumberFormat('de-DE', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(val);

    function calculateParentAmount(netIncome) {
        // 1. Cap Net Income at 2770€
        const maxIncome = 2770;
        let consideredIncome = Math.min(netIncome, maxIncome);

        // 2. Determine Replacement Rate
        let rate = 0.65;

        if (netIncome < 1000) {
            const shortfall = 1000 - netIncome;
            const increase = (shortfall / 2) * 0.001;
            rate = 0.67 + increase;
            if (rate > 1) rate = 1;
        } else if (netIncome < 1200) {
            rate = 0.67;
        } else if (netIncome < 1240) {
            const over = netIncome - 1200;
            const decrease = (over / 2) * 0.001;
            rate = 0.67 - decrease;
        } else {
            rate = 0.65;
        }

        // 3. Calculate Base Amount
        let baseAmount = consideredIncome * rate;

        // 4. Validate Min/Max
        if (baseAmount < 300) baseAmount = 300;
        if (baseAmount > 1800) baseAmount = 1800;

        // 5. Bonuses (Apply to both parents equally if applicable?)
        // Yes, bonuses are per child/family situation.
        let bonusMultiple = 0;
        let bonusSibling = 0;

        if (isMultiple.checked) {
            const count = parseInt(childCount.value) || 1;
            const additionalChildren = Math.max(0, count - 1);
            bonusMultiple = additionalChildren * 300;
        }

        if (hasSibling.checked) {
            let calcBonus = baseAmount * 0.10;
            if (calcBonus < 75) calcBonus = 75;
            bonusSibling = calcBonus;
        }

        const totalBasic = baseAmount + bonusMultiple + bonusSibling;
        const totalPlus = totalBasic / 2;

        return {
            basic: totalBasic,
            plus: totalPlus,
            consideredIncome,
            rate,
            bonusMultiple,
            bonusSibling
        };
    }

    function calculateElterngeld() {
        if (incomeLimitExceeded.checked) {
            basisElterngeld.textContent = "0,00 €";
            plusElterngeld.textContent = "0,00 €";
            if (hasPartner.checked) {
                partnerBasisElterngeld.textContent = "0,00 €";
                partnerPlusElterngeld.textContent = "0,00 €";
            }
            return;
        }

        // Parent 1
        let net1 = parseFloat(netIncomeInput.value) || 0;
        const res1 = calculateParentAmount(net1);

        basisElterngeld.textContent = formatEuro(res1.basic);
        plusElterngeld.textContent = formatEuro(res1.plus) + " (Plus)";

        // Breakdown (Parent 1)
        calcNetto.textContent = formatEuro(res1.consideredIncome);
        calcRate.textContent = formatPercent(res1.rate);
        calcMultiple.textContent = formatEuro(res1.bonusMultiple);
        calcSibling.textContent = formatEuro(res1.bonusSibling);

        // Parent 2
        if (hasPartner.checked) {
            let net2 = parseFloat(partnerNetIncomeInput.value) || 0;
            const res2 = calculateParentAmount(net2);

            partnerBasisElterngeld.textContent = formatEuro(res2.basic);
            partnerPlusElterngeld.textContent = formatEuro(res2.plus) + " (Plus)";
        }
    }

    // Listeners
    calculateBtn.addEventListener('click', calculateElterngeld);
});
