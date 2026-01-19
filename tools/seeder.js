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

// Formación Default para Game 3
const DEFAULT_FORMATION = {
  name: "4-3-3 Ofensivo",
  layout: [
    { id: 1, role: 'PO', top: '88%', left: '50%' },
    { id: 2, role: 'DFI', top: '70%', left: '20%' },
    { id: 3, role: 'DFC', top: '70%', left: '40%' },
    { id: 4, role: 'DFC', top: '70%', left: '60%' },
    { id: 5, role: 'DFD', top: '70%', left: '80%' },
    { id: 6, role: 'MC', top: '45%', left: '30%' },
    { id: 7, role: 'MCD', top: '45%', left: '50%' },
    { id: 8, role: 'MC', top: '45%', left: '70%' },
    { id: 9, role: 'EI', top: '20%', left: '20%' },
    { id: 10, role: 'DC', top: '15%', left: '50%' },
    { id: 11, role: 'ED', top: '20%', left: '80%' }
  ],
  counts: { PO: 1, DFI: 1, DFC: 2, DFD: 1, MCD: 1, MC: 2, EI: 1, DC: 1, ED: 1 }
};

async function seedDatabase() {
  console.log('--- 🚀 Iniciando Carga Masiva 2.0 ---');

  // --- SEED CONFIGURACIÓN GLOBAL (Game 3) ---
  try {
    console.log('\n⚙️ Configurando Game 3 (Formaciones)...');
    await db.collection('configuracion').doc('global').set({
      formaciones: [DEFAULT_FORMATION],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('   ✅ Configuración global actualizada con formaciones.');
  } catch (error) {
    console.error('   ❌ Error en configuración global:', error);
  }

  // --- SEED JUGADORES ---
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
