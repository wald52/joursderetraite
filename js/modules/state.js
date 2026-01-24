/**
 * Module: state.js
 * État global partagé de l'application
 */

export const state = {
    // Variables pour suivre si un calcul a déjà été effectué
    hasCalculatedTemporal: false,
    hasCalculatedFinancial: false,

    // Variables pour stocker les résultats
    storedTemporalResult: '',
    storedFinancialResult: '',
    storedFinancialComparisonResult: '',

    // Variable pour suivre si on est en train de calculer
    isCalculating: false,

    // Variable pour suivre le mode actif
    currentActiveMode: 'temporal', // 'temporal' ou 'financial'

    // Variable pour stocker l'événement d'installation différée
    deferredPrompt: null,

    // Compteur de calculs pour l'invitation PWA
    calculationCount: parseInt(localStorage.getItem('calculationCount') || '0', 10),

    // Variable pour suivre si la snackbar a été fermée
    snackbarDismissed: localStorage.getItem('snackbarDismissed') === 'true'
};
