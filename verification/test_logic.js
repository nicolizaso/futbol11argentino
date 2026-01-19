// Unit test for Game 3 logic
// Requirements:
// 1. Normalize: lowercase, no accents.
// 2. Predictive: matches start of any word.
// 3. Validation: exact match of full name OR any single word.

const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

const squad = [
    { nombre: 'Ezequiel Centurión' },
    { nombre: 'Juan Estévez' },
    { nombre: 'Maxi López' }
];

console.log("--- Test: Normalize ---");
const t1 = normalizeText('Ezequiel Centurión');
if (t1 === 'ezequiel centurion') console.log("PASS: Ezequiel Centurión -> " + t1);
else console.error("FAIL: Ezequiel Centurión -> " + t1);

console.log("\n--- Test: Predictive Search ---");
// "A player matches if the input matches the beginning of any word in their name"
// 'EZ' -> Ezequiel Centurion
const testSearch = (input, expectedCount) => {
    const normalizedInput = normalizeText(input);
    const filtered = squad.filter(player => {
        const normalizedName = normalizeText(player.nombre);
        const words = normalizedName.split(' ');
        return words.some(word => word.startsWith(normalizedInput));
    });
    console.log("Input: " + input + " -> Matches: " + filtered.map(p => p.nombre).join(', '));
    if (filtered.length === expectedCount) console.log("PASS");
    else console.error("FAIL: Expected " + expectedCount + " matches");
};

testSearch('EZ', 1); // Ezequiel
testSearch('Cen', 1); // Centurion
testSearch('Juan', 1); // Juan
testSearch('estevez', 1); // Estevez
testSearch('Lopez', 1); // Lopez

console.log("\n--- Test: Validation (Submit) ---");
// "A match is valid if the normalized input exactly matches the full name OR any single word"
const testSubmit = (input, expectedFound) => {
    const normalizedInput = normalizeText(input);
    const foundPlayer = squad.find(p => {
          const normalizedName = normalizeText(p.nombre);
          const words = normalizedName.split(' ');
          return normalizedName === normalizedInput || words.some(w => w === normalizedInput);
    });

    if (!!foundPlayer === expectedFound) console.log("Input: " + input + " -> Found: " + !!foundPlayer + " [PASS]");
    else console.error("Input: " + input + " -> Found: " + !!foundPlayer + " [FAIL]");
};

testSubmit('Ezequiel Centurión', true); // Full Match
testSubmit('ezequiel centurion', true); // Full Match Normalized
testSubmit('Centurión', true); // Single Word Match (Last Name)
testSubmit('Ezequiel', true); // Single Word Match (First Name)
testSubmit('Centu', false); // Partial Word -> Should Fail Validation
testSubmit('Lopez', true); // Last name
testSubmit('Maxi', true); // First name
