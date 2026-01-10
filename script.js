// Variables pour suivre si un calcul a déjà été effectué pour chaque mode
let hasCalculatedTemporal = false;
let hasCalculatedFinancial = false;

// Variables pour stocker les résultats de chaque mode
let storedTemporalResult = '';
let storedFinancialResult = '';
let storedFinancialComparisonResult = '';

// Variable pour suivre si on est en train de calculer
let isCalculating = false;

// Variable pour suivre le mode actif
let currentActiveMode = 'temporal'; // 'temporal' ou 'financial'

// Variable pour stocker l'événement d'installation différée
let deferredPrompt;

// Enregistrement du service worker pour la PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                console.log('ServiceWorker enregistré avec succès:', registration.scope);

                // Vérifier si l'événement beforeinstallprompt est disponible
                window.addEventListener('beforeinstallprompt', (event) => {
                    console.log('Événement beforeinstallprompt déclenché');
                    // Empêche l'invite par défaut
                    event.preventDefault();
                    // Stocke l'événement pour une utilisation ultérieure
                    deferredPrompt = event;

                    // Afficher le bouton d'installation
                    const installBtn = document.getElementById('install-btn');
                    if (installBtn) {
                        installBtn.style.display = 'flex';
                    }
                });
            })
            .catch(function(error) {
                console.log('Échec de l\'enregistrement du ServiceWorker:', error);
            });
    });

    // Gestion de l'état de connexion
    window.addEventListener('online', function() {
        console.log('Connexion réseau rétablie');
        hideOfflineIndicator();
    });

    window.addEventListener('offline', function() {
        console.log('Mode hors ligne activé');
        showOfflineIndicator();
    });
}

// Fonction pour afficher un indicateur de mode hors ligne
function showOfflineIndicator() {
    // Créer un indicateur visuel pour informer l'utilisateur
    let offlineBanner = document.getElementById('offline-banner');
    if (!offlineBanner) {
        offlineBanner = document.createElement('div');
        offlineBanner.id = 'offline-banner';
        offlineBanner.style.position = 'fixed';
        offlineBanner.style.top = '0';
        offlineBanner.style.left = '0';
        offlineBanner.style.right = '0';
        offlineBanner.style.backgroundColor = '#ff6b6b';
        offlineBanner.style.color = 'white';
        offlineBanner.style.textAlign = 'center';
        offlineBanner.style.padding = '8px';
        offlineBanner.style.zIndex = '10000';
        offlineBanner.style.fontWeight = 'bold';
        offlineBanner.style.fontSize = '14px';
        offlineBanner.innerHTML = 'Mode hors ligne - L\'application est entièrement fonctionnelle';

        document.body.appendChild(offlineBanner);
    } else {
        offlineBanner.style.display = 'block';
    }
}

// Fonction pour cacher l'indicateur de mode hors ligne
function hideOfflineIndicator() {
    const offlineBanner = document.getElementById('offline-banner');
    if (offlineBanner) {
        offlineBanner.style.display = 'none';
    }
}

// Fonction pour afficher une notification que l'application est disponible hors ligne
function showOfflineNotification() {
    // Petite notification discrète pour informer l'utilisateur
    console.log('Application disponible hors ligne');
}

// Fonction pour afficher/masquer la section méthodologie
function toggleMethodology() {
    const methodologySection = document.getElementById('methodology-section');
    const toggleButton = document.getElementById('toggle-methodology');
    const toggleText = document.getElementById('methodology-toggle-text');

    if (methodologySection.classList.contains('hidden')) {
        methodologySection.classList.remove('hidden');
        toggleText.textContent = 'Masquer la méthodologie';
        toggleButton.innerHTML = '<i class="fas fa-book-open"></i> <span id="methodology-toggle-text">Masquer la méthodologie</span>';
    } else {
        methodologySection.classList.add('hidden');
        toggleText.textContent = 'Voir la méthodologie';
        toggleButton.innerHTML = '<i class="fas fa-book-open"></i> <span id="methodology-toggle-text">Voir la méthodologie</span>';
    }
}

// Fonction pour déclencher l'invite d'installation
function promptInstall() {
    if (deferredPrompt) {
        // Affiche l'invite d'installation
        deferredPrompt.prompt();

        // Attend la réponse de l'utilisateur
        deferredPrompt.userChoice.then((choiceResult) => {
            console.log('Choix de l\'utilisateur:', choiceResult.outcome);

            // Indépendamment du choix, on masque le bouton
            const installBtn = document.getElementById('install-btn');
            if (installBtn) {
                installBtn.style.display = 'none';
            }

            // Réinitialise l'événement différé
            deferredPrompt = null;
        });
    }
}

// Tableau des exemples de valeurs célèbres
const examples = [
    { value: 1500000000, label: "1,5Mds € - Budget annuel de l'UNESCO" },
    { value: 40000000, label: "40M € - Salaire annuel de Kylian Mbappé" },
    { value: 1000000000, label: "1Mds € - Dons à la Fondation Gates" },
    { value: 150000000, label: "150M € - Prix d'une œuvre de Basquiat" },
    { value: 500000000, label: "500M € - Valeur d'une entreprise moyenne du CAC 40" },
    { value: 2500000000, label: "2,5Mds € - Prix d'une villa à Monaco" },
    { value: 80000000, label: "80M € - Salaire annuel d'un PDG du CAC 40" },
    { value: 3000000000, label: "3Mds € - Coût d'un avion présidentiel" },
    { value: 60000000, label: "60M € - Prix d'un yacht de luxe" },
    { value: 237000000, label: "237M € - Budget d'Avatar (2009)" },
    { value: 59946338573, label: "59,9Mds € - Budget du ministère des Armées 2025" },
    { value: 88642000013, label: "88,6Mds € - Budget de l'Éducation nationale 2025" },
    { value: 25257945836, label: "25,3Mds € - Budget de la sécurité intérieure 2025" },
    { value: 15000000000, label: "15Mds € - Tunnel sous la Manche" },
    { value: 30000000000, label: "30Mds € - Projet Manhattan" },
    { value: 100000000000, label: "100Mds € - Plan Mésmer" },
    { value: 280000000000, label: "280Mds € - Programme Apollo" },
    { value: 13000000000, label: "13Mds € - Grand collisionneur de hadrons" },
    { value: 150000000000, label: "150Mds € - Station spatiale internationale" },
    { value: 25000000000, label: "25Mds € - Projet ITER" },
    { value: 12000000000, label: "12Mds € - Tunnel de base du Gothard" },
    { value: 4000000000, label: "4Mds € - Grand canal de Suez" },
    { value: 5800000000, label: "5,8Mds € - Canal de Panama" },
    { value: 100000000, label: "100M € - Canal du Midi" },
    { value: 32000000000, label: "32Mds € - Centrale de Hinkley Point C" },
    { value: 21704135923, label: "21,7Mds € - Budget de la transition écologique 2025" },
    { value: 12682852196, label: "12,7Mds € - Budget de la justice 2025" },
    { value: 10000000, label: "10M € - Tour Eiffel" },
    { value: 100000000, label: "100M € - Mont-Saint-Michel" },
    { value: 5000000, label: "5M € - Arc de Triomphe" },
    { value: 15000000, label: "15M € - Opéra Garnier" },
    { value: 100000000, label: "100M € - Château de Versailles" },
    { value: 2000000000, label: "2Mds € - Centre Pompidou" },
    { value: 2500000000, label: "2,5Mds € - Grande Arche de La Défense" },
    { value: 1500000000, label: "1,5Mds € - Opéra Bastille" },
    { value: 150000000, label: "150M € - Pyramide du Louvre" },
    { value: 400000000, label: "400M € - Stade de France" },
    { value: 700000000, label: "700M € - Pont de Normandie" },
    { value: 400000000, label: "400M € - Pont de Millau" },
    { value: 50000000, label: "50M € - Jardin du Luxembourg" },
    { value: 3456994135, label: "3,5Mds € - Budget des affaires étrangères 2025" },
    { value: 3918028319, label: "3,9Mds € - Budget de la culture 2025" },
    { value: 20009645382, label: "20,0Mds € - Budget du travail et emploi 2025" },
    { value: 12000000000000, label: "12.000Mds € - Valeur totale de l'or dans le monde (210.000 tonnes à 60.000€/kg)" },
    { value: 1300000000000, label: "1.300Mds € - Valeur totale du Bitcoin en circulation (19,9M BTC à 65.000€/BTC)" },
    { value: 6600000000, label: "6,6Mds € - Coût des JO Paris 2024" },
    { value: 9000000000, label: "9,0Mds € - Coût d'un sous-marin nucléaire français (classe Suffren)" },
    { value: 24000000000, label: "24,0Mds € - Coût d'une centrale nucléaire EPR (comme Flamanville)" },
    { value: 10000000000, label: "10,0Mds € - Coût d'un porte-avions nucléaire nouvelle génération (PANG)" },
    { value: 100000000, label: "100M € - Coût d'une fusée Ariane 6 (lancement)" },
    { value: 250000000000, label: "250Mds € - Fortune de Bernard Arnault (2025)" },
    { value: 3000000000000, label: "3.000Mds € - Valeur boursière d'Apple (2025)" },
    { value: 3000000000000, label: "3.000Mds € - PIB annuel de la France (2025)" },
    { value: 15000000000000, label: "15.000Mds € - Coût économique global de la pandémie de COVID-19" },
    { value: 140000000000, label: "140Mds € - Coût de l'ouragan Katrina (2025 ajusté)" },
    { value: 190000000000, label: "190Mds € - Budget annuel de l'Union Européenne" }
];

