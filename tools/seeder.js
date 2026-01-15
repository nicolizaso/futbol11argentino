
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

      // 2. Delete existing players
      // Note: Assuming 'jugadores' is the collection name based on typical usage,
      // but the user prompt mentioned 'players' collection in "Mission Objective".
      // However, previous checks showed 'jugadores' might be it.
      // I'll check for both or stick to one. The user said "Update the players collection".
      // Let's assume the collection name is 'jugadores' based on the Spanish context of 'equipos'.
      // If the user meant the collection named 'players', they might have been translating.
      // Wait, the user said "Update the players collection".
      // Given the file structure uses Spanish (equipos), it is highly likely the collection is 'jugadores'.
      // But to be safe, I will allow passing the collection name as an argument or default to 'jugadores'.
      // Actually, looking at `check_db.js` (which I read earlier), it queries `jugadores`.
      const COLLECTION_NAME = 'jugadores';

      const existingPlayersQuery = await db.collection(COLLECTION_NAME)
        .where('teamId', '==', teamId)
        .get();

      if (!existingPlayersQuery.empty) {
        console.log(`Deleting ${existingPlayersQuery.size} existing players for ${teamName}...`);

        // Batch delete
        const batches = [];
        let batch = db.batch();
        let operationCount = 0;

        existingPlayersQuery.docs.forEach((doc) => {
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
        const newPlayerRef = db.collection(COLLECTION_NAME).doc();
        insertBatch.set(newPlayerRef, {
          ...player,
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
