/**
 * Module: pwa.js
 * Gestion du Service Worker et de la PWA
 */

import { state } from './state.js';

/**
 * Affiche un indicateur de mode hors ligne
 */
export function showOfflineIndicator() {
    let offlineBanner = document.getElementById('offline-banner');
    if (!offlineBanner) {
        offlineBanner = document.createElement('div');
        offlineBanner.id = 'offline-banner';
        offlineBanner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background-color: #ff6b6b;
            color: white;
            text-align: center;
            padding: 8px;
            z-index: 10000;
            font-weight: bold;
            font-size: 14px;
        `;
        offlineBanner.innerHTML = "Mode hors ligne - L'application est entièrement fonctionnelle";
        document.body.appendChild(offlineBanner);
    } else {
        offlineBanner.style.display = 'block';
    }
}

/**
 * Cache l'indicateur de mode hors ligne
 */
export function hideOfflineIndicator() {
    const offlineBanner = document.getElementById('offline-banner');
    if (offlineBanner) {
        offlineBanner.style.display = 'none';
    }
}

/**
 * Déclenche l'invite d'installation
 */
export function promptInstall() {
    if (state.deferredPrompt) {
        state.deferredPrompt.prompt();

        state.deferredPrompt.userChoice.then(() => {


            const installBtn = document.getElementById('install-btn');
            const snackbar = document.getElementById('pwa-snackbar');

            if (installBtn) {
                installBtn.style.display = 'none';
            }
            if (snackbar) {
                snackbar.classList.remove('show');
            }

            state.deferredPrompt = null;
        });
    }
}

/**
 * Ferme la snackbar
 */
export function dismissSnackbar() {
    const snackbar = document.getElementById('pwa-snackbar');
    if (snackbar) {
        snackbar.classList.remove('show');
        state.snackbarDismissed = true;
        localStorage.setItem('snackbarDismissed', 'true');
    }
}

/**
 * Affiche la snackbar PWA après 2 calculs
 */
export function showPWASnackbar() {
    // Ne pas afficher si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return;
    }

    // Ne pas afficher si l'utilisateur a déjà fermé la snackbar
    if (state.snackbarDismissed) {
        return;
    }

    // Ne pas afficher si pas d'invite d'installation disponible
    if (!state.deferredPrompt) {
        return;
    }

    const snackbar = document.getElementById('pwa-snackbar');

    if (snackbar) {
        snackbar.classList.remove('hidden');
        setTimeout(() => {
            snackbar.classList.add('show');
        }, 100);
    }
}

/**
 * Initialise le Service Worker et la PWA
 */
export function initPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js')
                .then(function () {


                    window.addEventListener('beforeinstallprompt', (event) => {

                        event.preventDefault();
                        state.deferredPrompt = event;
                    });
                })
                .catch(function () {

                });
        });

        // Gestion de l'état de connexion
        window.addEventListener('online', function () {

            hideOfflineIndicator();
        });

        window.addEventListener('offline', function () {

            showOfflineIndicator();
        });

        // Note: éviter de forcer un reload ici pour ne pas perturber Lighthouse/FCP
    }

    // Écouter l'événement de calcul terminé pour proposer l'installation
    window.addEventListener('calculationComplete', (event) => {
        const { count } = event.detail;


        // Proposer l'installation après 2 calculs
        if (count >= 2) {
            showPWASnackbar();
        }
    });
}