// Fonction pour obtenir un exemple aléatoire
function getRandomExample() {
    const randomIndex = Math.floor(Math.random() * examples.length);
    return examples[randomIndex];
}

// Fonction pour définir une valeur d'exemple
function setExampleValue(value) {
    // Formater le prix avec des espaces insécables
    const formattedValue = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    document.getElementById('amount').value = formattedValue;
    // Déclencher le calcul automatiquement
    calculate();
}

// Fonction pour définir un exemple aléatoire
function setRandomExample() {
    const temporalInputs = document.getElementById('temporal-inputs');

    // Vérifier si on est en mode temporel
    if (temporalInputs.classList.contains('hidden')) {
        alert("Le bouton 'Exemple aléatoire' n'est disponible que dans le mode temporel.");
        return;
    }

    const randomExample = getRandomExample();
    // Formater le prix avec des espaces insécables
    const formattedValue = randomExample.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    document.getElementById('amount').value = formattedValue;

    // Formater le champ avec la fonction de formatage
    formatNumberInput(document.getElementById('amount'));

    // Mettre à jour l'affichage de l'exemple actuel
    const currentExampleElement = document.getElementById('current-example');

    // Afficher la zone d'exemple avec l'information
    currentExampleElement.textContent = randomExample.label;
    currentExampleElement.style.display = 'block'; // Afficher la zone
    // Appliquer un effet de fondu pour montrer l'élément
    currentExampleElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    currentExampleElement.style.opacity = '1';
    currentExampleElement.style.transform = 'translateY(0)';

    // Changer le texte du bouton pour "Tester un autre exemple"
    const exampleButtonText = document.getElementById('example-button-text');
    if (exampleButtonText) {
        exampleButtonText.textContent = 'Tester un autre exemple';
    }

    // Déclencher le calcul automatiquement
    calculate();
}

// Fonction pour réinitialiser le formulaire
function resetForm() {
    // Réinitialiser le champ de saisie
    document.getElementById('amount').value = '';

    // Réinitialiser l'affichage de l'exemple
    const currentExampleElement = document.getElementById('current-example');
    currentExampleElement.textContent = '';

    // Appliquer le même effet de fondu que pour handleInput()
    currentExampleElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    currentExampleElement.style.opacity = '0';
    currentExampleElement.style.transform = 'translateY(-10px)';

    // Après l'animation, masquer complètement l'élément
    setTimeout(() => {
        currentExampleElement.style.display = 'none';
    }, 300);

    // Masquer les sections de résultat pour les deux modes
    document.getElementById('result-section-temporal').classList.add('hidden');
    document.getElementById('share-section-temporal').classList.add('hidden');
    document.getElementById('result-section-financial').classList.add('hidden');
    document.getElementById('share-section-financial').classList.add('hidden');

    // Réinitialiser les textes de résultat pour les deux modes
    document.getElementById('result-text-temporal').textContent = '';
    document.getElementById('result-text-financial').textContent = '';
    document.getElementById('comparison-result-text-financial').textContent = '';
    document.getElementById('comparison-result-financial').classList.add('hidden');

    // Réinitialiser les résultats stockés
    storedTemporalResult = '';
    storedFinancialResult = '';
    storedFinancialComparisonResult = '';

    // Remettre le texte initial du bouton d'exemple
    const exampleButtonText = document.getElementById('example-button-text');
    if (exampleButtonText) {
        exampleButtonText.textContent = 'Charger un exemple';
    }

    // Le bouton de copie est dans la section résultat, donc il est masqué avec la section
    // Pas besoin de le masquer séparément
}

// Fonction pour basculer entre les modes
function switchMode(mode) {
    // Indiquer qu'on est en train de changer de mode
    isCalculating = true;

    const temporalInputs = document.getElementById('temporal-inputs');
    const financialInputs = document.getElementById('financial-inputs');
    const temporalModeBtn = document.getElementById('temporal-mode-btn');
    const financialModeBtn = document.getElementById('financial-mode-btn');

    if (mode === 'temporal') {
        // Activer le mode temporel
        temporalInputs.classList.remove('hidden');
        financialInputs.classList.add('hidden');

        // Mettre à jour l'apparence des boutons
        temporalModeBtn.classList.add('bg-white', 'dark:bg-dark-800', 'shadow', 'text-gray-800', 'dark:text-gray-200');
        financialModeBtn.classList.remove('bg-white', 'dark:bg-dark-800', 'shadow', 'text-gray-800', 'dark:text-gray-200');
        temporalModeBtn.classList.remove('bg-gray-200', 'dark:bg-dark-700');
        financialModeBtn.classList.add('bg-gray-200', 'dark:bg-dark-700');

        // Réinitialiser complètement les variables du mode financier
        storedFinancialResult = '';
        storedFinancialComparisonResult = '';

        // Toujours masquer les sections du mode financier lors du passage au mode temporel
        document.getElementById('result-section-financial').classList.add('hidden');
        document.getElementById('share-section-financial').classList.add('hidden');

        // Toujours s'assurer que les sections du mode temporel sont prêtes
        // mais ne pas les afficher si aucun résultat n'est stocké
        if (storedTemporalResult !== '') {
            document.getElementById('result-text-temporal').textContent = storedTemporalResult;
            document.getElementById('result-section-temporal').classList.remove('hidden');
            document.getElementById('share-section-temporal').classList.remove('hidden');
            // Cacher le conteneur de comparaison dans le mode temporel
            document.getElementById('comparison-result-temporal').classList.add('hidden');
        } else {
            // Préparer les sections pour un futur affichage
            // mais les garder cachées jusqu'à ce qu'un calcul soit effectué
            document.getElementById('result-section-temporal').classList.add('hidden');
            document.getElementById('share-section-temporal').classList.add('hidden');
        }
    } else if (mode === 'financial') {
        // Activer le mode financier
        temporalInputs.classList.add('hidden');
        financialInputs.classList.remove('hidden');

        // Mettre à jour l'apparence des boutons
        financialModeBtn.classList.add('bg-white', 'dark:bg-dark-800', 'shadow', 'text-gray-800', 'dark:text-gray-200');
        temporalModeBtn.classList.remove('bg-white', 'dark:bg-dark-800', 'shadow', 'text-gray-800', 'dark:text-gray-200');
        financialModeBtn.classList.remove('bg-gray-200', 'dark:bg-dark-700');
        temporalModeBtn.classList.add('bg-gray-200', 'dark:bg-dark-700');

        // Ne pas réinitialiser les variables du mode temporel - les conserver
        // pour permettre de revenir au mode temporel avec les résultats intacts
        // storedTemporalResult = ''; // Commenté pour conserver les résultats

        // Toujours masquer les sections du mode temporel lors du passage au mode financier
        document.getElementById('result-section-temporal').classList.add('hidden');
        document.getElementById('share-section-temporal').classList.add('hidden');

        // Restaurer les résultats du mode financier s'ils ont été stockés
        if (storedFinancialResult !== '' || storedFinancialComparisonResult !== '') {
            document.getElementById('result-text-financial').innerHTML = storedFinancialResult;
            document.getElementById('comparison-result-text-financial').innerHTML = storedFinancialComparisonResult;
            document.getElementById('result-section-financial').classList.remove('hidden');
            // Afficher le conteneur de comparaison seulement s'il y a du contenu
            if (storedFinancialComparisonResult !== '') {
                document.getElementById('comparison-result-financial').classList.remove('hidden');
            } else {
                document.getElementById('comparison-result-financial').classList.add('hidden');
            }
            document.getElementById('share-section-financial').classList.remove('hidden');
        } else {
            // Sinon, masquer les sections si aucun résultat n'est stocké
            document.getElementById('result-section-financial').classList.add('hidden');
            document.getElementById('share-section-financial').classList.add('hidden');
        }
    }

    // Mettre à jour le mode actif
    currentActiveMode = mode;

    // Réinitialiser la variable isCalculating après un court délai
    setTimeout(() => {
        isCalculating = false;
    }, 50);
}

