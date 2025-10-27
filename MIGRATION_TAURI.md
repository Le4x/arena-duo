# 🚀 Migration vers Tauri / SQLite Local

## 📌 Vue d'ensemble

Ce guide décrit comment migrer ARENA de Supabase Cloud vers un système **100% local** avec Tauri + SQLite pour un fonctionnement **sans Internet** sur réseau local (LAN).

---

## 🎯 Objectif Final

- **Base de données locale** : SQLite au lieu de Supabase
- **WebSocket local** : Serveur WebSocket Rust pour la communication temps réel
- **Sans authentification** : Système simplifié de sélection d'équipes pré-inscrites
- **Réseau LAN** : Accessible sur IP locale (ex: `http://192.168.0.10:5173`)
- **Événement** : MusicArena le 21 février 2026 avec 30 équipes

---

## ✅ État Actuel (Préparation Terminée)

### Ce qui a été fait :
- ✅ Suppression complète de l'authentification Supabase
- ✅ Système de sélection d'équipes pré-inscrites
- ✅ Interface Client avec bouton "Mon équipe n'est pas dans la liste"
- ✅ QR Code pour rejoindre la session
- ✅ Code structuré pour faciliter la migration
- ✅ Routes simplifiées sans protection

### Architecture actuelle :
```
ARENA (React + TypeScript + Vite)
│
├── Frontend (✅ Prêt)
│   ├── Index : QR Code + Navigation
│   ├── Client : Sélection équipe + Jeu
│   ├── Regie : Contrôle du maître du jeu
│   ├── PublicScreen : Affichage projecteur
│   └── Editor : Création de contenu
│
└── Backend (⚠️ À migrer)
    ├── Supabase Cloud (actuel)
    └── Tauri + SQLite (cible)
```

---

## 🔧 Migration Step-by-Step

### Étape 1 : Installation Tauri

```bash
# Prérequis
# - Node.js 18+ (déjà installé)
# - Rust : https://rustup.rs/

# Installer Tauri CLI
npm install --save-dev @tauri-apps/cli@^1.5.0
npm install @tauri-apps/api@^1.5.0

# Initialiser Tauri
npx tauri init
```

**Configuration `tauri.conf.json` :**
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "ARENA",
    "version": "1.0.0"
  },
  "tauri": {
    "bundle": {
      "identifier": "com.arena.app",
      "icon": [
        "icons/icon.png"
      ]
    },
    "allowlist": {
      "all": false,
      "fs": {
        "all": true,
        "scope": ["$APPDATA/**", "$RESOURCE/**"]
      },
      "dialog": {
        "all": true
      },
      "http": {
        "all": false
      },
      "window": {
        "all": true
      }
    },
    "windows": [
      {
        "title": "ARENA",
        "width": 1280,
        "height": 720,
        "resizable": true,
        "fullscreen": false
      }
    ]
  }
}
```

---

### Étape 2 : SQLite Local

**Fichier `src-tauri/src/database.rs` :**

```rust
use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Team {
    pub id: String,
    pub name: String,
    pub color: String,
    pub score: i32,
    pub jokers_remaining: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Question {
    pub id: String,
    pub round_id: String,
    pub type_: String,
    pub text: String,
    pub choices: Option<Vec<String>>,
    pub correct_answer: String,
    pub points: i32,
    pub duration: i32,
}

pub fn init_database() -> Result<Connection> {
    let conn = Connection::open("arena.db")?;
    
    // Create tables
    conn.execute(
        "CREATE TABLE IF NOT EXISTS teams (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            jokers_remaining INTEGER DEFAULT 3
        )",
        [],
    )?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS questions (
            id TEXT PRIMARY KEY,
            round_id TEXT NOT NULL,
            type TEXT NOT NULL,
            text TEXT NOT NULL,
            choices TEXT,
            correct_answer TEXT NOT NULL,
            points INTEGER DEFAULT 100,
            duration INTEGER DEFAULT 30
        )",
        [],
    )?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS game_sessions (
            id TEXT PRIMARY KEY,
            project_name TEXT NOT NULL,
            is_live INTEGER DEFAULT 0,
            current_question_id TEXT,
            timer_active INTEGER DEFAULT 0,
            time_remaining INTEGER DEFAULT 0
        )",
        [],
    )?;
    
    Ok(conn)
}

