import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const getDailyChallenge = async (gameId) => {
  const today = new Date().toISOString().slice(0, 10);
  const q = query(
    collection(db, `juegos/${gameId}/desafios-diarios`),
    where("fecha", "==", today)
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
