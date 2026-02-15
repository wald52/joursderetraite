/**
 * Module: ui.js
 * Fonctions d'interface utilisateur
 */

import { state } from './state.js';
import { formatNumberInput } from './formatting.js';

// calculate et getRandomExample sont chargés 500 ms après le lancement (main.js) et exposés sur window



/**
 * Initialise les dropdowns personnalisés
 */
export function initCustomDropdowns() {
    const customDropdowns = document.querySelectorAll('.custom-dropdown');

    customDropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const optionsContainer = dropdown.querySelector('.dropdown-options');
        const options = dropdown.querySelectorAll('.dropdown-option');
        const nativeSelect = dropdown.parentElement.querySelector('select');
        const triggerText = trigger.querySelector('.trigger-text');

        // Créer un wrapper pour les options et la scrollbar
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position: relative; max-height: 300px; height: 100%; overflow: hidden;';

        // Créer le conteneur de défilement pour les options
        const scrollContainer = document.createElement('div');
        scrollContainer.style.cssText = 'max-height: 300px; overflow-y: scroll; scrollbar-width: none; -ms-overflow-style: none;';
        scrollContainer.className = 'dropdown-scroll-container';

        // Déplacer les options dans le conteneur de défilement
        options.forEach(opt => scrollContainer.appendChild(opt));

        // Créer la scrollbar personnalisée
        const scrollbar = document.createElement('div');
        scrollbar.className = 'custom-scrollbar';
        scrollbar.style.cssText = 'position: absolute; top: 8px; right: 4px; width: 10px; height: calc(100% - 16px); background: transparent; border-radius: 5px; pointer-events: auto; z-index: 10; cursor: pointer; opacity: 0; transition: opacity 0.3s ease;';

        const thumb = document.createElement('div');
        thumb.className = 'custom-scrollbar-thumb';
        thumb.style.cssText = 'position: absolute; top: 0; left: 2px; width: 6px; background: var(--gold-500); border-radius: 3px; box-shadow: 0 0 8px rgba(212, 175, 55, 0.6); transition: background 0.2s ease; min-height: 40px; cursor: pointer;';

        scrollbar.appendChild(thumb);
        wrapper.appendChild(scrollContainer);
        wrapper.appendChild(scrollbar);
        optionsContainer.appendChild(wrapper);

        // Fonction pour mettre à jour la scrollbar
        function updateScrollbar() {
            const scrollHeight = scrollContainer.scrollHeight;
            const clientHeight = scrollContainer.clientHeight;
            const scrollTop = scrollContainer.scrollTop;

            if (scrollHeight <= clientHeight) {
                scrollbar.style.opacity = '0';
                return;
            }

            scrollbar.style.opacity = '1';
            const trackHeight = clientHeight - 16;
            const thumbHeight = Math.max(40, (clientHeight / scrollHeight) * trackHeight);
            const maxScroll = scrollHeight - clientHeight;
            const maxThumbPos = trackHeight - thumbHeight;
            const thumbPos = maxScroll > 0 ? (scrollTop / maxScroll) * maxThumbPos : 0;

            thumb.style.height = thumbHeight + 'px';
            thumb.style.transform = `translateY(${thumbPos}px)`;
        }

        // Mettre à jour sur scroll avec RAF pour fluidité
        let ticking = false;
        scrollContainer.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateScrollbar();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Logique de drag pour la scrollbar
        let isDragging = false;
        let startY, startScrollTop;

        thumb.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // Empêcher la fermeture du dropdown
            isDragging = true;
            startY = e.pageY;
            startScrollTop = scrollContainer.scrollTop;
            thumb.style.background = 'var(--gold-400)';
            document.body.style.userSelect = 'none'; // Empêcher la sélection de texte pendant le drag
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaY = e.pageY - startY;
            const scrollHeight = scrollContainer.scrollHeight;
            const clientHeight = scrollContainer.clientHeight;
            const trackHeight = clientHeight - 16;
            const thumbHeight = parseFloat(thumb.style.height);
            const maxThumbPos = trackHeight - thumbHeight;
            const maxScroll = scrollHeight - clientHeight;

            // Calculer le ratio de défilement basé sur le mouvement de la souris
            const moveRatio = deltaY / maxThumbPos;
            scrollContainer.scrollTop = startScrollTop + (moveRatio * maxScroll);
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                thumb.style.background = 'var(--gold-500)';
                document.body.style.userSelect = '';
            }
        });

        // Click sur la track pour sauter
        scrollbar.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // Empêcher la fermeture du dropdown
            if (e.target === scrollbar) {
                const rect = scrollbar.getBoundingClientRect();
                const clickPos = e.clientY - rect.top;
                const trackHeight = rect.height;
                const thumbHeight = parseFloat(thumb.style.height);

                const scrollRatio = (clickPos - thumbHeight / 2) / (trackHeight - thumbHeight);
                const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
                scrollContainer.scrollTop = scrollRatio * maxScroll;
            }
        });

        // Empêcher la fermeture du dropdown lors d'un clic à l'intérieur (zone d'exclusion)
        optionsContainer.addEventListener('mousedown', (e) => e.stopPropagation());
        optionsContainer.addEventListener('click', (e) => e.stopPropagation());

        // Mettre à jour quand le dropdown s'ouvre
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (dropdown.classList.contains('open')) {
                        setTimeout(updateScrollbar, 10);
                    }
                }
            });
        });
        observer.observe(dropdown, { attributes: true });

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // Fermer les autres dropdowns ouverts
            document.querySelectorAll('.custom-dropdown.open').forEach(openDropdown => {
                if (openDropdown !== dropdown) openDropdown.classList.remove('open');
            });
            dropdown.classList.toggle('open');
        });

        // Handle option click
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.getAttribute('data-value');
                const text = option.textContent;

                // Update trigger
                triggerText.textContent = text;

                // Sync with native select
                if (nativeSelect) {
                    nativeSelect.value = value;
                    // Déclencher manuellement l'événement change
                    const event = new Event('change');
                    nativeSelect.dispatchEvent(event);
                }

                // Update selected state in UI
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                // Close dropdown
                dropdown.classList.remove('open');
            });
        });
    });

    // Close on click outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-dropdown.open').forEach(dropdown => {
            dropdown.classList.remove('open');
        });
    });
}

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

    if (typeof window.getRandomExample !== 'function' || typeof window.calculate !== 'function') {
        setTimeout(setRandomExample, 200);
        return;
    }
    const temporalInputs = document.getElementById('temporal-inputs');

    if (temporalInputs.classList.contains('hidden')) {
        alert("Le bouton 'Exemple aléatoire' n'est disponible que dans le mode temporel.");
        return;
    }

    const randomExample = window.getRandomExample();
    const formattedValue = randomExample.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    const amountInput = document.getElementById('amount');

    if (amountInput) {
        amountInput.value = formattedValue;
        state.currentExampleLabel = randomExample.label; // Utiliser le label propre (ex: "l'UNESCO (2025)")
    }

    formatNumberInput(document.getElementById('amount'));

    // Mettre à jour l'affichage de l'exemple actuel
    const currentExampleElement = document.getElementById('current-example');
    if (currentExampleElement) {
        let label = randomExample.label;

        // Nettoyer le label pour le marquee (enlever l'article au début ET mettre une majuscule)
        let cleanLabelForMarquee = label.replace(/^(le|la|les|l'|un|une|des)\s+/i, '').replace(/^l'/i, '');
        cleanLabelForMarquee = cleanLabelForMarquee.charAt(0).toUpperCase() + cleanLabelForMarquee.slice(1);

        const parts = label.split(/\s+[-–—]\s+/);
        if (parts.length > 1) {
            label = parts.slice(1).join(' - ');
        }

        // Structure pour le marquee
        currentExampleElement.innerHTML = `<span class="marquee-content">${cleanLabelForMarquee}</span>`;
        currentExampleElement.classList.remove('scrolling');

        // Attendre que le rendu soit stable pour mesurer le débordement réel
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const marqueeContent = currentExampleElement.querySelector('.marquee-content');
                if (!marqueeContent) return;

                const currentExampleStyle = window.getComputedStyle(currentExampleElement);
                const paddingLeft = parseFloat(currentExampleStyle.paddingLeft);
                const paddingRight = parseFloat(currentExampleStyle.paddingRight);
                const availableWidth = currentExampleElement.clientWidth - paddingLeft - paddingRight;
                const scrollWidth = marqueeContent.scrollWidth;

                if (scrollWidth > availableWidth) {
                    currentExampleElement.classList.add('scrolling');

                    // Calculer la distance de défilement nécessaire (réduire l'espace vide à la fin)
                    const scrollDistance = -(scrollWidth - availableWidth + 10); // Réduit à 10px d'espace vide
                    currentExampleElement.style.setProperty('--scroll-distance', `${scrollDistance}px`);

                    // Durée de l'animation ajustée pour le ping-pong avec 30% de pause (mouvement sur 40% du temps)
                    const baseDuration = Math.max(4, (scrollWidth - availableWidth) / 25);
                    marqueeContent.style.animationDuration = `${baseDuration}s`;
                }
            });
        });
    } else {
        state.currentExampleLabel = '';
    }

    window.calculate();
}