#[tauri::command]
pub fn get_teams() -> Result<Vec<Team>, String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT * FROM teams").map_err(|e| e.to_string())?;
    
    let teams = stmt.query_map([], |row| {
        Ok(Team {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            score: row.get(3)?,
            jokers_remaining: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;
    
    teams.collect::<Result<Vec<_>>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_team(name: String, color: String) -> Result<String, String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    
    conn.execute(
        "INSERT INTO teams (id, name, color) VALUES (?1, ?2, ?3)",
        [&id, &name, &color],
    ).map_err(|e| e.to_string())?;
    
    Ok(id)
}
```

---

### Étape 3 : WebSocket Server Local

**Fichier `src-tauri/src/websocket.rs` :**

```rust
use tokio::net::TcpListener;
use tokio_tungstenite::{accept_async, tungstenite::Message};
use futures_util::{SinkExt, StreamExt};
use std::sync::Arc;
use tokio::sync::Mutex;
use serde_json::json;

type Clients = Arc<Mutex<Vec<tokio_tungstenite::WebSocketStream<tokio::net::TcpStream>>>>;

pub async fn start_websocket_server(port: u16) -> Result<(), Box<dyn std::error::Error>> {
    let addr = format!("0.0.0.0:{}", port);
    let listener = TcpListener::bind(&addr).await?;
    println!("WebSocket server listening on {}", addr);
    
    let clients: Clients = Arc::new(Mutex::new(Vec::new()));
    
    loop {
        let (stream, _) = listener.accept().await?;
        let clients = Arc::clone(&clients);
        
        tokio::spawn(async move {
            let ws_stream = accept_async(stream).await.expect("Error during WebSocket handshake");
            let (mut write, mut read) = ws_stream.split();
            
            // Add client to list
            clients.lock().await.push(ws_stream);
            
            // Handle messages
            while let Some(msg) = read.next().await {
                match msg {
                    Ok(Message::Text(text)) => {
                        println!("Received: {}", text);
                        
                        // Broadcast to all clients
                        let clients = clients.lock().await;
                        for client in clients.iter() {
                            if let Err(e) = client.send(Message::Text(text.clone())).await {
                                eprintln!("Error sending message: {}", e);
                            }
                        }
                    }
                    Ok(Message::Close(_)) => break,
                    Err(e) => {
                        eprintln!("WebSocket error: {}", e);
                        break;
                    }
                    _ => {}
                }
            }
        });
    }
}

#[tauri::command]
pub async fn broadcast_message(message: String) -> Result<(), String> {
    // Logic to broadcast to all connected clients
    Ok(())
}
```

---

### Étape 4 : Commandes Tauri

**Fichier `src-tauri/src/main.rs` :**

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod websocket;

use tauri::Manager;

#[tauri::command]
fn get_local_ip() -> String {
    if let Ok(addrs) = local_ip_address::local_ip() {
        addrs.to_string()
    } else {
        "127.0.0.1".to_string()
    }
}

fn main() {
    // Initialize database
    database::init_database().expect("Failed to initialize database");
    
    tauri::Builder::default()
        .setup(|app| {
            // Start WebSocket server
            let handle = app.handle();
            tauri::async_runtime::spawn(async move {
                websocket::start_websocket_server(3000).await.ok();
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_local_ip,
            database::get_teams,
            database::add_team,
            websocket::broadcast_message
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

### Étape 5 : Adapter le Frontend

**Remplacer les appels Supabase par les commandes Tauri :**

```typescript
// Avant (Supabase)
import { supabase } from "@/integrations/supabase/client";
const { data } = await supabase.from('teams').select();

// Après (Tauri)
import { invoke } from '@tauri-apps/api/tauri';
const teams = await invoke('get_teams');

// WebSocket local au lieu de Supabase Realtime
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

---

## 🌐 Configuration Réseau Local

### Accès sur IP Locale

1. **Trouver l'IP du PC** :
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

2. **Configurer Vite** (`vite.config.ts`) :
```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0', // Écouter sur toutes les interfaces
    port: 5173,
    strictPort: true,
  },
});
```

3. **Accès depuis les mobiles** :
   - PC : `http://192.168.0.10:5173`
   - Mobiles sur le même Wi-Fi : Scanner le QR Code qui pointe vers cette IP

---

## 📱 QR Code Dynamique

Le code actuel génère déjà le QR Code automatiquement avec `window.location.origin`, ce qui fonctionnera parfaitement en local :

```tsx
// src/pages/Index.tsx
const clientUrl = `${window.location.origin}/client`;
<QRCodeSVG value={clientUrl} size={200} />
```

Quand vous lancez sur `http://192.168.0.10:5173`, le QR Code pointera automatiquement vers cette adresse.

---

## 🎮 Workflow Final (21 février 2026)

### Jour J :

1. **Démarrage** :
```bash
npm run tauri dev
# Ou pour la version compilée :
# ./ARENA.exe (Windows) ou ./ARENA.app (Mac)
```

2. **Configuration réseau** :
   - Activer le Wi-Fi local sur le PC
   - Noter l'IP locale (ex: `192.168.0.10`)
   - Les mobiles se connectent au même Wi-Fi

3. **Inscription des équipes** :
   - Depuis l'Éditeur, pré-créer les 30 équipes
   - Ajouter les manches et questions

4. **Lancement de la partie** :
   - Page d'accueil : afficher le QR Code sur un écran
   - Les équipes scannent et sélectionnent leur nom
   - Régie : contrôle en temps réel
   - Écran Public : projecteur avec questions + classement

---

## 📦 Build Final

```bash
# Compiler l'application
npm run tauri build

# Fichiers de sortie :
# Windows : src-tauri/target/release/ARENA.exe
# Mac : src-tauri/target/release/bundle/macos/ARENA.app
# Linux : src-tauri/target/release/arena
```

L'application compilée :
- Embarque SQLite
- Lance le serveur WebSocket automatiquement
- Fonctionne sans installation supplémentaire
- Portable sur clé USB

---

## ⚠️ Points d'Attention

### Pour le 21 février 2026 :

1. **Tests préalables** : Tester avec 5-10 équipes en conditions réelles
2. **Batterie** : PC branché sur secteur
3. **Wi-Fi stable** : Routeur dédié si possible
4. **Backup** : Sauvegarder la base SQLite régulièrement
5. **Plan B** : Avoir une version simplifiée hors ligne

### Limitations actuelles (avec Supabase) :

- ⚠️ Nécessite Internet
- ⚠️ Latence possible
- ⚠️ Coût potentiel si dépassement quota

### Avantages après migration :

- ✅ 100% local, aucune connexion Internet nécessaire
- ✅ Latence minimale (<10ms)
- ✅ Pas de coût d'hébergement
- ✅ Données totalement sous contrôle
- ✅ Performances optimales pour 30 équipes

---

## 🆘 Support

### Ressources :
- [Documentation Tauri](https://tauri.app/)
- [Rusqlite](https://github.com/rusqlite/rusqlite)
- [Tokio WebSocket](https://docs.rs/tokio-tungstenite/)

### Aide :
Si besoin d'assistance pour la migration, contacter le développeur avec :
- Description du problème
- Logs d'erreur
- Configuration système

---

**Version :** 1.0.0 (Migration Guide)  
**Auteur :** Équipe ARENA  
**Date :** 27 octobre 2025  
**Cible :** MusicArena • 21 février 2026 🎵
