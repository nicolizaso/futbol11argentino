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

// --- FORMACIONES (10 Opciones) ---
const FORMATIONS = [
  {
    name: "4-4-2 Clásico",
    layout: [
      { id: 1, role: 'PO', top: '88%', left: '50%' },
      { id: 2, role: 'DFI', top: '70%', left: '20%' },
      { id: 3, role: 'DFC', top: '70%', left: '40%' },
      { id: 4, role: 'DFC', top: '70%', left: '60%' },
      { id: 5, role: 'DFD', top: '70%', left: '80%' },
      { id: 6, role: 'MI', top: '45%', left: '20%' },
      { id: 7, role: 'MC', top: '45%', left: '40%' },
      { id: 8, role: 'MC', top: '45%', left: '60%' },
      { id: 9, role: 'MD', top: '45%', left: '80%' },
      { id: 10, role: 'DC', top: '15%', left: '35%' },
      { id: 11, role: 'DC', top: '15%', left: '65%' }
    ],
    counts: { PO: 1, DFI: 1, DFC: 2, DFD: 1, MI: 1, MC: 2, MD: 1, DC: 2 }
  },
  {
    name: "3-4-1-2",
    layout: [
      { id: 1, role: 'PO', top: '88%', left: '50%' },
      { id: 2, role: 'DFC', top: '70%', left: '30%' },
      { id: 3, role: 'DFC', top: '75%', left: '50%' },
      { id: 4, role: 'DFC', top: '70%', left: '70%' },
      { id: 5, role: 'MI', top: '45%', left: '15%' },
      { id: 6, role: 'MC', top: '50%', left: '35%' },
      { id: 7, role: 'MC', top: '50%', left: '65%' },
      { id: 8, role: 'MD', top: '45%', left: '85%' },
      { id: 9, role: 'MCO', top: '30%', left: '50%' },
      { id: 10, role: 'DC', top: '15%', left: '35%' },
      { id: 11, role: 'DC', top: '15%', left: '65%' }
    ],
    counts: { PO: 1, DFC: 3, MI: 1, MC: 2, MD: 1, MCO: 1, DC: 2 }
  },
  {
    name: "5-2-1-2",
    layout: [
      { id: 1, role: 'PO', top: '88%', left: '50%' },
      { id: 2, role: 'DFI', top: '65%', left: '15%' },
      { id: 3, role: 'DFC', top: '70%', left: '35%' },
      { id: 4, role: 'DFC', top: '75%', left: '50%' },
      { id: 5, role: 'DFC', top: '70%', left: '65%' },
      { id: 6, role: 'DFD', top: '65%', left: '85%' },
      { id: 7, role: 'MC', top: '50%', left: '35%' },
      { id: 8, role: 'MC', top: '50%', left: '65%' },
      { id: 9, role: 'MCO', top: '35%', left: '50%' },
      { id: 10, role: 'DC', top: '15%', left: '35%' },
      { id: 11, role: 'DC', top: '15%', left: '65%' }
    ],
    counts: { PO: 1, DFI: 1, DFC: 3, DFD: 1, MC: 2, MCO: 1, DC: 2 }
  },
  {
    name: "4-3-3 (1)",
    layout: [
      { id: 1, role: 'PO', top: '88%', left: '50%' },
      { id: 2, role: 'DFI', top: '70%', left: '20%' },
      { id: 3, role: 'DFC', top: '70%', left: '40%' },
      { id: 4, role: 'DFC', top: '70%', left: '60%' },
      { id: 5, role: 'DFD', top: '70%', left: '80%' },
      { id: 6, role: 'MC', top: '45%', left: '30%' },
      { id: 7, role: 'MCD', top: '50%', left: '50%' },
      { id: 8, role: 'MC', top: '45%', left: '70%' },
      { id: 9, role: 'EI', top: '20%', left: '20%' },
      { id: 10, role: 'DC', top: '15%', left: '50%' },
      { id: 11, role: 'ED', top: '20%', left: '80%' }
    ],
    counts: { PO: 1, DFI: 1, DFC: 2, DFD: 1, MC: 2, MCD: 1, EI: 1, DC: 1, ED: 1 }
  },
  {
    name: "4-3-3 (2)",
    layout: [
      { id: 1, role: 'PO', top: '88%', left: '50%' },
      { id: 2, role: 'DFI', top: '70%', left: '20%' },
      { id: 3, role: 'DFC', top: '70%', left: '40%' },
      { id: 4, role: 'DFC', top: '70%', left: '60%' },
      { id: 5, role: 'DFD', top: '70%', left: '80%' },
      { id: 6, role: 'MCD', top: '50%', left: '30%' },
      { id: 7, role: 'MCD', top: '50%', left: '50%' },
      { id: 8, role: 'MCD', top: '50%', left: '70%' },
      { id: 9, role: 'EI', top: '20%', left: '20%' },
      { id: 10, role: 'DC', top: '15%', left: '50%' },
      { id: 11, role: 'ED', top: '20%', left: '80%' }
    ],
    counts: { PO: 1, DFI: 1, DFC: 2, DFD: 1, MCD: 3, EI: 1, DC: 1, ED: 1 }
  },
  {
    name: "4-3-1-2",
    layout: [
      { id: 1, role: 'PO', top: '88%', left: '50%' },
      { id: 2, role: 'DFI', top: '70%', left: '20%' },
      { id: 3, role: 'DFC', top: '70%', left: '40%' },
      { id: 4, role: 'DFC', top: '70%', left: '60%' },
      { id: 5, role: 'DFD', top: '70%', left: '80%' },
      { id: 6, role: 'MC', top: '50%', left: '30%' },
      { id: 7, role: 'MCD', top: '55%', left: '50%' },
      { id: 8, role: 'MC', top: '50%', left: '70%' },
      { id: 9, role: 'MCO', top: '35%', left: '50%' },
      { id: 10, role: 'DC', top: '15%', left: '35%' },
      { id: 11, role: 'DC', top: '15%', left: '65%' }
    ],
    counts: { PO: 1, DFI: 1, DFC: 2, DFD: 1, MC: 2, MCD: 1, MCO: 1, DC: 2 }
  },
  {
    name: "4-2-2-2",
    layout: [
      { id: 1, role: 'PO', top: '88%', left: '50%' },
      { id: 2, role: 'DFI', top: '70%', left: '20%' },
      { id: 3, role: 'DFC', top: '70%', left: '40%' },
      { id: 4, role: 'DFC', top: '70%', left: '60%' },
      { id: 5, role: 'DFD', top: '70%', left: '80%' },
      { id: 6, role: 'MCD', top: '55%', left: '35%' },
      { id: 7, role: 'MCD', top: '55%', left: '65%' },
      { id: 8, role: 'MCO', top: '35%', left: '25%' },
      { id: 9, role: 'MCO', top: '35%', left: '75%' },
      { id: 10, role: 'DC', top: '15%', left: '35%' },
      { id: 11, role: 'DC', top: '15%', left: '65%' }
    ],
    counts: { PO: 1, DFI: 1, DFC: 2, DFD: 1, MCD: 2, MCO: 2, DC: 2 }
  },
  {
    name: "4-1-2-1-2 (1)",
    layout: [
      { id: 1, role: 'PO', top: '88%', left: '50%' },
      { id: 2, role: 'DFI', top: '70%', left: '20%' },
      { id: 3, role: 'DFC', top: '70%', left: '40%' },
      { id: 4, role: 'DFC', top: '70%', left: '60%' },
      { id: 5, role: 'DFD', top: '70%', left: '80%' },
      { id: 6, role: 'MCD', top: '55%', left: '50%' },
      { id: 7, role: 'MI', top: '45%', left: '20%' },
      { id: 8, role: 'MD', top: '45%', left: '80%' },
      { id: 9, role: 'MCO', top: '30%', left: '50%' },
      { id: 10, role: 'DC', top: '15%', left: '35%' },
      { id: 11, role: 'DC', top: '15%', left: '65%' }
    ],
    counts: { PO: 1, DFI: 1, DFC: 2, DFD: 1, MCD: 1, MI: 1, MD: 1, MCO: 1, DC: 2 }
  },
  {
    name: "4-1-2-1-2 (2)",
    layout: [
      { id: 1, role: 'PO', top: '88%', left: '50%' },
      { id: 2, role: 'DFI', top: '70%', left: '20%' },
      { id: 3, role: 'DFC', top: '70%', left: '40%' },
      { id: 4, role: 'DFC', top: '70%', left: '60%' },
      { id: 5, role: 'DFD', top: '70%', left: '80%' },
      { id: 6, role: 'MCD', top: '60%', left: '50%' },
      { id: 7, role: 'MC', top: '45%', left: '35%' },
      { id: 8, role: 'MC', top: '45%', left: '65%' },
      { id: 9, role: 'MCO', top: '30%', left: '50%' },
      { id: 10, role: 'DC', top: '15%', left: '35%' },
      { id: 11, role: 'DC', top: '15%', left: '65%' }
    ],
    counts: { PO: 1, DFI: 1, DFC: 2, DFD: 1, MCD: 1, MC: 2, MCO: 1, DC: 2 }
  },
  {
    name: "4-2-3-1",
    layout: [
      { id: 1, role: 'PO', top: '88%', left: '50%' },
      { id: 2, role: 'DFI', top: '70%', left: '20%' },
      { id: 3, role: 'DFC', top: '70%', left: '40%' },
      { id: 4, role: 'DFC', top: '70%', left: '60%' },
      { id: 5, role: 'DFD', top: '70%', left: '80%' },
      { id: 6, role: 'MCD', top: '55%', left: '35%' },
      { id: 7, role: 'MCD', top: '55%', left: '65%' },
      { id: 8, role: 'MI', top: '35%', left: '20%' },
      { id: 9, role: 'MCO', top: '35%', left: '50%' },
      { id: 10, role: 'MD', top: '35%', left: '80%' },
      { id: 11, role: 'DC', top: '15%', left: '50%' }
    ],
    counts: { PO: 1, DFI: 1, DFC: 2, DFD: 1, MCD: 2, MI: 1, MCO: 1, MD: 1, DC: 1 }
  }
];

