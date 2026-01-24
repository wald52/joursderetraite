/**
 * Module: examples.js
 * Contient les exemples de valeurs célèbres pour la calculatrice
 */

// Tableau des exemples de valeurs célèbres
export const examples = [
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

/**
 * Obtient un exemple aléatoire du tableau
 * @returns {Object} Un objet exemple avec value et label
 */
export function getRandomExample() {
    const randomIndex = Math.floor(Math.random() * examples.length);
    return examples[randomIndex];
}
