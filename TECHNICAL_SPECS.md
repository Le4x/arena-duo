# 🔧 ARENA - Spécifications Techniques

## Architecture Globale

### Stack Frontend (IMPLÉMENTÉ ✓)

```
React 18 + TypeScript
├── Vite (Build tool)
├── TailwindCSS (Styling)
├── Shadcn/ui (Components)
├── React Router (Navigation)
├── React Context (State management)
└── Lucide React (Icons)
```

### Stack Backend (À IMPLÉMENTER)

```
Tauri + Rust
├── tokio (Async runtime)
├── tokio-tungstenite (WebSocket)
├── rusqlite (SQLite)
├── rodio (Audio playback)
├── zip (Archive .ARE)
└── serde (Serialization)
```

## Structure des Données

### Base de données SQLite

```sql
-- Table: projects
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    max_teams INTEGER DEFAULT 30,
    settings TEXT -- JSON
);

-- Table: rounds
CREATE TABLE rounds (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    order_num INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Table: questions
CREATE TABLE questions (
    id TEXT PRIMARY KEY,
    round_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('buzzer', 'qcm', 'text')),
    text TEXT NOT NULL,
    choices TEXT, -- JSON array pour QCM
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 100,
    duration INTEGER DEFAULT 30,
    audio_file TEXT,
    order_num INTEGER NOT NULL,
    FOREIGN KEY (round_id) REFERENCES rounds(id)
);

-- Table: teams
CREATE TABLE teams (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    connection_id TEXT,
    connected_at INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Table: responses
CREATE TABLE responses (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    answer TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    is_correct BOOLEAN DEFAULT 0,
    points_awarded INTEGER DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Table: sessions
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    current_round_id TEXT,
    current_question_id TEXT,
    state TEXT, -- JSON
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

## Format de Fichier .ARE

### Structure du fichier

```
project_name.ARE (ZIP)
│
├── manifest.json
├── arena.db (SQLite)
├── checksums.json
│
└── media/
    ├── audio/
    │   ├── track_001.mp3
    │   ├── track_002.mp3
    │   └── ...
    └── images/ (optionnel)
        └── ...
```

### manifest.json

```json
{
  "version": "1.0",
  "format": "arena",
  "project": {
    "id": "uuid-v4",
    "name": "MusicArena #1",
    "created_at": "2025-10-26T10:00:00Z",
    "updated_at": "2025-10-26T12:30:00Z",
    "author": "EvoluDream"
  },
  "metadata": {
    "rounds": 5,
    "questions": 50,
    "max_teams": 30,
    "audio_tracks": 25
  },
  "compatibility": {
    "min_version": "1.0.0",
    "max_version": "1.9.9"
  }
}
```

### checksums.json

```json
{
  "manifest.json": "sha256_hash",
  "arena.db": "sha256_hash",
  "media/audio/track_001.mp3": "sha256_hash",
  ...
}
```

## Protocole WebSocket

### Format des Messages

#### Client → Serveur

```typescript
// Connexion d'une équipe
{
  type: "team.join",
  data: {
    teamName: string,
    color?: string
  }
}

// Buzzer
{
  type: "buzzer.press",
  data: {
    teamId: string,
    timestamp: number
  }
}

// Réponse QCM
{
  type: "answer.qcm",
  data: {
    teamId: string,
    questionId: string,
    answer: string,
    timestamp: number
  }
}

// Réponse texte
{
  type: "answer.text",
  data: {
    teamId: string,
    questionId: string,
    answer: string,
    timestamp: number
  }
}

// Heartbeat
{
  type: "ping",
  timestamp: number
}
```

#### Serveur → Clients

```typescript
// Nouvelle question
{
  type: "question.start",
  data: {
    questionId: string,
    roundId: string,
    type: "buzzer" | "qcm" | "text",
    text: string,
    choices?: string[],
    points: number,
    duration: number
  }
}

// Mise à jour timer
{
  type: "timer.update",
  data: {
    timeRemaining: number
  }
}

// Buzzer verrouillé
{
  type: "buzzer.locked",
  data: {
    winnerId: string,
    winnerName: string,
    timestamp: number
  }
}

// Réponse révélée
{
  type: "answer.reveal",
  data: {
    questionId: string,
    correctAnswer: string,
    winners: string[] // IDs des équipes gagnantes
  }
}

// Mise à jour scores
{
  type: "scores.update",
  data: {
    teams: Array<{
      id: string,
      name: string,
      score: number,
      rank: number
    }>
  }
}

