document.addEventListener('DOMContentLoaded', function () {
    // Inputs
    const parentStatus = document.getElementById('parentStatus');
    const receivesKindergeld = document.getElementById('receivesKindergeld');
    const kindergeldWarning = document.getElementById('kindergeldWarning');

    // Income Inputs
    const grossIncome1 = document.getElementById('grossIncome1');
    const grossIncome2 = document.getElementById('grossIncome2');
    const netIncome1 = document.getElementById('netIncome1');
    const netIncome2 = document.getElementById('netIncome2');
    const grossIncome2Group = document.getElementById('grossIncome2Group');
    const netIncome2Group = document.getElementById('netIncome2Group');

    const warmRent = document.getElementById('warmRent');
    const wohngeldAmount = document.getElementById('wohngeldAmount');
    const kfzInsurance = document.getElementById('kfzInsurance');
    const childCountSelect = document.getElementById('childCount');
    const childIncome = document.getElementById('childIncome');
    const calculateBtn = document.getElementById('calculateBtn');

    // Outputs
    const kizAmountDisplay = document.getElementById('kizAmount');
    const maxKizDisplay = document.getElementById('maxKiz');
    const kindergeldDisplay = document.getElementById('kindergeldAmount');
    const totalBenefitDisplay = document.getElementById('totalBenefit');
    const resultInfoText = document.getElementById('resultInfoText');
    const kizSubtext = document.getElementById('kizSubtext');

    // Constants 2026
    const MAX_KIZ_PER_CHILD = 297;
    const KINDERGELD_PER_CHILD = 259;
    const MIN_GROSS_SINGLE = 600;
    const MIN_GROSS_COUPLE = 900;

    function togglePartnerInputs() {
        const isCouple = parentStatus.value === 'couple';
        grossIncome2Group.style.display = isCouple ? 'flex' : 'none';
        netIncome2Group.style.display = isCouple ? 'flex' : 'none';

        // Reset partner 2 values if single
        if (!isCouple) {
            grossIncome2.value = 0;
            netIncome2.value = 0;
        }
        calculate();
    }

    function calculate() {
        const status = parentStatus.value;
        const hasKindergeld = receivesKindergeld.checked;

        // Handle Kindergeld Prerequisite
        kindergeldWarning.style.display = hasKindergeld ? 'none' : 'block';
        if (!hasKindergeld) {
            kizAmountDisplay.textContent = '0,00 €';
            kizSubtext.textContent = 'Kein Anspruch';
            resultInfoText.innerHTML = `<span style="color: var(--color-error)">Ohne Kindergeld besteht kein Anspruch auf Kinderzuschlag.</span>`;
            updateStaticOutputs(parseInt(childCountSelect.value), 0, 0);
            return;
        }

        // Sum Incomes
        const gross = (parseFloat(grossIncome1.value) || 0) + (parseFloat(grossIncome2.value) || 0);
        const net = (parseFloat(netIncome1.value) || 0) + (parseFloat(netIncome2.value) || 0);

        const rent = parseFloat(warmRent.value) || 0;
        const wohngeld = parseFloat(wohngeldAmount.value) || 0;
        const kfz = parseFloat(kfzInsurance.value) || 0;
        const count = parseInt(childCountSelect.value) || 1;
        const cIncome = parseFloat(childIncome.value) || 0;

        // 1. Check Minimum Income
        const minGross = (status === 'single') ? MIN_GROSS_SINGLE : MIN_GROSS_COUPLE;

        if (gross < minGross) {
            kizAmountDisplay.textContent = '0,00 €';
            kizSubtext.textContent = 'Mindesteinkommen nicht erreicht';
            resultInfoText.innerHTML = `<span style="color: var(--color-error)">Ihr gemeinsames Bruttoeinkommen liegt unter der Mindestgrenze von ${minGross} €. Sie haben wahrscheinlich Anspruch auf Bürgergeld.</span>`;
            updateStaticOutputs(count, 0, wohngeld);
            return;
        }

        // 2. Maximum Kinderzuschlag
        const totalMaxKiz = count * MAX_KIZ_PER_CHILD;

        // 3. Deductions from Child Income (45% of child's income is deducted)
        const childDeduction = cIncome * 0.45;

        // 4. Parents' Income Deduction
        const workExpenses = 100;
        const insuranceFlat = 30;
        const adjustedNet = net - workExpenses - insuranceFlat - kfz;

        // Parents' Need (Bedarf)
        const parentStandardRate = (status === 'single') ? 563 : 1012;
        const rentShareParents = rent * 0.7; // Approx 70% of rent for parents
        const parentNeed = parentStandardRate + rentShareParents;

        let parentDeduction = 0;
        if (adjustedNet > parentNeed) {
            parentDeduction = (adjustedNet - parentNeed) * 0.45;
        }

        // 5. Final Calculation
        let finalKiz = totalMaxKiz - childDeduction - parentDeduction;
        finalKiz = Math.max(0, Math.min(finalKiz, totalMaxKiz));

        // UI Updates
        kizAmountDisplay.textContent = formatCurrency(finalKiz);
        kizSubtext.textContent = finalKiz > 0 ? 'Voraussichtlicher Anspruch' : 'Kein Anspruch (Einkommen zu hoch)';

        updateStaticOutputs(count, finalKiz, wohngeld);

        if (finalKiz > 0) {
            let combined = finalKiz + wohngeld;
            resultInfoText.innerHTML = `Ihr voraussichtlicher Kinderzuschlag beträgt <strong>${formatCurrency(finalKiz)}</strong> monatlich. 
            <br>Zusammen mit Ihrem Wohngeld (${formatCurrency(wohngeld)}) erhalten Sie insgesamt <strong>${formatCurrency(combined)}</strong> an zusätzlicher Unterstützung (zzgl. Kindergeld).`;
        } else {
            resultInfoText.innerHTML = `Kein Anspruch auf Kinderzuschlag. Ihr bereinigtes Einkommen (€${formatNumber(adjustedNet)}) deckt Ihren Bedarf (€${formatNumber(parentNeed)}) bereits ab.`;
        }
    }

    function updateStaticOutputs(count, kiz, wohngeld) {
        const totalMax = count * MAX_KIZ_PER_CHILD;
        const totalKindergeld = count * KINDERGELD_PER_CHILD;

        maxKizDisplay.textContent = formatCurrency(totalMax);
        kindergeldDisplay.textContent = formatCurrency(totalKindergeld);

        const totalOverall = totalKindergeld + kiz + wohngeld;
        totalBenefitDisplay.textContent = formatCurrency(totalOverall);
    }

    // Event Listeners
    calculateBtn.addEventListener('click', calculate);
    parentStatus.addEventListener('change', togglePartnerInputs);
    receivesKindergeld.addEventListener('change', calculate);

    // Initial State
    togglePartnerInputs();
});
