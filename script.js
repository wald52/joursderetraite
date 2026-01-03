// Variable pour suivre si un calcul a déjà été effectué
let hasCalculated = false;

function calculate() {
    const amount = parseFloat(document.getElementById('amount').value);
    if (isNaN(amount) || amount < 0) {
        alert("Veuillez entrer un montant valide.");
        // Si un calcul a déjà été effectué, ne pas masquer la section
        // Sinon, laisser la section masquée
        if (!hasCalculated) {
            document.getElementById('result-section').style.display = 'none';
        }
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
    const remainingSecondsAfterYears = equivalentSeconds % (365.25 * secondsInDay);

    // Calcul des mois (moyenne de 30.44 jours par mois : 365.25/12)
    const monthsInYear = 12;
    const daysInMonth = 365.25 / monthsInYear; // ≈ 30.44 jours
    const secondsInMonth = daysInMonth * secondsInDay;

    const months = Math.floor(remainingSecondsAfterYears / secondsInMonth);
    const remainingSecondsAfterMonths = remainingSecondsAfterYears % secondsInMonth;

    // Calcul des jours, heures, minutes et secondes
    const days = Math.floor(remainingSecondsAfterMonths / secondsInDay);
    const remainingSecondsAfterDays = remainingSecondsAfterMonths % secondsInDay;
    const hours = Math.floor(remainingSecondsAfterDays / secondsInHour);
    const remainingSecondsAfterHours = remainingSecondsAfterDays % secondsInHour;
    const minutes = Math.floor(remainingSecondsAfterHours / secondsInMinute);
    const seconds = Math.floor(remainingSecondsAfterHours % secondsInMinute);

    // Formatage du résultat sur une seule ligne (sans virgules, affichage uniquement des valeurs > 0, avec accord au singulier/pluriel)
    const resultParts = [];
    if (years > 0) resultParts.push(`${years} ${years === 1 ? 'année' : 'années'}`);
    if (months > 0) resultParts.push(`${months} ${months === 1 ? 'mois' : 'mois'}`); // 'mois' est invariable
    if (days > 0) resultParts.push(`${days} ${days === 1 ? 'jour' : 'jours'}`);
    if (hours > 0) resultParts.push(`${hours} ${hours === 1 ? 'heure' : 'heures'}`);
    if (minutes > 0) resultParts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    if (seconds > 0) resultParts.push(`${seconds} ${seconds === 1 ? 'seconde' : 'secondes'}`);

    const resultText = resultParts.length > 0 ? resultParts.join(' ') : '0 seconde';

    // Affichage du résultat
    document.getElementById('result-text').textContent = resultText;

    // Afficher la section de résultat complète
    document.getElementById('result-section').style.display = 'block';

    // Marquer qu'un calcul a été effectué
    hasCalculated = true;
}

// Fonction pour copier le résultat dans le presse-papiers
function copyResult() {
    const resultText = document.getElementById('result-text').textContent;

    if (resultText.trim() === "") {
        alert("Aucun résultat à copier. Veuillez d'abord effectuer un calcul.");
        return;
    }

    navigator.clipboard.writeText(resultText).then(function() {
        // Afficher un message de confirmation temporaire
        const copyBtn = document.getElementById('copy-btn');
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
    { value: 1200000000, label: "1,2Mds € - Budget d'un film hollywoodien" }
];

// Fonction pour obtenir un exemple aléatoire
function getRandomExample() {
    const randomIndex = Math.floor(Math.random() * examples.length);
    return examples[randomIndex];
}

// Fonction pour définir une valeur d'exemple
function setExampleValue(value) {
    document.getElementById('amount').value = value;
    // Déclencher le calcul automatiquement
    calculate();
}

// Fonction pour définir un exemple aléatoire
function setRandomExample() {
    const randomExample = getRandomExample();
    document.getElementById('amount').value = randomExample.value;

    // Mettre à jour l'affichage de l'exemple actuel
    const currentExampleElement = document.getElementById('current-example');
    currentExampleElement.textContent = randomExample.label;

    // Afficher la section d'exemple
    currentExampleElement.style.display = 'block';

    // Déclencher le calcul automatiquement
    calculate();
}

// Fonction pour charger un exemple aléatoire au chargement de la page
function loadRandomExampleOnLoad() {
    // Attendre que la page soit complètement chargée
    window.addEventListener('load', function() {
        // Générer un exemple aléatoire au chargement
        setRandomExample();
    });
}

// Ne pas charger d'exemple automatiquement au chargement de la page
// L'utilisateur devra cliquer sur le bouton pour charger un exemple

// Fonction pour réinitialiser le formulaire
function resetForm() {
    // Réinitialiser le champ de saisie
    document.getElementById('amount').value = '';

    // Réinitialiser l'affichage de l'exemple
    const currentExampleElement = document.getElementById('current-example');
    currentExampleElement.textContent = '';

    // Masquer la section d'exemple quand elle est vide
    currentExampleElement.style.display = 'none';

    // Masquer la section de résultat
    document.getElementById('result-section').style.display = 'none';

    // Réinitialiser le texte du résultat
    document.getElementById('result-text').textContent = '';

    // Le bouton de copie est dans la section résultat, donc il est masqué avec la section
    // Pas besoin de le masquer séparément
}