/**
 * Réinitialise le formulaire du mode temporel uniquement
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
    state.currentExampleLabel = '';

    // Masquer les sections de résultat temporel uniquement
    const resultTemporal = document.getElementById('result-section-temporal');
    const shareTemporal = document.getElementById('share-section-temporal');

    if (resultTemporal) resultTemporal.classList.add('hidden');
    if (shareTemporal) shareTemporal.classList.add('hidden');

    // Réinitialiser le texte temporel
    const resultTextTemporal = document.getElementById('result-text-temporal');
    if (resultTextTemporal) resultTextTemporal.textContent = '';

    // Réinitialiser uniquement l'état temporel
    state.storedTemporalResult = '';
}

/**
 * Bascule entre les modes temporel et financier (Version Premium)
 * Utilise des transitions CSS pilotées par data-attribute
 * @param {string} mode - 'temporal' ou 'financial'
 */
export function switchMode(mode) {
    if (state.currentActiveMode === mode) return;

    state.isCalculating = true;

    // Mise à jour de l'état global
    state.currentActiveMode = mode;

    // Mise à jour du data-attribute pour la pilule glissante
    const modeToggle = document.querySelector('.mode-toggle');
    if (modeToggle) {
        modeToggle.setAttribute('data-active', mode);
    }

    // 1. Mise à jour du conteneur pour déclencher les animations CSS
    const modesContainer = document.querySelector('.modes-container');
    if (modesContainer) {
        modesContainer.setAttribute('data-active-mode', mode);
    }

    // 2. Gestion des attributs 'hidden' pour l'accessibilité et le layout
    // On s'assure que les deux sont présents dans le DOM pour la transition
    const temporalInputs = document.getElementById('temporal-inputs');
    const financialInputs = document.getElementById('financial-inputs');

    if (temporalInputs) temporalInputs.removeAttribute('hidden');
    if (financialInputs) financialInputs.removeAttribute('hidden');

    // 3. Mise à jour des boutons du toggle
    const temporalModeBtn = document.getElementById('temporal-mode-btn');
    const financialModeBtn = document.getElementById('financial-mode-btn');

    if (mode === 'temporal') {
        if (temporalModeBtn) temporalModeBtn.classList.add('active');
        if (financialModeBtn) financialModeBtn.classList.remove('active');

        // Gérer la visibilité des résultats (immédiat pour éviter confusion visuelle)
        toggleResultSections('temporal');

    } else {
        if (financialModeBtn) financialModeBtn.classList.add('active');
        if (temporalModeBtn) temporalModeBtn.classList.remove('active');

        toggleResultSections('financial');
    }

    setTimeout(() => {
        state.isCalculating = false;
    }, 600); // Correspond à la durée de transition CSS
}

/**
 * Helper pour basculer la visibilité des sections de résultats/partage
 */
function toggleResultSections(activeMode) {
    const resultTemporal = document.getElementById('result-section-temporal');
    const shareTemporal = document.getElementById('share-section-temporal');
    const resultFinancial = document.getElementById('result-section-financial');
    const shareFinancial = document.getElementById('share-section-financial');

    // On cache tout d'abord
    if (resultTemporal) resultTemporal.classList.add('hidden');
    if (shareTemporal) shareTemporal.classList.add('hidden');
    if (resultFinancial) resultFinancial.classList.add('hidden');
    if (shareFinancial) shareFinancial.classList.add('hidden');

    // On réaffiche seulement ce qui est pertinent et contient des données
    if (activeMode === 'temporal' && state.storedTemporalResult) {
        if (resultTemporal) resultTemporal.classList.remove('hidden');
        if (shareTemporal) shareTemporal.classList.remove('hidden');
    } else if (activeMode === 'financial' && state.storedFinancialResult) {
        if (resultFinancial) resultFinancial.classList.remove('hidden');
        if (shareFinancial) shareFinancial.classList.remove('hidden');
    }
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
    state.currentExampleLabel = '';
}
