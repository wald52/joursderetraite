/**
 * Module: ui.js
 * Fonctions d'interface utilisateur
 */

import { state } from './state.js';
import { getRandomExample } from './examples.js';
import { formatNumberInput } from './formatting.js';
import { calculate } from './calculator.js';

console.log("=== UI.js Charge [Version MARQUEE V4 - Display Block] ===");

/**
 * Bascule l'accordéon méthodologie
 */
export function toggleMethodology() {
    const accordion = document.getElementById('methodology-section');
    if (accordion) {
        accordion.classList.toggle('open');
    }
}

/**
 * Définit un exemple aléatoire
 */
export function setRandomExample() {
    console.log("=== setRandomExample() appelée ===");
    const temporalInputs = document.getElementById('temporal-inputs');

    if (temporalInputs.classList.contains('hidden')) {
        alert("Le bouton 'Exemple aléatoire' n'est disponible que dans le mode temporel.");
        return;
    }

    const randomExample = getRandomExample();
    const formattedValue = randomExample.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    const amountInput = document.getElementById('amount');

    if (amountInput) {
        amountInput.value = formattedValue;
    }

    formatNumberInput(document.getElementById('amount'));

    // Mettre à jour l'affichage de l'exemple actuel
    const currentExampleElement = document.getElementById('current-example');
    if (currentExampleElement) {
        let label = randomExample.label;
        const parts = label.split(/\s+[-–—]\s+/);
        if (parts.length > 1) {
            label = parts.slice(1).join(' - ');
        }

        // Structure pour le marquee
        currentExampleElement.innerHTML = `<span class="marquee-content">${label}</span>`;
        currentExampleElement.classList.remove('scrolling');

        // Force reflow
        void currentExampleElement.offsetWidth;

        // Vérification du débordement
        const marqueeContent = currentExampleElement.querySelector('.marquee-content');
        const clientWidth = currentExampleElement.clientWidth;
        const scrollWidth = marqueeContent.scrollWidth;

        console.log(`Debug Marquee: label="${label}", clientWidth=${clientWidth}, scrollWidth=${scrollWidth}`);

        if (scrollWidth > clientWidth + 5) { // Petit seuil de sécurité
            currentExampleElement.classList.add('scrolling');

            // Calcul de la durée : plus le texte est long, plus on prend de temps
            // Base : 1s pour 15 caractères, minimum 8s
            const duration = Math.max(8, Math.ceil(label.length / 10));
            marqueeContent.style.animationDuration = `${duration}s`;
            console.log(`Debug Marquee: Animation activée, durée=${duration}s`);
        } else {
            console.log(`Debug Marquee: Pas de défilement nécessaire`);
        }
    }

    calculate();
}

/**
 * Réinitialise le formulaire
 */
export function resetForm() {
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.value = '';
    }

    const currentExampleElement = document.getElementById('current-example');
    if (currentExampleElement) {
        currentExampleElement.textContent = '';
    }

    // Masquer les sections de résultat
    const resultTemporal = document.getElementById('result-section-temporal');
    const shareTemporal = document.getElementById('share-section-temporal');
    const resultFinancial = document.getElementById('result-section-financial');
    const shareFinancial = document.getElementById('share-section-financial');

    if (resultTemporal) resultTemporal.classList.add('hidden');
    if (shareTemporal) shareTemporal.classList.add('hidden');
    if (resultFinancial) resultFinancial.classList.add('hidden');
    if (shareFinancial) shareFinancial.classList.add('hidden');

    // Réinitialiser les textes
    const resultTextTemporal = document.getElementById('result-text-temporal');
    const resultTextFinancial = document.getElementById('result-text-financial');

    if (resultTextTemporal) resultTextTemporal.textContent = '';
    if (resultTextFinancial) resultTextFinancial.textContent = '';

    // Réinitialiser l'état
    state.storedTemporalResult = '';
    state.storedFinancialResult = '';
    state.storedFinancialComparisonResult = '';
}

/**
 * Bascule entre les modes temporel et financier
 * @param {string} mode - 'temporal' ou 'financial'
 */
