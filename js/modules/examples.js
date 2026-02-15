/**
 * Module: examples.js
 * Contient les exemples de valeurs célèbres pour la calculatrice
 */

// Tableau des exemples de valeurs célèbres
export const examples = [

    { value: 289000000, label: "le budget annuel de l'UNESCO (2025)" },
    { value: 82000000, label: "le salaire annuel de Kylian Mbappé" },


    { value: 500000000, label: "la valeur d'une ETI (Entreprise de Taille Intermédiaire)" },
    { value: 565000, label: "le prix moyen d'un appartement à Paris" },
    { value: 7000000, label: "le salaire annuel moyen d'un PDG du CAC 40" },
    { value: 280000000, label: "le coût de l'avion présidentiel français (A330)" },
    { value: 150000000, label: "le prix d'un superyacht de luxe" },
    { value: 340000000, label: "le budget d'Avatar (ajusté de l'inflation)" },
    { value: 50500000000, label: "le budget du ministère des Armées (2025)" },
    { value: 64500000000, label: "le budget de l'Éducation nationale (2025)" },
    { value: 17000000000, label: "le budget de la sécurité intérieure (2025)" },
    { value: 50000000000, label: "le coût du tunnel sous la Manche (ajusté de l'inflation)" },
    { value: 28500000000, label: "le coût du Projet Manhattan (ajusté de l'inflation)" },
    { value: 400000000000, label: "le coût du Plan Messmer" },
    { value: 220000000000, label: "le coût du programme Apollo (ajusté de l'inflation)" },
    { value: 3350000000, label: "le coût du CERN (LHC) (ajusté de l'inflation)" },
    { value: 150000000000, label: "le coût de la Station spatiale internationale (ISS)" },
    { value: 25000000000, label: "le coût du Projet ITER" },
    { value: 12000000000, label: "le coût du tunnel de base du Gothard" },
    { value: 40000000000, label: "le coût de la centrale de Hinkley Point C" },
    { value: 21704135923, label: "le budget de la transition écologique (2025)" },
    { value: 10700000000, label: "le budget de la Justice (2025)" },
    { value: 35000000, label: "la construction de la Tour Eiffel (ajusté de l'inflation)" },
    { value: 185000000, label: "la restauration du Mont-Saint-Michel" },
    { value: 70000000, label: "la construction de l'Arc de Triomphe (ajusté de l'inflation)" },
    { value: 330000000, label: "la construction de l'Opéra Garnier (ajusté de l'inflation)" },
    { value: 150000000, label: "la construction du Centre Pompidou (ajusté de l'inflation)" },
    { value: 735000000, label: "la construction de la Grande Arche de La Défense (ajusté de l'inflation)" },
    { value: 800000000, label: "la construction de l'Opéra Bastille (ajusté de l'inflation)" },
    { value: 25000000, label: "le coût de la Pyramide du Louvre (ajusté de l'inflation)" },
    { value: 620000000, label: "le coût du Stade de France (ajusté de l'inflation)" },
    { value: 650000000, label: "le coût du Pont de Normandie (ajusté de l'inflation)" },
    { value: 560000000, label: "le coût du Viaduc de Millau (ajusté de l'inflation)" },
    { value: 3500000000, label: "le budget des Affaires étrangères (2025)" },
    { value: 4000000000, label: "le budget de la Culture (2025)" },
    { value: 20000000000, label: "le budget du Travail et de l'Emploi (2025)" },
    { id: "gold_market_cap", value: 26000000000000, label: "la valeur de l'or mondial (au 31/12/2025)" },
    { id: "btc_market_cap", value: 1500000000000, label: "la valeur de tous les Bitcoins (au 31/12/2025)" },
    { id: "apple_market_cap", value: 3423000000000, label: "la valeur d'Apple (au 31/12/2025)" },
    { value: 6650000000, label: "le coût public des JO Paris 2024" },
    { value: 1500000000, label: "le prix d'un sous-marin Suffren" },
    { value: 19000000000, label: "le coût de la centrale EPR de Flamanville" },
    { value: 10000000000, label: "le coût du porte-avions PANG" },
    { value: 100000000, label: "le coût d'un lancement d'Ariane 6" },
    { value: 172800000000, label: "la fortune de Bernard Arnault (au 31/12/2025)" },
    { value: 3149000000000, label: "la valeur de Google (au 31/12/2025)" },
    { value: 2102000000000, label: "la valeur d'Amazon (au 31/12/2025)" },
    { value: 1277000000000, label: "la valeur de Tesla (au 31/12/2025)" },
    { value: 2980000000000, label: "le PIB de la France (2025)" },
    { value: 190000000000, label: "le budget annuel de l'UE" },
    { value: 0.5, label: "une portion de frites à la cantine" },
    { value: 1, label: "une double portion de frites à la cantine" },
    { value: 50000, label: "un poste d'infirmière (coût annuel)" },
    { value: 50000, label: "un poste de policier (coût annuel)" },
    { value: 50000, label: "un poste de pompier (coût annuel)" },
    { value: 55000, label: "un poste de professeur (coût annuel)" },
    { value: 40000, label: "un poste de nounou en crèche (coût annuel)" },
    { value: 192468, label: "le salaire annuel d'Emmanuel Macron" },
    { value: 91648, label: "le salaire annuel d'un député" },
    { value: 91648, label: "le salaire annuel d'un sénateur" },
    { value: 128304, label: "le salaire annuel d'un ministre" }
];

let lastIndex = -1;

/**
 * Obtient un exemple aléatoire du tableau (différent du précédent)
 * @returns {Object} Un objet exemple avec value et label
 */
export function getRandomExample() {
    if (examples.length <= 1) return examples[0];

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * examples.length);
    } while (randomIndex === lastIndex);

    lastIndex = randomIndex;
    return examples[randomIndex];
}

/**
 * Met à jour une valeur d'exemple par id (si présent)
 * @param {string} id
 * @param {number} value
 */
export function updateExampleValueById(id, value) {
    if (!id) return;
    const entry = examples.find(ex => ex.id === id);
    if (!entry) return;
    if (typeof value === 'number' && isFinite(value)) {
        entry.value = value;
    }
}