// Fonction pour mettre à jour le prix en fonction de l'objet sélectionné
function updateObjectPrice() {
    const objectTypeSelect = document.getElementById('object-type');
    const objectPriceInput = document.getElementById('object-price');
    const customObjectInput = document.getElementById('custom-object-input');
    const objectNameInput = document.getElementById('object-name');

    const selectedOption = objectTypeSelect.options[objectTypeSelect.selectedIndex];
    const price = selectedOption.getAttribute('data-price');

    if (selectedOption.value === 'autre') {
        // Mode personnalisé
        objectPriceInput.value = '';
        objectNameInput.value = '';
        customObjectInput.classList.remove('hidden');
        objectPriceInput.disabled = false;
    } else if (selectedOption.value === '') {
        // Aucune sélection
        objectPriceInput.value = '';
        objectNameInput.value = '';
        customObjectInput.classList.add('hidden');
        objectPriceInput.disabled = false;
    } else {
        // Objet prédéfini
        // Formater le prix avec des espaces insécables
        const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
        objectPriceInput.value = formattedPrice;
        objectNameInput.value = selectedOption.text.split(' (')[0]; // Extraire le nom de l'objet
        customObjectInput.classList.add('hidden');
        objectPriceInput.disabled = true; // Désactiver le champ car le prix est prédéfini
    }
}