export function switchMode(mode) {
    state.isCalculating = true;

    const temporalInputs = document.getElementById('temporal-inputs');
    const financialInputs = document.getElementById('financial-inputs');
    const temporalModeBtn = document.getElementById('temporal-mode-btn');
    const financialModeBtn = document.getElementById('financial-mode-btn');

    if (mode === 'temporal') {
        temporalInputs.classList.remove('hidden');
        financialInputs.classList.add('hidden');

        if (temporalModeBtn) temporalModeBtn.classList.add('active');
        if (financialModeBtn) financialModeBtn.classList.remove('active');

        // Masquer les sections du mode financier
        const resultFinancial = document.getElementById('result-section-financial');
        const shareFinancial = document.getElementById('share-section-financial');
        if (resultFinancial) resultFinancial.classList.add('hidden');
        if (shareFinancial) shareFinancial.classList.add('hidden');

        // Afficher les sections du mode temporel si résultat existant
        if (state.storedTemporalResult !== '') {
            const resultTemporal = document.getElementById('result-section-temporal');
            const shareTemporal = document.getElementById('share-section-temporal');
            if (resultTemporal) resultTemporal.classList.remove('hidden');
            if (shareTemporal) shareTemporal.classList.remove('hidden');
        }
    } else if (mode === 'financial') {
        temporalInputs.classList.add('hidden');
        financialInputs.classList.remove('hidden');

        if (financialModeBtn) financialModeBtn.classList.add('active');
        if (temporalModeBtn) temporalModeBtn.classList.remove('active');

        // Masquer les sections du mode temporel
        const resultTemporal = document.getElementById('result-section-temporal');
        const shareTemporal = document.getElementById('share-section-temporal');
        if (resultTemporal) resultTemporal.classList.add('hidden');
        if (shareTemporal) shareTemporal.classList.add('hidden');

        // Afficher les sections du mode financier si résultat existant
        if (state.storedFinancialResult !== '') {
            const resultFinancial = document.getElementById('result-section-financial');
            const shareFinancial = document.getElementById('share-section-financial');
            if (resultFinancial) resultFinancial.classList.remove('hidden');
            if (shareFinancial) shareFinancial.classList.remove('hidden');
        }
    }

    state.currentActiveMode = mode;

    setTimeout(() => {
        state.isCalculating = false;
    }, 50);
}

/**
 * Met à jour le prix en fonction de l'objet sélectionné
 */
export function updateObjectPrice() {
    const objectTypeSelect = document.getElementById('object-type');
    const objectPriceInput = document.getElementById('object-price');
    const customObjectInput = document.getElementById('custom-object-input');
    const objectNameInput = document.getElementById('object-name');
    const customPeriodContainer = document.getElementById('custom-period-container');

    if (!objectTypeSelect || !objectPriceInput) return;

    const selectedOption = objectTypeSelect.options[objectTypeSelect.selectedIndex];
    const price = selectedOption.getAttribute('data-price');

    if (selectedOption.value === 'autre') {
        objectPriceInput.value = '';
        if (objectNameInput) objectNameInput.value = '';
        if (customObjectInput) customObjectInput.classList.remove('hidden');
        objectPriceInput.disabled = false;
    } else if (selectedOption.value === '') {
        objectPriceInput.value = '';
        if (objectNameInput) objectNameInput.value = '';
        if (customObjectInput) customObjectInput.classList.add('hidden');
        objectPriceInput.disabled = false;
    } else {
        if (price) {
            const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
            objectPriceInput.value = formattedPrice;
        }
        if (objectNameInput) objectNameInput.value = selectedOption.text.split(' (')[0];
        if (customObjectInput) customObjectInput.classList.add('hidden');
        objectPriceInput.disabled = true;
    }

    // Gérer la période personnalisée
    const timePeriodSelect = document.getElementById('time-period');
    if (timePeriodSelect && customPeriodContainer) {
        if (timePeriodSelect.value === 'custom') {
            customPeriodContainer.classList.remove('hidden');
        } else {
            customPeriodContainer.classList.add('hidden');
        }
    }
}

/**
 * Gère l'entrée de l'utilisateur (masque l'exemple affiché)
 */
export function handleInput() {
    const currentExampleElement = document.getElementById('current-example');
    if (currentExampleElement) {
        currentExampleElement.textContent = '';
    }
}
