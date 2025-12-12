function calculate() {
    const amount = parseFloat(document.getElementById('amount').value);
    if (isNaN(amount)) {
        alert("Veuillez entrer un montant valide.");
        return;
    }

    // Montant total des retraites versées en France en 2025
    const totalRetraites = 420e9; // 420 milliards d'euros

    // Calcul du ratio
    const ratio = amount / totalRetraites;

    // Nombre de secondes dans une année
    const secondsInYear = 365 * 24 * 60 * 60;
    const equivalentSeconds = ratio * secondsInYear;

    // Conversion en années, mois, jours, heures, minutes et secondes
    const years = Math.floor(equivalentSeconds / (365 * 24 * 60 * 60));
    const remainingSecondsAfterYears = equivalentSeconds % (365 * 24 * 60 * 60);
    const months = Math.floor(remainingSecondsAfterYears / (30 * 24 * 60 * 60)); // Approximation pour les mois
    const remainingSecondsAfterMonths = remainingSecondsAfterYears % (30 * 24 * 60 * 60);
    const days = Math.floor(remainingSecondsAfterMonths / (24 * 60 * 60));
    const remainingSecondsAfterDays = remainingSecondsAfterMonths % (24 * 60 * 60);
    const hours = Math.floor(remainingSecondsAfterDays / (60 * 60));
    const remainingSecondsAfterHours = remainingSecondsAfterDays % (60 * 60);
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const seconds = Math.floor(remainingSecondsAfterHours % 60);

    // Affichage des résultats
    document.getElementById('years').textContent = `Années : ${years}`;
    document.getElementById('months').textContent = `Mois : ${months}`;
    document.getElementById('days').textContent = `Jours : ${days}`;
    document.getElementById('hours').textContent = `Heures : ${hours}`;
    document.getElementById('minutes').textContent = `Minutes : ${minutes}`;
    document.getElementById('seconds').textContent = `Secondes : ${seconds}`;
}