// Fonction pour calculer l'équivalent retraites
function calculate() {
    // Message d'alerte temporaire pour le débogage
    alert("Fonction calculate() appelée");
    
    // Vérifier si on est en mode temporel
    const temporalInputs = document.getElementById('temporal-inputs');

    if (temporalInputs.classList.contains('hidden')) {
        // Si on n'est pas en mode temporel, ne pas faire de calcul
        alert("Nous ne sommes pas en mode temporel. La fonction est ignorée.");
        return;
    }

    // Récupérer la valeur brute du champ
    const rawValue = document.getElementById('amount').value;

    // Si le champ est vide, afficher un message approprié
    if (rawValue.trim() === '') {
        alert("Veuillez entrer un montant.");
        return;
    }

    // Extraire le nombre de la valeur du champ
    const amount = extractNumber(rawValue);

    if (isNaN(amount) || amount < 0) {
        alert("Veuillez entrer un montant valide.");
        return;
    }

    // Montant total des retraites versées en France en 2025
    const totalRetraites = 420e9; // 420 milliards d'euros

    // Calcul du ratio
    const ratio = amount / totalRetraites;

    // Nombre de secondes dans une année (en prenant en compte les années bissextiles)
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

    // Calcul des mois (moyenne de 30.44 jours par mois : 365.25/12)
    const daysInMonth = 365.25 / 12; // ≈ 30.44 jours
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

    // Formatage du résultat sur une seule ligne (sans virgules, affichage uniquement des valeurs > 0, avec accord au singulier/pluriel)
    const resultParts = [];
    if (years > 0) resultParts.push(`${years} ${years === 1 ? 'année' : 'années'}`);
    if (months > 0) resultParts.push(`${months} ${months === 1 ? 'mois' : 'mois'}`); // 'mois' est invariable
    if (days > 0) resultParts.push(`${days} ${days === 1 ? 'jour' : 'jours'}`);
    if (hours > 0) resultParts.push(`${hours} ${hours === 1 ? 'heure' : 'heures'}`);
    if (minutes > 0) resultParts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    if (seconds > 0) resultParts.push(`${seconds} ${seconds === 1 ? 'seconde' : 'secondes'}`);

    const resultText = resultParts.length > 0 ? resultParts.join(' ') : '0 seconde';

    // Affichage du résultat (temps uniquement)
    const resultElement = document.getElementById('result-text-temporal');
    if (resultElement) {
        resultElement.textContent = resultText;
        console.log("Résultat temporel défini:", resultText);
    } else {
        alert("Erreur: L'élément result-text-temporal n'a pas été trouvé !");
        return;
    }

    // Stocker le résultat pour le conserver lors du changement de mode
    storedTemporalResult = resultText;
    console.log("Résultat temporel stocké:", storedTemporalResult);

    // Cacher la section de comparaison
    const comparisonSection = document.getElementById('comparison-result-temporal');
    if(comparisonSection) comparisonSection.classList.add('hidden');

    // Afficher les sections de résultat et de partage pour le mode temporel
    const resultSection = document.getElementById('result-section-temporal');
    const shareSection = document.getElementById('share-section-temporal');

    console.log("Section résultat temporel avant:", resultSection ? resultSection.classList : 'non trouvée');
    if (resultSection) {
        resultSection.classList.remove('hidden');
        console.log("Section résultat temporel après:", resultSection.classList);
    }

    console.log("Section partage temporel avant:", shareSection ? shareSection.classList : 'non trouvée');
    if (shareSection) {
        shareSection.classList.remove('hidden');
        console.log("Section partage temporel après:", shareSection.classList);
    }

    // S'assurer que les sections du mode financier sont cachées
    const financialResultSection = document.getElementById('result-section-financial');
    const financialShareSection = document.getElementById('share-section-financial');
    if(financialResultSection) {
        financialResultSection.classList.add('hidden');
    }
    if(financialShareSection) {
        financialShareSection.classList.add('hidden');
    }

    // Ajouter une animation au résultat
    if (resultElement) {
        resultElement.classList.add('counter-animation');
        setTimeout(() => {
            resultElement.classList.remove('counter-animation');
        }, 1000);
    }

    // Faire défiler vers la section de résultat
    if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Fonction contenant la logique de calcul
function calculateLogic() {
    // Indiquer qu'on est en train de calculer
    isCalculating = true;

    // Vérifier que nous sommes bien en mode temporel
    const temporalInputs = document.getElementById('temporal-inputs');
    if (temporalInputs.classList.contains('hidden')) {
        // Si nous ne sommes pas en mode temporel, ne pas continuer
        console.error("Erreur: calculateLogic() appelé alors que nous ne sommes pas en mode temporel");
        isCalculating = false;
        return;
    }

    // Récupérer la valeur brute du champ
    const rawValue = document.getElementById('amount').value;

    // Si le champ est vide, afficher un message approprié
    if (rawValue.trim() === '') {
        alert("Veuillez entrer un montant.");
        isCalculating = false;
        return;
    }

    // Extraire le nombre de la valeur du champ
    const amount = extractNumber(rawValue);

    if (isNaN(amount) || amount < 0) {
        alert("Veuillez entrer un montant valide.");
        isCalculating = false;
        return;
    }

    // Montant total des retraites versées en France en 2025
    const totalRetraites = 420e9; // 420 milliards d'euros

    // Calcul du ratio
    const ratio = amount / totalRetraites;

    // Nombre de secondes dans une année (en prenant en compte les années bissextiles)
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

    // Calcul des mois (moyenne de 30.44 jours par mois : 365.25/12)
    const daysInMonth = 365.25 / 12; // ≈ 30.44 jours
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

    // Formatage du résultat sur une seule ligne (sans virgules, affichage uniquement des valeurs > 0, avec accord au singulier/pluriel)
    const resultParts = [];
    if (years > 0) resultParts.push(`${years} ${years === 1 ? 'année' : 'années'}`);
    if (months > 0) resultParts.push(`${months} ${months === 1 ? 'mois' : 'mois'}`); // 'mois' est invariable
    if (days > 0) resultParts.push(`${days} ${days === 1 ? 'jour' : 'jours'}`);
    if (hours > 0) resultParts.push(`${hours} ${hours === 1 ? 'heure' : 'heures'}`);
    if (minutes > 0) resultParts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    if (seconds > 0) resultParts.push(`${seconds} ${seconds === 1 ? 'seconde' : 'secondes'}`);

    const resultText = resultParts.length > 0 ? resultParts.join(' ') : '0 seconde';

    // Affichage du résultat (temps uniquement)
    const resultElement = document.getElementById('result-text-temporal');
    if (resultElement) {
        resultElement.textContent = resultText;
        console.log("Résultat temporel défini:", resultText);
    } else {
        alert("Erreur: L'élément result-text-temporal n'a pas été trouvé !");
        isCalculating = false;
        return;
    }

    // Stocker le résultat pour le conserver lors du changement de mode
    storedTemporalResult = resultText;
    console.log("Résultat temporel stocké:", storedTemporalResult);

    // Ne pas effacer les résultats du mode financier - les conserver
    // storedFinancialResult = '';
    // storedFinancialComparisonResult = '';

    // Cacher la section de comparaison
    const comparisonSection = document.getElementById('comparison-result-temporal');
    if(comparisonSection) comparisonSection.classList.add('hidden');

    // Afficher les sections de résultat et de partage pour le mode temporel
    const resultSection = document.getElementById('result-section-temporal');
    const shareSection = document.getElementById('share-section-temporal');

    console.log("Section résultat temporel avant:", resultSection ? resultSection.classList : 'non trouvée');
    if (resultSection) {
        resultSection.classList.remove('hidden');
        console.log("Section résultat temporel après:", resultSection.classList);
    }

    console.log("Section partage temporel avant:", shareSection ? shareSection.classList : 'non trouvée');
    if (shareSection) {
        shareSection.classList.remove('hidden');
        console.log("Section partage temporel après:", shareSection.classList);
    }

    // S'assurer que les sections du mode financier sont cachées
    const financialResultSection = document.getElementById('result-section-financial');
    const financialShareSection = document.getElementById('share-section-financial');
    if(financialResultSection) {
        financialResultSection.classList.add('hidden');
    }
    if(financialShareSection) {
        financialShareSection.classList.add('hidden');
    }

    // Ajouter une animation au résultat
    if (resultElement) {
        resultElement.classList.add('counter-animation');
        setTimeout(() => {
            resultElement.classList.remove('counter-animation');
        }, 1000);
    }

    // Faire défiler vers la section de résultat
    if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Terminer le calcul
    isCalculating = false;
}

// Fonction pour calculer l'équivalent retraites
function calculate() {
    // Vérifier si on est en mode temporel
    const temporalInputs = document.getElementById('temporal-inputs');

    if (temporalInputs.classList.contains('hidden')) {
        // Si on n'est pas en mode temporel, ne pas faire de calcul
        // Cela peut arriver si le bouton est appelé depuis le mode financier
        console.log("La fonction calculate() a été appelée alors que nous ne sommes pas en mode temporel. Ignoré.");
        return;
    }

    // Si on est en mode temporel, exécuter directement la logique de calcul
    calculateLogic();
}

// Fonction pour calculer la comparaison
function calculateComparison() {
    const objectTypeSelect = document.getElementById('object-type');
    const selectedOption = objectTypeSelect.options[objectTypeSelect.selectedIndex];
    let objectName = '';

    if (selectedOption.value === 'autre' || selectedOption.value === '') {
        objectName = document.getElementById('object-name').value || 'objet';
    } else {
        let originalName = selectedOption.text.split(' (')[0];
        // Extraire le premier mot pour vérifier sa casse
        let firstWord = originalName.split(' ')[0];
        // Vérifier si le premier mot est entièrement en majuscules
        if (firstWord === firstWord.toUpperCase() && firstWord.length > 1) {
            objectName = originalName; // Garder l'original si le premier mot est en majuscules
        } else {
            objectName = originalName.charAt(0).toLowerCase() + originalName.slice(1); // Première lettre en minuscule
        }
    }

    // Récupérer la valeur brute du champ
    const rawPriceValue = document.getElementById('object-price').value;

    // Si le champ est vide, afficher un message approprié
    if (rawPriceValue.trim() === '') {
        alert("Veuillez entrer un prix pour l'objet.");
        return;
    }

    // Extraire le nombre de la valeur du champ
    const objectPrice = extractNumber(rawPriceValue);
    const timePeriodValue = document.getElementById('time-period').value;

    if (isNaN(objectPrice) || objectPrice <= 0) {
        alert("Veuillez entrer un prix valide pour l'objet.");
        return;
    }

    let periodMultiplier;
    if (timePeriodValue === 'custom') {
        // Récupérer la valeur brute du champ
        const rawPeriodValue = document.getElementById('custom-period').value;

        // Si le champ est vide, afficher un message approprié
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

    // Calcul du montant équivalent pour la période donnée
    // 420 milliards d'euros par an de retraites
    const annualRetirementAmount = 420e9; // 420 milliards
    const periodAmount = annualRetirementAmount * periodMultiplier;

    // Calcul du nombre d'objets pouvant être achetés
    const numberOfObjects = periodAmount / objectPrice;

    // Formatage du résultat
    let formattedNumber;
    if (numberOfObjects >= 1e6) {
        formattedNumber = (numberOfObjects / 1e6).toFixed(1).replace('.', ',');
        // Enlever le .0 ou ,0 à la fin
        if (formattedNumber.endsWith(',0')) {
            formattedNumber = formattedNumber.slice(0, -2);
        }
        formattedNumber += ' millions';
    } else if (numberOfObjects >= 1e3) {
        formattedNumber = (numberOfObjects / 1e3).toFixed(1).replace('.', ',');
        // Enlever le .0 ou ,0 à la fin
        if (formattedNumber.endsWith(',0')) {
            formattedNumber = formattedNumber.slice(0, -2);
        }
        formattedNumber += ' milliers';
    } else if (numberOfObjects >= 1) {
        if (numberOfObjects % 1 !== 0) {
            formattedNumber = numberOfObjects.toFixed(1).replace('.', ',');
            // Enlever le .0 ou ,0 à la fin
            if (formattedNumber.endsWith(',0')) {
                formattedNumber = formattedNumber.slice(0, -2);
            }
        } else {
            formattedNumber = Math.floor(numberOfObjects).toLocaleString();
        }
    } else {
        formattedNumber = numberOfObjects.toFixed(1).replace('.', ',');
        // Enlever le .0 ou ,0 à la fin
        if (formattedNumber.endsWith(',0')) {
            formattedNumber = formattedNumber.slice(0, -2);
        }
    }

    // Affichage du résultat principal
    const mainResultText = document.getElementById('result-text-financial');
    // Afficher le résultat de comparaison dans le champ principal
    const periodText = getPeriodText(periodMultiplier);
    mainResultText.innerHTML = 'Avec <strong>' + periodText + '</strong> de retraites (soit environ <strong>' + formatCurrency(periodAmount) + '</strong>), on peut avoir <strong>' + formattedNumber + ' ' + objectName + (numberOfObjects > 1 || numberOfObjects === 0 ? 's' : '') + '</strong> coûtant <strong>' + formatCurrency(objectPrice) + '</strong> chacun.';

    // Le champ de comparaison reste vide dans ce mode
    const comparisonResultText = document.getElementById('comparison-result-text-financial');
    comparisonResultText.innerHTML = '';

    // S'assurer que les résultats du mode temporel sont effacés pour éviter les interférences
    storedTemporalResult = '';

    // Stocker les résultats pour les conserver lors du changement de mode
    storedFinancialResult = mainResultText.innerHTML;
    storedFinancialComparisonResult = comparisonResultText.innerHTML;

    // Afficher les sections du mode financier
    document.getElementById('result-section-financial').classList.remove('hidden');
    document.getElementById('comparison-result-financial').classList.add('hidden'); // On cache le champ de comparaison vide
    document.getElementById('share-section-financial').classList.remove('hidden');

    // Masquer les sections du mode temporel
    document.getElementById('result-section-temporal').classList.add('hidden');
    document.getElementById('share-section-temporal').classList.add('hidden');

    // Indiquer qu'on est en train de calculer
    isCalculating = true;

    // Ajouter une animation au résultat
    mainResultText.classList.add('counter-animation');
    setTimeout(() => {
        mainResultText.classList.remove('counter-animation');
    }, 1000);

    // S'assurer qu'on est en mode financier
    currentActiveMode = 'financial';

    // Terminer le calcul
    isCalculating = false;
}

// Fonction pour obtenir le texte de la période
function getPeriodText(multiplier) {
    if (multiplier === 1) return "1 an";
    if (multiplier === 0.5) return "6 mois";
    if (multiplier === 0.25) return "3 mois";
    if (multiplier === 0.1) return "1 mois";
    if (Math.abs(multiplier - 0.033) < 0.001) return "10 jours";
    if (Math.abs(multiplier - 0.01) < 0.001) return "1 jour";

    // Pour les valeurs personnalisées
    const days = multiplier * 365.25;
    if (days >= 365) {
        const years = Math.floor(days / 365.25);
        return `${years} an${years > 1 ? 's' : ''}`;
    } else if (days >= 30) {
        const months = Math.floor(days / 30.44);
        return `${months} mois`;
    } else if (days >= 1) {
        const daysRounded = Math.floor(days);
        return `${daysRounded} jour${daysRounded > 1 ? 's' : ''}`;
    } else {
        const hours = Math.floor(days * 24);
        return `${hours} heure${hours > 1 ? 's' : ''}`;
    }
}

// Fonction pour formater les montants en euros
function formatCurrency(amount) {
    // Formater le montant en euros avec séparateurs de milliers
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Fonction pour gérer l'entrée de l'utilisateur
function handleInput() {
    const currentExampleElement = document.getElementById('current-example');

    // Appliquer un effet de fondu pour masquer l'exemple
    currentExampleElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    currentExampleElement.style.opacity = '0';
    currentExampleElement.style.transform = 'translateY(-10px)';

    // Après l'animation, masquer complètement l'élément
    setTimeout(() => {
        currentExampleElement.style.display = 'none';
    }, 300);
}

// Fonction pour formater les nombres avec des espaces insécables pour séparer les milliers
function formatNumberInput(input) {
    // Sauvegarder la position du curseur
    const start = input.selectionStart;
    const end = input.selectionEnd;

    // Récupérer la valeur actuelle et supprimer les espaces insécables pour le traitement
    let originalValue = input.value.replace(/\u00A0/g, '');

    // Si la valeur contient autre chose que des chiffres, un point ou une virgule, ne rien faire pour éviter les interférences
    if (!/^[0-9.,\b]*$/.test(originalValue)) {
        // Remettre la valeur précédente sans les caractères invalides
        originalValue = originalValue.replace(/[^\d.,]/g, '');
    }

    // Remplacer les virgules par des points pour le traitement
    originalValue = originalValue.replace(/,/g, '.');

    // Empêcher plus d'un point décimal
    const decimalPoints = originalValue.split('.');
    if (decimalPoints.length > 2) {
        originalValue = decimalPoints[0] + '.' + decimalPoints.slice(1).join('');
    }

    // Séparer la partie entière et la partie décimale
    const parts = originalValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] ? '.' + parts[1] : '';

    // Formater la partie entière avec des espaces insécables
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0'); // \u00A0 est l'espace insécable

    // Mettre à jour la valeur du champ
    const newValue = formattedInteger + decimalPart;

    // Only update if the value actually changed
    if (input.value !== newValue) {
        // Temporarily disable the event handler to prevent recursion
        const oldValue = input.value;
        input.value = newValue;

        // Calculate the new cursor position after formatting
        // Count how many spaces were added before the cursor position
        let newStart = start;
        let newEnd = end;

        // Count spaces in the integer part up to the cursor position
        if (start <= integerPart.length) {
            // Count how many spaces would be added before the cursor position
            // For digits from left to position 'start', count how many spaces would be inserted
            const digitsBeforeCursor = integerPart.substring(0, start);
            // Spaces are added from the right side of the number every 3 digits
            // So for a number like 1234567, spaces are added after 1, after 1234, etc.
            // In other words, spaces appear from the right every 3 digits: 1 234 567
            let spacesAdded = 0;
            for (let i = 0; i < digitsBeforeCursor.length; i++) {
                // Calculate how many digits remain to the right of this position
                const digitsToRight = integerPart.length - i;
                // A space is added if we're at a position where 3 divides the remaining digits to the right
                // But only if there are more digits to the left
                if ((digitsToRight % 3 === 0) && (digitsToRight < integerPart.length)) {
                    spacesAdded++;
                }
            }
            newStart = start + spacesAdded;
        } else {
            // Cursor is in decimal part, add all spaces from integer part
            // Total spaces in integer part = floor((total_digits - 1) / 3) if total_digits > 3
            const totalDigits = integerPart.length;
            const totalSpaces = totalDigits > 3 ? Math.floor((totalDigits - 1) / 3) : 0;
            newStart = start + totalSpaces;
        }

        // Same calculation for end position
        if (end <= integerPart.length) {
            let spacesAdded = 0;
            for (let i = 0; i < integerPart.substring(0, end).length; i++) {
                const digitsToRight = integerPart.length - i;
                if ((digitsToRight % 3 === 0) && (digitsToRight < integerPart.length)) {
                    spacesAdded++;
                }
            }
            newEnd = end + spacesAdded;
        } else {
            const totalDigits = integerPart.length;
            const totalSpaces = totalDigits > 3 ? Math.floor((totalDigits - 1) / 3) : 0;
            newEnd = end + totalSpaces;
        }

        // Ensure positions are within bounds
        newStart = Math.min(newStart, input.value.length);
        newEnd = Math.min(newEnd, input.value.length);

        // Restore selection
        input.setSelectionRange(newStart, newEnd);
    }
}

// Fonction pour extraire le nombre d'un champ formaté
function extractNumber(value) {
    // Convertir en chaîne au cas où ce serait un autre type
    value = String(value);

    // Remplacer les espaces insécables par des espaces normaux, puis supprimer tous les espaces
    value = value.replace(/\u00A0/g, ' ').replace(/\s/g, '');

    // Remplacer les virgules par des points
    value = value.replace(/,/g, '.');

    // Extraire le nombre
    const result = parseFloat(value);

    // Retourner NaN si la conversion échoue, sinon le nombre
    return isNaN(result) ? NaN : result;
}

// Fonction pour autoriser seulement les chiffres et la virgule dans les champs de saisie
function allowOnlyNumbersAndComma(input) {
    // Remplacer tout ce qui n'est pas un chiffre, un point, une virgule ou un espace insécable
    input.value = input.value.replace(/[^\d.,\u00A0]/g, '');
}

// Fonction pour formater un nombre avec des espaces insécables pour séparer les milliers
function formatNumberOnBlur(input) {
    // Récupérer la valeur et la convertir en nombre
    const numericValue = extractNumber(input.value);

    if (!isNaN(numericValue) && numericValue >= 0) {
        // Formater avec des espaces insécables pour séparer les milliers
        const formattedValue = numericValue.toLocaleString('fr-FR', {
            maximumFractionDigits: 10 // Permettre suffisamment de décimales si nécessaire
        }).replace(/\s/g, '\u00A0'); // Remplacer les espaces normaux par des espaces insécables

        input.value = formattedValue;
    }
}

// Mettre à jour l'icône du thème
function updateThemeIcon(isDark, isSystem) {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return; // S'assurer que l'élément existe

    if (isSystem) {
        // Icône avec une bordure pour indiquer le mode automatique
        if (isDark) {
            // Icône lune pour le mode sombre automatique (identique à la lune manuelle pour la cohérence)
            themeIcon.setAttribute('d', 'M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z');
        } else {
            // Icône soleil pour le mode clair automatique
            themeIcon.setAttribute('d', 'M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z');
        }
    } else {
        if (isDark) {
            // Icône lune pour le mode sombre manuel
            themeIcon.setAttribute('d', 'M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z');
        } else {
            // Icône soleil pour le mode clair manuel
            themeIcon.setAttribute('d', 'M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z');
        }
    }
}

// Gestion du thème clair/sombre
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');

    // Vérifier le thème préféré de l'utilisateur
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Charger le thème sauvegardé ou utiliser le thème par défaut du système
    const savedTheme = localStorage.getItem('theme');
    const savedThemePreference = localStorage.getItem('themePreference');

    // Fonction pour mettre à jour la couleur du thème
    function updateThemeColor(isDark) {
        const themeColorMeta = document.getElementById('theme-color');

        if (isDark) {
            themeColorMeta.setAttribute('content', '#1a1a23');
        } else {
            // Utiliser une couleur de fond claire pour le mode clair
            themeColorMeta.setAttribute('content', '#ffffff');
        }
    }

    // Fonction pour appliquer le thème
    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            updateThemeIcon(isDark, false); // isSystem = false car c'est un changement manuel
        } else {
            document.documentElement.classList.remove('dark');
            updateThemeIcon(isDark, false); // isSystem = false car c'est un changement manuel
        }
        updateThemeColor(isDark);
    }

    // Fonction pour basculer le thème
    function toggleTheme() {
        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        const newIsDark = !isCurrentlyDark;

        applyTheme(newIsDark);

        // Sauvegarder le choix de l'utilisateur
        localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
        localStorage.setItem('themePreference', 'manual');
    }

    // Fonction pour initialiser le thème
    function initializeTheme() {
        let isDark;
        let isSystemBased = true;

        // Si l'utilisateur a fait un choix manuel précédemment
        if (savedThemePreference === 'manual' && savedTheme !== null) {
            isDark = savedTheme === 'dark';
            isSystemBased = false;
        } else {
            // Sinon, utiliser les préférences système
            isDark = prefersDarkScheme.matches;
            localStorage.setItem('themePreference', 'system');
        }

        applyTheme(isDark);

        if (isSystemBased) {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }
    }

    // Appliquer le thème initial
    initializeTheme();

    // Écouter les changements de préférences système
    prefersDarkScheme.addEventListener('change', (e) => {
        // Si le mode est réglé sur automatique (système), appliquer le changement
        if (localStorage.getItem('themePreference') === 'system') {
            applyTheme(e.matches);
            localStorage.setItem('theme', e.matches ? 'dark' : 'light');
        } else {
            // En mode manuel, on peut décider de revenir au mode automatique si la préférence système change
            // Cela permet de résoudre le cas où l'utilisateur est en mode manuel mais avec un thème opposé au système
            // et que la préférence système change, ce qui devrait déclencher un retour au mode automatique

            // Vérifier si le thème actuel est opposé à la nouvelle préférence système
            const isCurrentlyDark = document.documentElement.classList.contains('dark');
            if (isCurrentlyDark !== e.matches) {
                // Le thème actuel est opposé à la nouvelle préférence système
                // On peut demander à l'utilisateur s'il veut revenir au mode automatique
                // Pour simplifier, on va automatiquement passer en mode système dans ce cas
                localStorage.setItem('themePreference', 'system');

                // Appliquer le nouveau thème système
                applyTheme(e.matches);
                localStorage.setItem('theme', e.matches ? 'dark' : 'light');

                // Mettre à jour l'icône pour indiquer le mode automatique
                updateThemeIcon(e.matches, true);
            }
        }
    });

    // Fonction pour basculer entre le mode manuel et automatique
    function toggleThemeSystem() {
        const currentPreference = localStorage.getItem('themePreference');

        if (currentPreference === 'manual') {
            // Passer en mode automatique (système)
            localStorage.setItem('themePreference', 'system');

            // Appliquer immédiatement le thème système
            const isDark = prefersDarkScheme.matches;
            applyTheme(isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            // Mettre à jour l'icône pour indiquer le mode automatique
            updateThemeIcon(isDark, true);
        } else {
            // Passer en mode manuel - basculer le thème actuel
            const isCurrentlyDark = document.documentElement.classList.contains('dark');
            const newIsDark = !isCurrentlyDark;

            applyTheme(newIsDark);

            // Sauvegarder le choix de l'utilisateur
            localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
            localStorage.setItem('themePreference', 'manual');

            // Mettre à jour l'icône pour indiquer le mode manuel
            updateThemeIcon(newIsDark, false);
        }
    }

    // Gestion du clic sur le bouton de thème
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleThemeSystem);
    }
});

