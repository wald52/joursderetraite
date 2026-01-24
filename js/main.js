/**
 * main.js - Point d'entrée de l'application
 * Importe tous les modules et expose les fonctions globalement pour les attributs onclick du HTML
 */

// Imports des modules
import { formatNumberInput, extractNumber, allowOnlyNumbersAndComma, formatNumberOnBlur } from './modules/formatting.js';
import { calculate, calculateComparison } from './modules/calculator.js';
import { copyResult, shareOnSocial, shareVia, nativeShare } from './modules/sharing.js';
import { toggleMethodology, setRandomExample, resetForm, switchMode, updateObjectPrice, handleInput } from './modules/ui.js';
import { initTheme } from './modules/theme.js';
import { initPWA, promptInstall, dismissSnackbar } from './modules/pwa.js';

// Exposer les fonctions globalement pour les attributs onclick dans le HTML
window.formatNumberInput = formatNumberInput;
window.allowOnlyNumbersAndComma = allowOnlyNumbersAndComma;
window.formatNumberOnBlur = formatNumberOnBlur;
window.handleInput = handleInput;

window.calculate = calculate;
window.calculateComparison = calculateComparison;

window.copyResult = copyResult;
window.shareOnSocial = shareOnSocial;
window.shareVia = shareVia;
window.nativeShare = nativeShare;

window.toggleMethodology = toggleMethodology;
window.setRandomExample = setRandomExample;
window.resetForm = resetForm;
window.switchMode = switchMode;
window.updateObjectPrice = updateObjectPrice;

window.promptInstall = promptInstall;
window.dismissSnackbar = dismissSnackbar;

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', function () {
    // Initialiser le thème
    initTheme();

    // Initialiser la PWA
    initPWA();

    // Gestion de la période personnalisée
    const timePeriodSelect = document.getElementById('time-period');
    const customPeriodContainer = document.getElementById('custom-period-container');

    if (timePeriodSelect && customPeriodContainer) {
        timePeriodSelect.addEventListener('change', function () {
            if (this.value === 'custom') {
                customPeriodContainer.classList.remove('hidden');
            } else {
                customPeriodContainer.classList.add('hidden');
            }
        });
    }

    // Activer le mode temporel par défaut
    switchMode('temporal');

    console.log('Application initialisée avec succès (version modernisée)');
});
