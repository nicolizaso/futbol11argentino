# Data Seeder Tool

This tool is used to update the player data in the Firestore database.

## Prerequisites

1.  **Node.js**: Ensure Node.js is installed.
2.  **Service Account Key**: You need a Firebase Service Account key file.
    *   Go to Project Settings > Service accounts in the Firebase Console.
    *   Generate a new private key.
    *   Save the file as `serviceAccountKey.json` in this `tools/` directory.

## Setup

Navigate to the project root and ensure dependencies are installed (specifically `firebase-admin`). If not installed in the root, you may need to install it locally in this folder or the root.

```bash
npm install firebase-admin
```

## Usage

Run the seeder script from the `tools` directory or project root:

```bash
node tools/seeder.js
```

## Configuration

*   **Data Source**: `tools/players_data.json` contains the list of teams and players to update.
*   **Collection**: The script targets the `jugadores` collection in Firestore.
*   **Team Lookup**: It looks up teams in the `equipos` collection by their `nombre` field matching `teamName` in the JSON.