// Fonction pour copier le résultat dans le presse-papiers
function copyResult(mode = 'temporal') {
    let resultText;
    let copyBtn;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
        copyBtn = document.getElementById('copy-btn-temporal');
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
        // Définir le bouton de copie pour le mode financier
        copyBtn = document.getElementById('copy-btn-financial');
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à copier. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Copier uniquement le résultat (fonction du bouton dans la section de résultat)
    // Pour le mode temporel, on copie le texte complet avec le montant en euros
    // Pour le mode financier, on copie le résultat tel quel
    navigator.clipboard.writeText(resultText).then(function() {
        // Afficher un message de confirmation temporaire
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '✓ Copié!';

        setTimeout(function() {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(function(err) {
        console.error('Erreur lors de la copie: ', err);
        alert('Erreur lors de la copie: ' + err);
    });
}

// Fonction pour partager sur WhatsApp
function shareOnWhatsApp(mode = 'temporal') {
    let resultText;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à partager. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Pour le mode temporel, reformuler le message pour qu'il soit plus attrayant
    let message;
    if (mode === 'temporal') {
        // Récupérer le montant saisi pour le message de partage
        const amountValue = parseFloat(document.getElementById('amount').value);
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        message = `😱 Incroyable perspective ! ${formattedAmount} représentent ${resultText} de retraites versées en France`;
    } else {
        message = `😱 Incroyable perspective ! Découvrez combien de temps représente ce montant en retraites versées en France : ${resultText}`;
    }

    message += `\n\n👉 Calculez votre propre équivalent sur ${window.location.href}`;

    // Sur mobile, utiliser l'URL directe de WhatsApp
    if (!isDesktop()) {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    } else {
        // Sur ordinateur, utiliser l'URL de WhatsApp Web
        const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappWebUrl, '_blank');
    }
}

// Fonction pour partager sur X (Twitter)
function shareOnTwitter(mode = 'temporal') {
    let resultText;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à partager. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Pour le mode temporel, reformuler le message pour qu'il soit plus attrayant
    let message;
    if (mode === 'temporal') {
        // Récupérer le montant saisi pour le message de partage
        const amountValue = parseFloat(document.getElementById('amount').value);
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        message = `😱 Incroyable perspective ! ${formattedAmount} représentent ${resultText} de retraites versées en France`;
    } else {
        message = `😱 Incroyable perspective ! Découvrez combien de temps représente ce montant en retraites versées en France : ${resultText}`;
    }

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(twitterUrl, '_blank');
}

// Fonction pour partager sur Facebook
function shareOnFacebook(mode = 'temporal') {
    let resultText;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à partager. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Pour le mode temporel, reformuler le message pour qu'il soit plus attrayant
    let message;
    if (mode === 'temporal') {
        // Récupérer le montant saisi pour le message de partage
        const amountValue = parseFloat(document.getElementById('amount').value);
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        message = `😱 Incroyable perspective ! ${formattedAmount} représentent ${resultText} de retraites versées en France`;
    } else {
        message = `😱 Incroyable perspective ! Découvrez combien de temps représente ce montant en retraites versées en France : ${resultText}`;
    }

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`;
    window.open(facebookUrl, '_blank');
}

// Fonction pour partager sur LinkedIn
function shareOnLinkedIn(mode = 'temporal') {
    let resultText;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à partager. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Pour le mode temporel, reformuler le message pour qu'il soit plus attrayant
    let message;
    if (mode === 'temporal') {
        // Récupérer le montant saisi pour le message de partage
        const amountValue = parseFloat(document.getElementById('amount').value);
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        message = `😱 Incroyable perspective ! ${formattedAmount} représentent ${resultText} de retraites versées en France`;
    } else {
        message = `😱 Incroyable perspective ! Découvrez combien de temps représente ce montant en retraites versées en France : ${resultText}`;
    }

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(message)}`;
    window.open(linkedInUrl, '_blank');
}

// Fonction pour partager sur Telegram
function shareOnTelegram(mode = 'temporal') {
    let resultText;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à partager. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Pour le mode temporel, reformuler le message pour qu'il soit plus attrayant
    let message;
    if (mode === 'temporal') {
        // Récupérer le montant saisi pour le message de partage
        const amountValue = parseFloat(document.getElementById('amount').value);
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        message = `😱 Incroyable perspective ! ${formattedAmount} représentent ${resultText} de retraites versées en France`;
    } else {
        message = `😱 Incroyable perspective ! Découvrez combien de temps représente ce montant en retraites versées en France : ${resultText}`;
    }

    message += `\n\n👉 Calculez votre propre équivalent sur ${window.location.href}`;

    // Sur mobile, utiliser l'URL directe de Telegram
    if (!isDesktop()) {
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;
        window.open(telegramUrl, '_blank');
    } else {
        // Sur ordinateur, utiliser l'URL de Telegram Web
        const telegramWebUrl = `https://web.telegram.org/z/#?text=${encodeURIComponent(message)}`;
        window.open(telegramWebUrl, '_blank');
    }
}

// Fonction pour partager sur Discord
function shareOnDiscord(mode = 'temporal') {
    let resultText;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à partager. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Pour le mode temporel, reformuler le message pour qu'il soit plus attrayant
    let message;
    if (mode === 'temporal') {
        // Récupérer le montant saisi pour le message de partage
        const amountValue = parseFloat(document.getElementById('amount').value);
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        message = `😱 Incroyable perspective ! ${formattedAmount} représentent ${resultText} de retraites versées en France`;
    } else {
        message = `😱 Incroyable perspective ! Découvrez combien de temps représente ce montant en retraites versées en France : ${resultText}`;
    }

    message += `\n\n👉 Calculez votre propre équivalent sur ${window.location.href}`;

    // Discord n'a pas d'API de partage direct, donc on copie le lien
    navigator.clipboard.writeText(message).then(() => {
        alert('Message copié dans le presse-papier. Vous pouvez maintenant le coller dans Discord.');
    });
}

// Fonction pour partager sur Reddit
function shareOnReddit(mode = 'temporal') {
    let resultText;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à partager. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Pour le mode temporel, reformuler le message pour qu'il soit plus attrayant
    let title;
    if (mode === 'temporal') {
        // Récupérer le montant saisi pour le message de partage
        const amountValue = parseFloat(document.getElementById('amount').value);
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        title = `😱 Incroyable perspective ! ${formattedAmount} représentent ${resultText} de retraites versées en France`;
    } else {
        title = `😱 Incroyable perspective ! Découvrez combien de temps représente ce montant en retraites versées en France : ${resultText}`;
    }

    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}`;
    window.open(redditUrl, '_blank');
}

// Fonction pour partager sur Pinterest
function shareOnPinterest(mode = 'temporal') {
    let resultText;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à partager. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Pour le mode temporel, reformuler le message pour qu'il soit plus attrayant
    let description;
    if (mode === 'temporal') {
        // Récupérer le montant saisi pour le message de partage
        const amountValue = parseFloat(document.getElementById('amount').value);
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        description = `😱 Incroyable perspective ! ${formattedAmount} représentent ${resultText} de retraites versées en France`;
    } else {
        description = `😱 Incroyable perspective ! Découvrez combien de temps représente ce montant en retraites versées en France : ${resultText}`;
    }

    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(description)}`;
    window.open(pinterestUrl, '_blank');
}

// Fonction pour partager par SMS
function shareOnSMS(mode = 'temporal') {
    let resultText;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à partager. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Pour le mode temporel, reformuler le message pour qu'il soit plus attrayant
    let message;
    if (mode === 'temporal') {
        // Récupérer le montant saisi pour le message de partage
        const amountValue = parseFloat(document.getElementById('amount').value);
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        message = `😱 Incroyable perspective ! ${formattedAmount} représentent ${resultText} de retraites versées en France`;
    } else {
        message = `😱 Incroyable perspective ! Découvrez combien de temps représente ce montant en retraites versées en France : ${resultText}`;
    }

    message += `\n\n👉 Calculez votre propre équivalent sur ${window.location.href}`;

    // Vérifier si l'API Web Share est disponible
    if (navigator.share && !isDesktop()) {
        navigator.share({
            title: 'Calculatrice d\'équivalent Retraites',
            text: message,
            url: window.location.href
        }).catch(error => console.log('Erreur de partage:', error));
    } else {
        // Sur ordinateur, copier le texte dans le presse-papiers
        navigator.clipboard.writeText(message).then(() => {
            // Afficher un message de confirmation temporaire
            let copyBtn;
            if (mode === 'temporal') {
                copyBtn = document.querySelector('.share-btn[onclick="shareOnSMS(\'temporal\')"]');
            } else {
                copyBtn = document.querySelector('.share-btn[onclick="shareOnSMS(\'financial\')"]');
            }
            if (copyBtn) {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '✓ Copié!';

                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            }
        }).catch(err => {
            console.error('Erreur lors de la copie: ', err);
            alert('Erreur lors de la copie dans le presse-papiers');
        });
    }
}

// Fonction pour partager par Email
function shareOnEmail(mode = 'temporal') {
    let resultText;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à partager. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Pour le mode temporel, reformuler le message pour qu'il soit plus attrayant
    let emailBody;
    if (mode === 'temporal') {
        // Récupérer le montant saisi pour le message de partage
        const amountValue = parseFloat(document.getElementById('amount').value);
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        const reformulatedText = `${formattedAmount} représentent ${resultText} de retraites versées en France`;
        emailBody = `Bonjour,\n\nJe viens de découvrir une application fascinante qui permet de visualiser combien de temps représente un montant en retraites versées en France.\n\nRegardez ce que j'ai trouvé : ${reformulatedText}\n\nCliquez ici pour essayer vous-même : ${window.location.href}`;
    } else {
        emailBody = `Bonjour,\n\nJe viens de découvrir une application fascinante qui permet de visualiser combien de temps représente un montant en retraites versées en France.\n\nRegardez ce que j'ai trouvé : ${resultText}\n\nCliquez ici pour essayer vous-même : ${window.location.href}`;
    }

    const subject = "Incroyable perspective sur les retraites en France!";
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    // Copier également dans le presse-papiers pour faciliter la saisie
    navigator.clipboard.writeText(emailBody).then(() => {
        window.location.href = emailUrl;
    }).catch(() => {
        window.location.href = emailUrl;
    });
}

// Fonction pour copier juste le texte du résultat
function copyJustText(mode = 'temporal') {
    let resultText;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à copier. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Créer un message attrayant pour le partage (fonction du bouton dans la section de partage)
    // Pour le mode temporel, on récupère le montant pour le mettre dans le message
    let message;
    if (mode === 'temporal') {
        // Récupérer le montant saisi pour le message de partage
        const amountValue = parseFloat(document.getElementById('amount').value);
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        message = `😱 Incroyable perspective ! ${formattedAmount} représentent ${resultText} de retraites versées en France`;
    } else {
        message = `😱 Incroyable perspective ! Découvrez combien de temps représente ce montant en retraites versées en France : ${resultText}`;
    }

    message += `\n\n👉 Calculez votre propre équivalent sur ${window.location.href}`;

    navigator.clipboard.writeText(message).then(function() {
        // Afficher un message de confirmation temporaire
        // On ne tente pas de modifier le bouton pour éviter les erreurs
        // La copie fonctionne correctement, c'est l'essentiel
    }).catch(function(err) {
        console.error('Erreur lors de la copie: ', err);
        alert('Erreur lors de la copie: ' + err);
    });
}

// Fonction pour détecter si l'utilisateur est sur un ordinateur
function isDesktop() {
    return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

// Initialisation des événements
document.addEventListener('DOMContentLoaded', function() {
    const timePeriodSelect = document.getElementById('time-period');
    const customPeriodContainer = document.getElementById('custom-period-container');

    if (timePeriodSelect && customPeriodContainer) {
        timePeriodSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customPeriodContainer.classList.remove('hidden');
            } else {
                customPeriodContainer.classList.add('hidden');
            }
        });
    }

    // Activer le mode temporel par défaut
    switchMode('temporal');
});

