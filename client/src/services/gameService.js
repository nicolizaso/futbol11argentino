import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Fetches the daily challenge for a specific game.
 * @param {string} gameId - The ID of the game (e.g., 'juego1', 'juego2').
 * @param {string|null} date - Optional date in 'YYYY-MM-DD' format. Defaults to today.
 * @returns {Promise<object|null>} The challenge data or null if not found.
 */
export const getDailyChallenge = async (gameId, date = null) => {
  const targetDate = date || new Date().toISOString().slice(0, 10);

  // For Game 1, the structure is a collection where each doc ID is NOT the date, but fields contain 'fecha'
  // For Game 2, we can adopt the same pattern or use ID as date.
  // The current implementation for Game 1 uses `where("fecha", "==", today)`.
  // We will maintain this pattern for consistency unless Game 2 writes specifically to ID=Date.
  // The Admin plan for Game 2 sets ID as `YYYY-MM-DD`.

  // If we save with ID=Date, we can try to fetch by ID first.
  if (gameId === 'juego2') {
      const docRef = doc(db, `juegos/${gameId}/dailyChallenges/${targetDate}`);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
  }

  // Fallback for Game 1 (existing logic)
  const q = query(
    collection(db, `juegos/${gameId}/desafios-diarios`),
    where("fecha", "==", targetDate)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const data = snapshot.docs[0].data();
  return { id: snapshot.docs[0].id, ...data };
};

export const getLevel = async (gameId, teamId, levelNumber) => {
  const docRef = doc(db, `juegos/${gameId}/niveles/${teamId}/Nivel/Nivel${levelNumber}`);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return snapshot.data();
};

export const saveProgress = async (userId, gameId, type, id, data) => {
  // type can be 'daily' or 'levels'
  // For Game 2, we might save to 'resultados' or similar.
  // The existing logic puts daily in 'desafiosCompletados' and levels in 'nivelesCompletados'.

  const collectionName = type === 'daily' ? 'desafiosCompletados' : 'nivelesCompletados';
  const docId = type === 'daily' ? `${gameId}-${data.fecha}` : `${id}`; // id for level is team_NivelX

  await setDoc(doc(db, `usuarios/${userId}/${collectionName}`, docId), {
    juego: gameId,
    ...data
  });
};

export const getCompletedLevels = async (userId) => {
  const snapshot = await getDocs(collection(db, `usuarios/${userId}/nivelesCompletados`));
  const completed = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!completed[data.equipo]) completed[data.equipo] = [];
    completed[data.equipo].push(parseInt(data.nivel));
  });
  return completed;
};

/**
 * Verifies if the user input matches any of the valid answers.
 * @param {string} userInput - The player's guess.
 * @param {string[]} validAnswers - Array of valid answer strings.
 * @returns {boolean} True if correct, false otherwise.
 */
export const verifyPlayerAnswer = (userInput, validAnswers) => {
    if (!userInput || !validAnswers || !Array.isArray(validAnswers)) return false;

    const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const normalizedInput = normalize(userInput);

    return validAnswers.some(answer => normalize(answer) === normalizedInput);
};

// Agregá o actualizá esta función en tu gameService.js
export const getPlayersByTeam = async (teamName) => {
  try {
    // Nueva ruta jerárquica 2.0
    const playersRef = collection(db, "Jugadores", teamName, "jugadores");
    const snapshot = await getDocs(playersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching players for team:", teamName, error);
    return [];
  }
};