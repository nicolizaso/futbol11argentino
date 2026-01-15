const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account key
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: serviceAccountKey.json not found in tools/ directory.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load player data
const dataPath = path.join(__dirname, 'players_data.json');
if (!fs.existsSync(dataPath)) {
  console.error('Error: players_data.json not found in tools/ directory.');
  process.exit(1);
}
const playersData = require(dataPath);

async function updatePlayers() {
  console.log('Starting player update process...');

  for (const teamData of playersData) {
    const { teamName, players } = teamData;
    console.log(`Processing team: ${teamName}`);

    try {
      // 1. Find team ID
      const equiposSnapshot = await db.collection('equipos')
        .where('nombre', '==', teamName)
        .limit(1)
        .get();

      if (equiposSnapshot.empty) {
        console.warn(`Team not found: ${teamName}. Skipping...`);
        continue;
      }

      const teamDoc = equiposSnapshot.docs[0];
      const teamId = teamDoc.id;
      console.log(`Found team ${teamName} with ID: ${teamId}`);

      // 2. Target Subcollection: Jugadores/{teamName}/jugadores
      // Note: User specified "Jugadores (Collection) -> [teamName] (Document) -> jugadores (Subcollection)"
      const rootCollection = 'Jugadores';
      const subCollection = 'jugadores';

      const teamPlayersRef = db.collection(rootCollection).doc(teamName).collection(subCollection);
      const existingDocs = await teamPlayersRef.get();

      if (!existingDocs.empty) {
        console.log(`Deleting ${existingDocs.size} existing players for ${teamName}...`);

        // Batch delete
        const batches = [];
        let batch = db.batch();
        let operationCount = 0;

        existingDocs.docs.forEach((doc) => {
          batch.delete(doc.ref);
          operationCount++;

          if (operationCount === 499) {
            batches.push(batch.commit());
            batch = db.batch();
            operationCount = 0;
          }
        });

        if (operationCount > 0) {
          batches.push(batch.commit());
        }

        await Promise.all(batches);
        console.log(`Deleted existing players.`);
      } else {
        console.log(`No existing players found for ${teamName}.`);
      }

      // 3. Insert new players
      console.log(`Inserting ${players.length} new players for ${teamName}...`);

      const insertBatches = [];
      let insertBatch = db.batch();
      let insertCount = 0;

      for (const player of players) {
        const newPlayerRef = teamPlayersRef.doc();
        // Map fields according to requirements
        // name -> nombre
        // positions -> posicion (array)
        // teamId -> teamId
        // teamName -> equipo

        insertBatch.set(newPlayerRef, {
          nombre: player.name,
          posicion: player.positions, // Storing array as requested
          equipo: teamName,
          teamId: teamId
        });
        insertCount++;

        if (insertCount === 499) {
          insertBatches.push(insertBatch.commit());
          insertBatch = db.batch();
          insertCount = 0;
        }
      }

      if (insertCount > 0) {
        insertBatches.push(insertBatch.commit());
      }

      await Promise.all(insertBatches);
      console.log(`Successfully inserted new players for ${teamName}.`);

    } catch (error) {
      console.error(`Error processing team ${teamName}:`, error);
    }
  }

  console.log('Player update process completed.');
}

updatePlayers().catch(console.error);
