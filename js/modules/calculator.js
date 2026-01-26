/**
 * Module: calculator.js
 * Fonctions de calcul pour l'équivalent retraites
 */

import { extractNumber, formatCurrency, getPeriodText } from './formatting.js';
import { state } from './state.js';

/**
 * Déclenche l'animation slideUp sur les éléments
 * @param {HTMLElement} element - L'élément conteneur
 */
export function triggerAnimation(element) {
    if (!element) return;
    
    const digits = element.querySelectorAll('.counter-digit span');
    digits.forEach((digit, index) => {
        digit.style.animation = 'none';
        digit.offsetHeight; // Force reflow
        digit.style.animation = `slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s backwards`;
    });
}

/**
 * Animation compteur (Obsolète, gardé pour compatibilité temporaire si nécessaire)
 * @param {HTMLElement} element 
 * @param {string} text 
 */
export function animateCounter(element, text) {
    if (!element) return;
    element.textContent = text;
}

/**
 * Logique de calcul pour le mode temporel
 */
export function calculateLogic() {
    console.log("=== calculateLogic() appelée ===");
    state.isCalculating = true;

    // Vérifier que nous sommes bien en mode temporel
    const temporalInputs = document.getElementById('temporal-inputs');
    if (temporalInputs.classList.contains('hidden')) {
        console.error("Erreur: calculateLogic() appelé alors que nous ne sommes pas en mode temporel");
        state.isCalculating = false;
        return;
    }

    // Récupérer la valeur brute du champ
    const amountInput = document.getElementById('amount');
    const rawValue = amountInput ? amountInput.value : '';

    // Si le champ est vide, ne rien faire
    if (rawValue.trim() === '') {
        state.isCalculating = false;
        return;
    }

    // Extraire le nombre de la valeur du champ
    const amount = extractNumber(rawValue);

    if (isNaN(amount) || amount < 0) {
        state.isCalculating = false;
        return;
    }

    // Incrémenter le compteur de calculs pour PWA
    state.calculationCount = (state.calculationCount || 0) + 1;
    localStorage.setItem('calculationCount', state.calculationCount.toString());

    // Montant total des retraites versées en France en 2025
    const totalRetraites = 420e9; // 420 milliards d'euros

    // Calcul du ratio
    const ratio = amount / totalRetraites;

    // Nombre de secondes dans une année
    const secondsInYear = 365.25 * 24 * 60 * 60;

    // Calcul des secondes équivalentes
    const equivalentSeconds = ratio * secondsInYear;

    // Conversion en années, mois, jours, heures, minutes et secondes
    const secondsInDay = 24 * 60 * 60;
    const secondsInHour = 60 * 60;
    const secondsInMinute = 60;

    // Calcul des années
    const years = Math.floor(equivalentSeconds / (365.25 * secondsInDay));
    let remainingSeconds = equivalentSeconds % (365.25 * secondsInDay);

    // Calcul des mois
    const daysInMonth = 365.25 / 12;
    const secondsInMonth = daysInMonth * secondsInDay;
    const months = Math.floor(remainingSeconds / secondsInMonth);
    remainingSeconds = remainingSeconds % secondsInMonth;

    // Calcul des jours, heures, minutes et secondes
    const days = Math.floor(remainingSeconds / secondsInDay);
    remainingSeconds = remainingSeconds % secondsInDay;
    const hours = Math.floor(remainingSeconds / secondsInHour);
    remainingSeconds = remainingSeconds % secondsInHour;
    const minutes = Math.floor(remainingSeconds / secondsInMinute);
    const seconds = Math.floor(remainingSeconds % secondsInMinute);

    // Construction du HTML structuré
    let html = '<div class="result-grid-temporal">';
    let textResult = '';

    const addBox = (val, label) => {
        textResult += `${val} ${label} `;
        return `
        <div class="result-box">
            <span class="value counter-digit"><span>${val}</span></span>
            <span class="label">${label}</span>
        </div>`;
    };

    let hasContent = false;
    if (years > 0) { html += addBox(years, years === 1 ? 'Année' : 'Années'); hasContent = true; }
    if (months > 0) { html += addBox(months, 'Mois'); hasContent = true; }
    if (days > 0) { html += addBox(days, days === 1 ? 'Jour' : 'Jours'); hasContent = true; }
    if (hours > 0) { html += addBox(hours, hours === 1 ? 'Heure' : 'Heures'); hasContent = true; }
    if (minutes > 0) { html += addBox(minutes, minutes === 1 ? 'Minute' : 'Minutes'); hasContent = true; }
    if (seconds > 0) { html += addBox(seconds, seconds === 1 ? 'Seconde' : 'Secondes'); hasContent = true; }
    
    if (!hasContent) {
        html += addBox(0, 'Seconde');
    }

    html += '</div>';

    // Affichage du résultat
    const resultElement = document.getElementById('result-text-temporal');
    if (resultElement) {
        resultElement.innerHTML = html;
        triggerAnimation(resultElement);
    }

    // Stocker le résultat (format texte pour le partage)
    state.storedTemporalResult = textResult.trim() || '0 seconde';

    // Afficher les sections de résultat et de partage
    const resultSection = document.getElementById('result-section-temporal');
    const shareSection = document.getElementById('share-section-temporal');

    if (resultSection) {
        resultSection.classList.remove('hidden');
    }

    if (shareSection) {
        shareSection.classList.remove('hidden');
    }

    // Masquer les sections du mode financier
    const financialResultSection = document.getElementById('result-section-financial');
    const financialShareSection = document.getElementById('share-section-financial');
    if (financialResultSection) {
        financialResultSection.classList.add('hidden');
    }
    if (financialShareSection) {
        financialShareSection.classList.add('hidden');
    }

    // Déclencher l'événement pour PWA
    window.dispatchEvent(new CustomEvent('calculationComplete', {
        detail: { mode: 'temporal', count: state.calculationCount }
    }));

    state.isCalculating = false;
}

