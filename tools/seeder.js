const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicialización con tu llave privada
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Función auxiliar para crear IDs amigables (Slugs)
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos
    .replace(/\s+/g, '-')           // Cambia espacios por guiones
    .replace(/[^\w-]+/g, '')       // Quita caracteres especiales
    .replace(/--+/g, '-')           // Evita guiones dobles
    .trim();
};

const playersData = require('./players_data.json');

async function seedDatabase() {
  console.log('--- 🚀 Iniciando Carga Masiva 2.0 ---');

  for (const teamData of playersData) {
    const { teamName, players } = teamData;
    // Usamos el nombre del equipo como ID del documento según tu preferencia
    const teamId = teamName; 

    console.log(`\n📦 Equipo: ${teamName}`);

    try {
      // 1. CREAR EL EQUIPO SI NO EXISTE (o actualizar si ya está)
      // Usamos .set con { merge: true } para que no borre campos extra si ya existía
      await db.collection('equipos').doc(teamId).set({
        nombre: teamName,
        division: "A", 
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      console.log(`   ✅ Documento de equipo listo (ID: ${teamId})`);

      // 2. REFERENCIA A LA SUBCOLECCIÓN (Arquitectura 2.0)
      const playersSubCol = db.collection('Jugadores').doc(teamId).collection('jugadores');

      // 3. LIMPIEZA PREVIA
      // Borramos los jugadores viejos de este equipo para evitar duplicados
      const existingPlayers = await playersSubCol.get();
      if (!existingPlayers.empty) {
        const deleteBatch = db.batch();
        existingPlayers.docs.forEach(doc => deleteBatch.delete(doc.ref));
        await deleteBatch.commit();
        console.log(`   🧹 Subcolección de jugadores limpia.`);
      }

      // 4. CARGA DE JUGADORES CON SLUGS
      const insertBatch = db.batch();
      players.forEach(player => {
        const playerSlug = slugify(player.name);
        const playerRef = playersSubCol.doc(playerSlug);
        
        insertBatch.set(playerRef, {
          nombre: player.name,
          posiciones: player.positions,
          teamId: teamId, // Referencia al equipo
          slug: playerSlug
        });
      });

      await insertBatch.commit();
      console.log(`   🚀 ${players.length} jugadores cargados con IDs legibles.`);

    } catch (error) {
      console.error(`   ❌ Error procesando ${teamName}:`, error);
    }
  }

  console.log('\n--- ✨ Proceso completado exitosamente ---');
}

seedDatabase().catch(console.error);