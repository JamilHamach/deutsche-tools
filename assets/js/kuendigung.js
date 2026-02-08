/* ═══════════════════════════════════════════════════════════════════════════
   Kündigungsschreiben Generator Logic - 2026
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
    // Form & Steps
    const form = document.getElementById('kuendigungForm');
    const steps = document.querySelectorAll('.form-step');
    const stepItems = document.querySelectorAll('.step-item');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    let currentStep = 1;

    // Inputs
    const contractType = document.getElementById('contractType');
    const kuendigungOption = document.getElementById('kuendigungOption');
    const userName = document.getElementById('userName');
    const userAddress = document.getElementById('userAddress');
    const userZip = document.getElementById('userZip');
    const userCity = document.getElementById('userCity');
    const compName = document.getElementById('compName');
    const compAddress = document.getElementById('compAddress');
    const compZip = document.getElementById('compZip');
    const compCity = document.getElementById('compCity');
    const refNumber = document.getElementById('refNumber');
    const creationDate = document.getElementById('creationDate');
    const endDate = document.getElementById('endDate');
    const fristlosReason = document.getElementById('fristlosReason');
    const fristlosReasonGroup = document.getElementById('fristlosReasonGroup');

    // Preview Elements
    const pvSender = document.getElementById('pvSender');
    const pvDate = document.getElementById('pvDate');
    const pvRecipient = document.getElementById('pvRecipient');
    const pvSubject = document.getElementById('pvSubject');
    const pvBody = document.getElementById('pvBody');
    const pvSignatureName = document.getElementById('pvSignatureName');

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    creationDate.value = today;

    // ─── Helpers ──────────────────────────────────────────────────────────

    function formatDate(dateStr) {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    // ─── Step Navigation ──────────────────────────────────────────────────

    function updateSteps() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === currentStep);
        });

        stepItems.forEach((item, index) => {
            item.classList.toggle('active', index + 1 === currentStep);
            item.classList.toggle('completed', index + 1 < currentStep);
        });

        prevBtn.style.display = currentStep === 1 ? 'none' : 'block';

        if (currentStep === 4) {
            nextBtn.style.display = 'none';
            downloadBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            downloadBtn.style.display = 'none';
        }

        updatePreview();
    }

    nextBtn.addEventListener('click', () => {
        if (currentStep < 4) {
            currentStep++;
            updateSteps();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateSteps();
        }
    });

    // ─── Dynamic Logic ────────────────────────────────────────────────────

    contractType.addEventListener('change', function () {
        const refLabel = document.querySelector('label[for="refNumber"]');
        if (this.value === 'arbeit') {
            refLabel.textContent = 'Personalnummer (optional)';
            refNumber.placeholder = 'z.B. PERS-12345';
        } else if (this.value === 'wohnung') {
            refLabel.textContent = 'Mieternummer / Whg-Nr. (optional)';
            refNumber.placeholder = 'z.B. WE-001';
        } else {
            refLabel.textContent = 'Kundennummer / Vertragsnummer (optional)';
            refNumber.placeholder = 'z.B. KD-99232';
        }
        updatePreview();
    });

    kuendigungOption.addEventListener('change', function () {
        fristlosReasonGroup.style.display = this.value === 'fristlos' ? 'block' : 'none';
        updatePreview();
    });

    // Update preview on any input change
    const allInputs = [contractType, kuendigungOption, userName, userAddress, userZip, userCity, compName, compAddress, compZip, compCity, refNumber, creationDate, endDate, fristlosReason];
    allInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    function updatePreview() {
        // Sender
        const sName = userName.value || "Max Mustermann";
        const sAddr = userAddress.value || "Musterstr. 1";
        const sZip = userZip.value || "12345";
        const sCity = userCity.value || "Berlin";
        pvSender.innerHTML = `<strong>${sName}</strong><br>${sAddr}<br>${sZip} ${sCity}`;
        pvSignatureName.textContent = sName;

        // Date
        const dateString = formatDate(creationDate.value) || formatDate(new Date().toISOString().split('T')[0]);
        pvDate.textContent = `${sCity}, den ${dateString}`;

        // Recipient
        const rName = compName.value || "Firmenname GmbH";
        const rAddr = compAddress.value || "Hauptstr. 100";
        const rZip = compZip.value || "10115";
        const rCity = compCity.value || "Berlin";
        pvRecipient.innerHTML = `${rName}<br>${rAddr}<br>${rZip} ${rCity}`;

        // Subject & Reference
        const type = contractType.value;
        let subject = "Kündigung meines Vertrags";
        let refPrefix = "Kundennummer";

        if (type === 'arbeit') {
            subject = "Kündigung meines Arbeitsverhältnisses";
            refPrefix = "Personalnummer";
        } else if (type === 'wohnung') {
            subject = "Kündigung meines Mietvertrags";
            refPrefix = "Mieternummer";
        } else if (type === 'versicherung') {
            subject = "Kündigung meiner Versicherung";
            refPrefix = "Versicherungsnummer";
        } else if (type === 'fitness') {
            subject = "Kündigung meiner Mitgliedschaft";
            refPrefix = "Vertragsnummer";
        } else if (type === 'internet') {
            subject = "Kündigung meines Internetanschlusses";
            refPrefix = "Vertragsnummer";
        }

        const ref = refNumber.value ? ` (${refPrefix}: ${refNumber.value})` : "";
        pvSubject.textContent = subject + ref;

        // Body Content
        const option = kuendigungOption.value;
        const eDate = endDate.value || "nächstmöglich";

        let salutation = "Sehr geehrte Damen und Herren,\n\n";
        let mainText = "";
        let extraRequests = "";

        if (option === 'ordentlich') {
            mainText = `hiermit kündige ich meinen oben genannten Vertrag ordentlich und fristgerecht zum ${eDate}.`;
        } else if (option === 'fristlos') {
            const reason = fristlosReason.value ? `\n\nBegründung: ${fristlosReason.value}` : "";
            mainText = `hiermit kündige ich meinen oben genannten Vertrag außerordentlich und fristlos aus wichtigem Grund.${reason}\n\nHilfsweise kündige ich zum nächstmöglichen Termin.`;
        } else {
            mainText = `hiermit teile ich Ihnen mit, dass ich meinen befristeten Vertrag nicht verlängere. Dieser endet somit planmäßig zum ${eDate}.`;
        }

        // Specific Phrases per Contract Type
        if (type === 'arbeit') {
            extraRequests = "\n\nZudem bitte ich um die Erstellung eines qualifizierten Arbeitszeugnisses sowie die Herausgabe meiner restlichen Arbeitspapiere.";
        } else if (type === 'wohnung') {
            extraRequests = "\n\nBezüglich der Wohnungsübergabe und der Kautionsrückzahlung werde ich mich zeitnah mit Ihnen in Verbindung setzen.";
        }

        const closing = "\n\nBitte bestätigen Sie mir den Erhalt dieser Kündigung sowie das Beendigungsdatum schriftlich.\n\nMit freundlichen Grüßen,";

        pvBody.textContent = salutation + mainText + extraRequests + closing;
    }

    // ─── PDF Generation ───────────────────────────────────────────────────

    downloadBtn.addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            unit: 'mm',
            format: 'a4'
        });

        const margin = 25;
        let y = 35;

        // Set modern sans-serif font (Helvetica is the best standard match for Roboto)
        doc.setFont("helvetica", "normal");

        // Sender line (Very small, above recipient)
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(`${userName.value || "Max Mustermann"}, ${userAddress.value || "Musterstr. 1"}, ${userZip.value || "12345"} ${userCity.value || "Berlin"}`, margin, y);
        y += 2;
        doc.setLineWidth(0.1);
        doc.setDrawColor(200);
        doc.line(margin, y, margin + 80, y);
        y += 10;

        // Recipient
        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.text(compName.value || "Firmenname GmbH", margin, y); y += 6;
        doc.text(compAddress.value || "Hauptstr. 100", margin, y); y += 6;
        doc.text(`${compZip.value || "10115"} ${compCity.value || "Berlin"}`, margin, y);

        // Place Date (Right aligned)
        const dateString = formatDate(creationDate.value) || formatDate(new Date().toISOString().split('T')[0]);
        doc.setFontSize(10);
        doc.text(`${userCity.value || "Berlin"}, den ${dateString}`, 185, 45, { align: 'right' });

        y += 40;

        // Subject
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(pvSubject.textContent, margin, y);
        y += 15;

        // Body
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setLineHeightFactor(1.5); // Better readability
        const splitText = doc.splitTextToSize(pvBody.textContent, 160);
        doc.text(splitText, margin, y);

        y += (splitText.length * 7) + 20;

        // Signature Area
        doc.text("Mit freundlichen Grüßen,", margin, y - 5);
        y += 12;
        doc.text("___________________________", margin, y); y += 8;
        doc.setFont("helvetica", "bold");
        doc.text(userName.value || "Max Mustermann", margin, y);

        // Quality Stamp / Footer
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(160);
        doc.text("Erstellt mit Deutsche Tools (deutsche-tools.de)", 105, 285, { align: 'center' });

        // Save PDF
        const filename = `Kuendigung_${contractType.value}_${userName.value.replace(/\s+/g, '_')}.pdf`;
        doc.save(filename);
    });

    updateSteps();
});
