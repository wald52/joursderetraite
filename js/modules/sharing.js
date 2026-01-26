/**
 * Module: sharing.js
 * Fonctions de partage sur les réseaux sociaux
 */

import { state } from './state.js';

/**
 * Détecte si l'utilisateur est sur un ordinateur
 * @returns {boolean}
 */
export function isDesktop() {
    return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

/**
 * Copie le résultat dans le presse-papiers
 * @param {string} mode - 'temporal' ou 'financial'
 */
export function copyResult(mode = 'temporal') {
    let resultText;
    let copyBtn;

    // Utiliser les résultats stockés dans l'état global pour éviter de copier la structure HTML
    if (mode === 'temporal') {
        resultText = state.storedTemporalResult;
        copyBtn = document.querySelector('#result-section-temporal .copy-btn');
    } else {
        resultText = state.storedFinancialResult;
        copyBtn = document.querySelector('#result-section-financial .copy-btn');
    }

    // Fallback si l'état est vide (ne devrait pas arriver si un calcul a été fait)
    if (!resultText || resultText.trim() === "") {
        console.warn("Résultat stocké vide, tentative de récupération depuis le DOM...");
        if (mode === 'temporal') {
            // Tentative de reconstruction propre pour le mode temporel
            const temporalGrid = document.querySelector('.result-grid-temporal');
            if (temporalGrid) {
                const boxes = temporalGrid.querySelectorAll('.result-box');
                const parts = [];
                boxes.forEach(box => {
                    const val = box.querySelector('.value span').textContent;
                    const label = box.querySelector('.label').textContent;
                    parts.push(`${val} ${label}`);
                });
                resultText = parts.join(' ');
            } else {
                resultText = document.getElementById('result-text-temporal').textContent;
            }
        } else {
            const comparisonElement = document.getElementById('comparison-result-text-financial');
            const comparisonText = comparisonElement ? comparisonElement.textContent : "";
            resultText = comparisonText.trim() !== "" ? comparisonText : document.getElementById('result-text-financial').textContent;
        }
    }

    if (!resultText || resultText.trim() === "") {
        alert("Aucun résultat à copier. Veuillez d'abord effectuer un calcul.");
        return;
    }

    if (!copyBtn) {
        console.error("Bouton de copie introuvable");
        // On continue quand même pour copier le texte
    }

    navigator.clipboard.writeText(resultText).then(function () {
        if (copyBtn) {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(function () {
                copyBtn.innerHTML = originalIcon;
            }, 2000);
        }
    }).catch(function (err) {
        console.error('Erreur lors de la copie: ', err);
        alert('Erreur lors de la copie. Vérifiez les permissions de votre navigateur.');
    });
}

/**
 * Génère le message de partage
 * @param {string} mode - 'temporal' ou 'financial'
 * @returns {string} Le message formaté
 */
function getShareMessage(mode) {
    let resultText;

    if (mode === 'temporal') {
        resultText = state.storedTemporalResult;
    } else {
        resultText = state.storedFinancialResult;
    }

    // Fallback DOM si l'état est vide
    if (!resultText || resultText.trim() === "") {
        if (mode === 'temporal') {
            const temporalGrid = document.querySelector('.result-grid-temporal');
            if (temporalGrid) {
                const boxes = temporalGrid.querySelectorAll('.result-box');
                const parts = [];
                boxes.forEach(box => {
                    const val = box.querySelector('.value span').textContent;
                    const label = box.querySelector('.label').textContent;
                    parts.push(`${val} ${label}`);
                });
                resultText = parts.join(' ');
            } else {
                resultText = document.getElementById('result-text-temporal').textContent;
            }
        } else {
            const comparisonElement = document.getElementById('comparison-result-text-financial');
            const comparisonText = comparisonElement ? comparisonElement.textContent : "";
            resultText = comparisonText.trim() !== "" ? comparisonText : document.getElementById('result-text-financial').textContent;
        }
    }

    if (!resultText || resultText.trim() === "") {
        return null;
    }

    let message;
    if (mode === 'temporal') {
        const amountInput = document.getElementById('amount');
        const amountValue = amountInput ? parseFloat(amountInput.value.replace(/\u00A0/g, '').replace(/,/g, '.')) : 0;

        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        message = `😱 Incroyable perspective ! ${formattedAmount} représentent ${resultText} de retraites versées en France`;
    } else {
        message = `😱 Incroyable perspective ! ${resultText}`;
    }

    return message;
}

/**
 * Partage sur les réseaux sociaux
 * @param {string} platform - 'facebook' ou 'twitter'
 */
export function shareOnSocial(platform) {
    const message = getShareMessage(state.currentActiveMode);
    if (!message) {
        alert("Veuillez d'abord effectuer un calcul.");
        return;
    }

    const currentUrl = window.location.href;

    let shareUrl = '';

    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(message)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(message)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
            break;
        case 'nostr':
            shareUrl = `https://nostr.at/compose?text=${encodeURIComponent(message + ' ' + currentUrl)}`;
            break;
        case 'instagram':
            // Instagram n'a pas d'URL de partage web directe, on redirige vers l'app ou le profil
            shareUrl = `https://www.instagram.com/`;
            break;
        case 'tiktok':
            // TikTok n'a pas d'URL de partage web directe simple
            shareUrl = `https://www.tiktok.com/`;
            break;
        case 'discord':
            shareUrl = `https://discord.com/channels/@me`;
            break;
        default:
            return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
}

/**
 * Partage via email ou SMS
 * @param {string} method - 'email' ou 'sms'
 */
export function shareVia(method) {
    const currentUrl = window.location.href;
    const message = getShareMessage(state.currentActiveMode);

    if (!message) {
        alert("Veuillez d'abord effectuer un calcul.");
        return;
    }

    if (method === 'email') {
        const subject = encodeURIComponent("Calculatrice d'équivalent retraites");
        const body = encodeURIComponent(`${message}\n\nDécouvrez cette calculatrice ici : ${currentUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else if (method === 'sms') {
        const body = encodeURIComponent(`${message} ${currentUrl}`);
        window.location.href = `sms:?body=${body}`;
    }
}

/**
 * Partage natif de l'appareil
 * @param {string} mode - 'temporal' ou 'financial'
 */
export function nativeShare(mode = 'temporal') {
    const message = getShareMessage(mode);

    if (!message) {
        alert("Aucun résultat à partager. Veuillez d'abord effectuer un calcul.");
        return;
    }

    const shareTitle = "Incroyable perspective sur les retraites en France!";
    const shareText = message;

    if (navigator.share) {
        navigator.share({
            title: shareTitle,
            text: shareText,
            url: window.location.href
        }).catch(error => {
            console.log('Erreur de partage natif:', error);
            if (error.name !== 'AbortError') {
                fallbackShare(shareText);
            }
        });
    } else {
        fallbackShare(shareText);
    }
}

/**
 * Solution de repli pour le partage
 * @param {string} text - Le texte à partager
 */
function fallbackShare(text) {
    if (confirm("L'API de partage n'est pas prise en charge sur votre appareil. Voulez-vous copier le texte dans le presse-papiers ?")) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Le texte a été copié dans le presse-papiers.');
        }).catch(err => {
            console.error('Erreur lors de la copie:', err);
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Le texte a été copié dans le presse-papiers.');
        });
    }
}