/**
 * Fonction principale de calcul pour le mode temporel
 */
export function calculate() {
    console.log("=== calculate() appelée ===");
    const temporalInputs = document.getElementById('temporal-inputs');

    if (temporalInputs.classList.contains('hidden')) {
        console.log("calculate() ignoré - pas en mode temporel");
        return;
    }

    calculateLogic();
}

/**
 * Calcul pour le mode financier (comparaison avec objets)
 */
export function calculateComparison() {
    const objectTypeSelect = document.getElementById('object-type');
    const selectedOption = objectTypeSelect.options[objectTypeSelect.selectedIndex];
    let objectName = '';

    if (selectedOption.value === 'autre' || selectedOption.value === '') {
        objectName = document.getElementById('object-name').value || 'objet';
    } else {
        let originalName = selectedOption.text.split(' (')[0];
        let firstWord = originalName.split(' ')[0];
        if (firstWord === firstWord.toUpperCase() && firstWord.length > 1) {
            objectName = originalName;
        } else {
            objectName = originalName.charAt(0).toLowerCase() + originalName.slice(1);
        }
    }

    // Récupérer la valeur brute du champ
    const rawPriceValue = document.getElementById('object-price').value;

    if (rawPriceValue.trim() === '') {
        alert("Veuillez entrer un prix pour l'objet.");
        return;
    }

    const objectPrice = extractNumber(rawPriceValue);
    const timePeriodValue = document.getElementById('time-period').value;

    if (isNaN(objectPrice) || objectPrice <= 0) {
        alert("Veuillez entrer un prix valide pour l'objet.");
        return;
    }

    let periodMultiplier;
    if (timePeriodValue === 'custom') {
        const rawPeriodValue = document.getElementById('custom-period').value;

        if (rawPeriodValue.trim() === '') {
            alert("Veuillez entrer une durée personnalisée.");
            return;
        }

        periodMultiplier = extractNumber(rawPeriodValue);
        if (isNaN(periodMultiplier) || periodMultiplier <= 0) {
            alert("Veuillez entrer une durée personnalisée valide.");
            return;
        }
    } else {
        periodMultiplier = parseFloat(timePeriodValue);
    }

    // Incrémenter le compteur de calculs pour PWA
    state.calculationCount = (state.calculationCount || 0) + 1;
    localStorage.setItem('calculationCount', state.calculationCount.toString());

    // Calcul du montant équivalent
    const annualRetirementAmount = 420e9;
    const periodAmount = annualRetirementAmount * periodMultiplier;
    const numberOfObjects = periodAmount / objectPrice;

    // Formatage du résultat
    let formattedNumber;
    let rawNumberFormatted;
    
    if (numberOfObjects >= 1e6) {
        rawNumberFormatted = (numberOfObjects / 1e6).toFixed(1).replace('.', ',');
        if (rawNumberFormatted.endsWith(',0')) {
            rawNumberFormatted = rawNumberFormatted.slice(0, -2);
        }
        formattedNumber = rawNumberFormatted + ' millions';
    } else if (numberOfObjects >= 1e3) {
        rawNumberFormatted = (numberOfObjects / 1e3).toFixed(1).replace('.', ',');
        if (rawNumberFormatted.endsWith(',0')) {
            rawNumberFormatted = rawNumberFormatted.slice(0, -2);
        }
        formattedNumber = rawNumberFormatted + ' milliers';
    } else if (numberOfObjects >= 1) {
        if (numberOfObjects % 1 !== 0) {
            formattedNumber = numberOfObjects.toFixed(1).replace('.', ',');
            if (formattedNumber.endsWith(',0')) {
                formattedNumber = formattedNumber.slice(0, -2);
            }
        } else {
            formattedNumber = Math.floor(numberOfObjects).toLocaleString();
        }
    } else {
        formattedNumber = numberOfObjects.toFixed(1).replace('.', ',');
        if (formattedNumber.endsWith(',0')) {
            formattedNumber = formattedNumber.slice(0, -2);
        }
    }

    // Affichage du résultat principal avec la nouvelle structure de liste
    const mainResultText = document.getElementById('result-text-financial');
    const periodText = getPeriodText(periodMultiplier);
    
    // Déterminer le pluriel pour l'objet
    const objectLabel = `${objectName}${(numberOfObjects > 1 || numberOfObjects === 0) && !objectName.endsWith('s') ? 's' : ''}`;

    const resultHTML = `
    <div class="result-list-financial">
        <div class="result-row">
            <span class="label">Période de référence</span>
            <span class="value" style="color: var(--gold-400);">${periodText}</span>
        </div>
        <div class="result-row">
            <span class="label">Montant équivalent</span>
            <span class="value">${formatCurrency(periodAmount)}</span>
        </div>
        <div class="result-row">
            <span class="label">Coût unitaire (${objectName})</span>
            <span class="value">${formatCurrency(objectPrice)}</span>
        </div>
        <div class="result-row highlight">
            <span class="label">QUANTITÉ FINANCABLE</span>
            <div class="value counter-digit"><span>${formattedNumber}</span> <span style="font-size: 0.6em; font-weight: 400; color: var(--gray-300);">${objectLabel}</span></div>
        </div>
    </div>
    `;

    mainResultText.innerHTML = resultHTML;
    triggerAnimation(mainResultText);
    
    // Texte simple pour le partage
    const simpleText = `Avec ${periodText} de retraites (${formatCurrency(periodAmount)}), on peut avoir ${formattedNumber} ${objectLabel} à ${formatCurrency(objectPrice)} chacun.`;

    // Stocker les résultats
    state.storedFinancialResult = simpleText;
    // Pour compatibilité avec sharing.js
    const hiddenComparisonDiv = document.getElementById('comparison-result-text-financial');
    if(hiddenComparisonDiv) hiddenComparisonDiv.textContent = simpleText;

    // Afficher les sections du mode financier
    const financialResultSection = document.getElementById('result-section-financial');
    const financialShareSection = document.getElementById('share-section-financial');

    if (financialResultSection) {
        financialResultSection.classList.remove('hidden');
    }
    if (financialShareSection) {
        financialShareSection.classList.remove('hidden');
    }

    // Masquer les sections du mode temporel
    document.getElementById('result-section-temporal').classList.add('hidden');
    document.getElementById('share-section-temporal').classList.add('hidden');

    // Déclencher l'événement pour PWA
    window.dispatchEvent(new CustomEvent('calculationComplete', {
        detail: { mode: 'financial', count: state.calculationCount }
    }));

    state.currentActiveMode = 'financial';
    state.isCalculating = false;
}