// État de connexion
{
  type: "connection.status",
  data: {
    connectedTeams: number,
    totalTeams: number
  }
}

// Pong
{
  type: "pong",
  timestamp: number
}
```

## Gestion Audio (Rust)

### API Audio Player

```rust
pub struct AudioPlayer {
    current_track: Option<String>,
    volume: f32,
    position: Duration,
    state: PlaybackState,
}

impl AudioPlayer {
    pub fn new() -> Self;
    pub fn load(&mut self, path: &Path) -> Result<()>;
    pub fn play(&mut self) -> Result<()>;
    pub fn pause(&mut self) -> Result<()>;
    pub fn stop(&mut self) -> Result<()>;
    pub fn seek(&mut self, position: Duration) -> Result<()>;
    pub fn set_volume(&mut self, volume: f32) -> Result<()>;
    pub fn get_position(&self) -> Duration;
    pub fn get_duration(&self) -> Duration;
}

pub enum PlaybackState {
    Playing,
    Paused,
    Stopped,
}
```

### Cue Points

```rust
pub struct CuePoint {
    pub name: String,
    pub position: Duration,
    pub cue_type: CueType,
}

pub enum CueType {
    Start,
    End,
    Loop,
    Marker,
}

impl AudioPlayer {
    pub fn add_cue_point(&mut self, cue: CuePoint);
    pub fn remove_cue_point(&mut self, name: &str);
    pub fn jump_to_cue(&mut self, name: &str) -> Result<()>;
}
```

## API Tauri Commands

### Commandes exposées au frontend

```typescript
// Gestion de projet
invoke<void>('create_project', { name: string })
invoke<Project>('load_project', { path: string })
invoke<void>('save_project')
invoke<void>('export_project', { path: string })

// Gestion WebSocket
invoke<string>('start_websocket_server', { port: number })
invoke<void>('stop_websocket_server')
invoke<ServerInfo>('get_server_info')

// Broadcast
invoke<void>('broadcast_message', { message: object })
invoke<void>('send_to_team', { teamId: string, message: object })

// Audio
invoke<void>('audio_load', { path: string })
invoke<void>('audio_play')
invoke<void>('audio_pause')
invoke<void>('audio_stop')
invoke<void>('audio_seek', { position: number })
invoke<number>('audio_get_position')

// Base de données
invoke<Round[]>('db_get_rounds')
invoke<Question[]>('db_get_questions', { roundId: string })
invoke<Team[]>('db_get_teams')
invoke<void>('db_update_score', { teamId: string, points: number })
```

## Configuration Tauri

### tauri.conf.json

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
    "allowlist": {
      "all": false,
      "fs": {
        "all": true,
        "scope": ["$APP/*", "$RESOURCE/*"]
      },
      "dialog": {
        "open": true,
        "save": true
      },
      "window": {
        "all": false,
        "create": true,
        "center": true,
        "close": true
      }
    },
    "windows": [
      {
        "title": "ARENA - Régie",
        "width": 1280,
        "height": 800,
        "resizable": true,
        "fullscreen": false
      }
    ]
  }
}
```

## Performance & Optimisation

### Objectifs

- **Latence WebSocket** : < 50ms
- **Temps de réponse buzzer** : < 100ms
- **FPS écran public** : 60 fps
- **Charge CPU** : < 30% pendant session
- **Mémoire** : < 500 MB

### Stratégies

1. **WebSocket**
   - Message batching
   - Binary protocol optionnel
   - Compression gzip

2. **Audio**
   - Preload tracks
   - Buffer management
   - Crossfade optimization

3. **Database**
   - Prepared statements
   - Index sur clés fréquentes
   - Connection pooling

4. **Frontend**
   - React.memo pour composants
   - Virtual scrolling pour listes
   - Lazy loading des images

## Sécurité

### Validation

- Sanitisation des inputs
- Rate limiting (10 req/sec/client)
- Maximum message size (1MB)

### Isolation

- WebSocket en local uniquement
- Pas d'accès réseau externe
- Sandbox Tauri activé

## Tests

### Unit Tests (Rust)

```bash
cargo test
```

### E2E Tests (Frontend)

```bash
npm run test:e2e
```

### Load Testing (WebSocket)

- 30 clients simultanés
- 100 messages/sec
- Durée: 30 minutes

---

**Dernière mise à jour:** Octobre 2025  
**Version specs:** 1.0