async function seedDatabase() {
  console.log('--- 🚀 Iniciando Carga Masiva 2.0 (Rework Game 3) ---');

  // --- SEED CONFIGURACIÓN GLOBAL (Game 3) ---
  try {
    console.log('\n⚙️ Configurando Game 3 (Formaciones - 10 Opciones)...');
    await db.collection('configuracion').doc('global').set({
      formaciones: FORMATIONS,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`   ✅ Configuración global actualizada con ${FORMATIONS.length} formaciones.`);
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

      // 4. CARGA DE JUGADORES CON SLUGS Y LOGICA DE POSICIONES SECUNDARIAS
      const insertBatch = db.batch();

      players.forEach(player => {
        const playerSlug = slugify(player.name);
        const playerRef = playersSubCol.doc(playerSlug);
        
        // --- LOGICA SECUNDARIA ---
        // Si tiene ED -> Agregar MD
        // Si tiene EI -> Agregar MI
        let positions = [...player.positions];
        if (positions.includes('ED') && !positions.includes('MD')) {
            positions.push('MD');
        }
        if (positions.includes('EI') && !positions.includes('MI')) {
            positions.push('MI');
        }

        insertBatch.set(playerRef, {
          nombre: player.name,
          posiciones: positions,
          teamId: teamId, // Referencia al equipo
          slug: playerSlug
        });
      });

      await insertBatch.commit();
      console.log(`   🚀 ${players.length} jugadores cargados (Posiciones expandidas).`);

    } catch (error) {
      console.error(`   ❌ Error procesando ${teamName}:`, error);
    }
  }

  console.log('\n--- ✨ Proceso completado exitosamente ---');
}

seedDatabase().catch(console.error);