// Fonction pour le partage natif de l'appareil
function nativeShare(mode = 'temporal') {
    let resultText;

    if (mode === 'temporal') {
        resultText = document.getElementById('result-text-temporal').textContent;
    } else {
        // Pour le mode financier, utiliser le texte de comparaison s'il est disponible
        const comparisonText = document.getElementById('comparison-result-text-financial').textContent;
        if (comparisonText.trim() !== "") {
            resultText = comparisonText;
        } else {
            resultText = document.getElementById('result-text-financial').textContent;
        }
    }

    if (resultText.trim() === "") {
        alert("Aucun résultat à partager. Veuillez d'abord effectuer un calcul.");
        return;
    }

    // Pour le mode temporel, créer un message de partage avec le montant
    let shareTitle, shareText;
    if (mode === 'temporal') {
        // Récupérer le montant saisi pour le message de partage
        const amountValue = parseFloat(document.getElementById('amount').value);
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amountValue);

        shareTitle = "Incroyable perspective sur les retraites en France!";
        shareText = `😱 ${formattedAmount} représentent ${resultText} de retraites versées en France\n\nDécouvrez combien de temps représente un montant en retraites versées en France.`;
    } else {
        shareTitle = "Incroyable perspective sur les retraites en France!";
        shareText = `😱 Découvrez combien de temps représente ce montant en retraites versées en France : ${resultText}`;
    }

    // Vérifier si l'API Web Share est disponible
    if (navigator.share) {
        navigator.share({
            title: shareTitle,
            text: shareText,
            url: window.location.href
        }).catch(error => {
            console.log('Erreur de partage natif:', error);
            // En cas d'erreur ou d'annulation par l'utilisateur, ne rien faire
            // Seuls les cas où l'API n'est pas supportée nécessitent une solution de repli
            if (error.name !== 'AbortError') {
                // Ce n'est pas une annulation de l'utilisateur, donc on propose la solution de repli
                fallbackShare(shareText);
            }
        });
    } else {
        // Solution de repli si l'API Web Share n'est pas prise en charge
        fallbackShare(shareText);
    }
}

