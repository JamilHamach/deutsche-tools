/* ═══════════════════════════════════════════════════════════════════════════
   Mietstufen Daten 2025 (Auszug)
   Quelle: Wohngeldverordnung (WoGV) / Mietstufen der Bundesländer
   Stand: 2025
   ═══════════════════════════════════════════════════════════════════════════ */

const mietstufenData = [
    // Top Cities
    { city: "Berlin", level: 7, state: "BE" },
    { city: "München", level: 7, state: "BY" },
    { city: "Hamburg", level: 6, state: "HH" },
    { city: "Köln", level: 6, state: "NW" },
    { city: "Frankfurt am Main", level: 6, state: "HE" },
    { city: "Stuttgart", level: 6, state: "BW" },
    { city: "Düsseldorf", level: 6, state: "NW" },
    { city: "Leipzig", level: 2, state: "SN" },
    { city: "Dortmund", level: 3, state: "NW" },
    { city: "Essen", level: 3, state: "NW" },
    { city: "Bremen", level: 4, state: "HB" }, // Estimated/Common
    { city: "Dresden", level: 4, state: "SN" }, // Estimated
    { city: "Hannover", level: 4, state: "NI" }, // Estimated
    { city: "Nürnberg", level: 4, state: "BY" }, // Estimated
    // Add more as needed or prompt user to check link if not found.
    // This is a "Curated List" for better UX.

    // Examples of expensive areas
    { city: "Tubingen", level: 6, state: "BW" },
    { city: "Darmstadt", level: 6, state: "HE" },
    { city: "Wiesbaden", level: 6, state: "HE" },
    { city: "Mainz", level: 5, state: "RP" },
    { city: "Freiburg im Breisgau", level: 6, state: "BW" },
    { city: "Heidelberg", level: 6, state: "BW" },
    { city: "Ingolstadt", level: 6, state: "BY" },
    { city: "Rosenheim", level: 6, state: "BY" },
    { city: "Starnberg", level: 7, state: "BY" },
    { city: "Münster", level: 4, state: "NW" },
    { city: "Bonn", level: 5, state: "NW" },
];

// Helper to search
function findMietstufe(query) {
    if (!query) return [];
    query = query.toLowerCase();
    return mietstufenData.filter(item => item.city.toLowerCase().includes(query));
}