// Fonction de repli pour les navigateurs qui ne prennent pas en charge l'API Web Share
function fallbackShare(text) {
    // Proposer à l'utilisateur de copier le texte
    if (confirm('L\'API de partage n\'est pas prise en charge sur votre appareil. Voulez-vous copier le texte dans le presse-papiers pour le coller dans une application de votre choix ?')) {
        // Copier le texte dans le presse-papiers
        navigator.clipboard.writeText(text).then(() => {
            // Afficher un message à l'utilisateur
            alert('Le texte a été copié dans le presse-papiers. Vous pouvez maintenant le coller dans l\'application de votre choix.');
        }).catch(err => {
            console.error('Erreur lors de la copie dans le presse-papiers:', err);
            // Dernière solution : afficher le texte à copier
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Le texte a été copié dans le presse-papiers. Vous pouvez maintenant le coller dans l\'application de votre choix.');
        });
    }
}

// Fonction pour générer le texte de partage en fonction du mode
function getShareText(mode) {
    let resultText = '';

    if (mode === 'temporal') {
        const resultElement = document.getElementById('result-text-temporal');
        const comparisonElement = document.getElementById('comparison-result-text-temporal');

        resultText = resultElement.textContent;

        if (comparisonElement && comparisonElement.textContent) {
            resultText += ' - ' + comparisonElement.textContent;
        }
    } else if (mode === 'financial') {
        const resultElement = document.getElementById('result-text-financial');
        const comparisonElement = document.getElementById('comparison-result-text-financial');

        resultText = resultElement.textContent;

        if (comparisonElement && comparisonElement.innerHTML) {
            // Nettoyer le HTML pour n'avoir que le texte
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = comparisonElement.innerHTML;
            resultText += ' - ' + tempDiv.textContent || tempDiv.innerText || '';
        }
    }

    // Récupérer la valeur du montant
    const amountValue = document.getElementById('amount').value;

    return ` découvrez combien de temps représente ce montant en retraites versées en France : ${amountValue} € équivaut à ${resultText}. Calculez vous-même sur `;
}

// Fonction pour partager sur les réseaux sociaux
function shareOnSocial(platform) {
    const currentUrl = window.location.href;
    const text = 'Découvrez combien de temps représente un montant en retraites versées en France avec cette calculatrice.';

    let shareUrl = '';

    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(text)}`;
            break;
        case 'twitter': // Twitter/X
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`;
            break;
        default:
            // Pour d'autres plateformes, on peut étendre cette fonction
            return;
    }

    // Ouvrir la fenêtre de partage
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

// Fonction pour partager via email ou SMS
function shareVia(method) {
    const currentUrl = window.location.href;
    const text = 'Découvrez combien de temps représente un montant en retraites versées en France avec cette calculatrice.';

    if (method === 'email') {
        const subject = encodeURIComponent('Calculatrice d\'équivalent retraites');
        const body = encodeURIComponent(`${text}\n\nDécouvrez cette calculatrice ici : ${currentUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else if (method === 'sms') {
        const body = encodeURIComponent(`${text} ${currentUrl}`);
        window.location.href = `sms:?body=${body}`;
    }
}