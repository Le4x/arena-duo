# 🎮 ARENA - Guide d'Utilisation Complet

## 📋 Vue d'ensemble

ARENA est un système professionnel de Blind Test interactif pour événements live. Cette version est l'**interface frontend complète** développée avec React/TypeScript.

## 🎯 Fonctionnalités Implémentées

### ✅ Pages et Interfaces

1. **Page d'Accueil** (`/`)
   - Gestion de projets Arena
   - Liste des projets récents
   - Accès rapide aux fonctions principales

2. **Régie - Control Panel** (`/regie`)
   - Tableau de bord complet du maître de jeu
   - Gestion des questions en temps réel
   - Visualisation des scores
   - Lecteur audio intégré
   - Contrôle du timer et du buzzer
   - Affichage des équipes connectées

3. **Client Mobile** (`/client`)
   - Interface de connexion par équipe
   - 3 modes de réponse :
     - **Buzzer** : Premier à buzzer peut répondre
     - **QCM** : Choix multiples (A/B/C/D)
     - **Texte libre** : Saisie de réponse
   - Affichage du score en temps réel
   - Timer synchronisé

4. **Écran Public** (`/screen`)
   - Affichage grande taille pour projecteur
   - Question actuelle + timer
   - Classement des équipes en direct
   - Révélation des réponses
   - Statistiques de session

5. **Éditeur de Projet** (`/editor`)
   - Création/édition de manches
   - Ajout de questions (buzzer/QCM/texte)
   - Configuration des points et durées
   - Gestion des équipes
   - Paramètres globaux

### ✅ Système de State Management

- **GameContext** : Gestion centralisée de l'état
  - Projets et manches
  - Questions et réponses
  - Équipes et scores
  - Timer et buzzer
  - Session live

### ✅ Fonctionnalités Interactives

- ✅ Buzzer en temps réel (premier arrivé)
- ✅ Questions QCM avec choix multiples
- ✅ Questions texte libre
- ✅ Gestion automatique du timer
- ✅ Calcul des scores
- ✅ Classement en direct
- ✅ Interface entièrement en français

## 🚀 Utilisation

### Navigation entre les écrans

```
┌─────────────┐
│   Accueil   │ ──────> Créer/Ouvrir projet
└─────────────┘
       │
       ├──────> /editor   (Créer contenu)
       ├──────> /regie    (Contrôle live)
       ├──────> /client   (Joueurs)
       └──────> /screen   (Projection)
```

### Workflow typique

1. **Préparation** (Éditeur)
   - Créer des manches
   - Ajouter des questions
   - Configurer les équipes

2. **Session Live** (Régie)
   - Démarrer la session
   - Envoyer les questions
   - Gérer le timer
   - Valider les réponses
   - Afficher les scores

3. **Côté Joueurs** (Client)
   - Se connecter avec nom d'équipe
   - Attendre les questions
   - Buzzer / Répondre
   - Voir son score

4. **Affichage Public** (Écran)
   - Questions projetées
   - Timer visible
   - Classement actualisé

## 🎨 Design System

### Couleurs principales
- **Or (Gold)** : `hsl(45, 90%, 55%)` - Accent principal
- **Background** : `hsl(240, 10%, 8%)` - Fond sombre
- **Card** : `hsl(240, 8%, 12%)` - Cartes
- **Border** : `hsl(240, 6%, 20%)` - Bordures

### Animations
- `glow-pulse` : Effet lumineux sur le logo
- `slide-in` : Entrée fluide des éléments

## 📡 Architecture Technique

### État Global (GameContext)

```typescript
interface GameState {
  projectName: string;
  rounds: Round[];           // Manches
  teams: Team[];             // Équipes
  currentRoundId: string;    // Manche active
  currentQuestionId: string; // Question active
  isLive: boolean;           // Session en cours
  timerActive: boolean;      // Timer actif
  timeRemaining: number;     // Temps restant
  buzzerLocked: boolean;     // Buzzer verrouillé
  buzzerWinner: string;      // Équipe qui a buzzé
  answers: Record<...>;      // Réponses collectées
}
```

### Types de Questions

```typescript
type QuestionType = "buzzer" | "qcm" | "text";

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  choices?: string[];        // Pour QCM uniquement
  correctAnswer: string;
  points: number;
  duration: number;          // En secondes
  audioFile?: string;        // Fichier audio optionnel
}
```

## 🔧 Pour aller plus loin (Backend Tauri)

Cette version est le **frontend complet**. Pour une app desktop Tauri complète :

### Ce qui manque (à faire localement)

1. **Backend Rust** (`src-tauri/`)
   - WebSocket server (tokio-tungstenite)
   - SQLite database (rusqlite)
   - Gestion fichiers .ARE
   - Lecteur audio (rodio)

2. **Synchronisation Temps Réel**
   - Remplacer le mock WebSocket par vrai serveur
   - Broadcasting aux clients
   - Reconnexion automatique

3. **Persistance**
   - Fichiers .ARE (ZIP + SQLite + audio)
   - Auto-sauvegarde
   - Import/Export

### Structure Tauri Recommandée

```
arena/
├── src/              ← Frontend (DÉJÀ FAIT ✓)
│   ├── pages/
│   ├── contexts/
│   └── components/
│
├── src-tauri/        ← À créer
│   ├── src/
│   │   ├── main.rs
│   │   ├── websocket.rs
│   │   ├── database.rs
│   │   ├── audio.rs
│   │   └── file_manager.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
```

### Installation Tauri

```bash
# Installer Tauri CLI
npm install --save-dev @tauri-apps/cli
npm install @tauri-apps/api

# Initialiser
npx tauri init

# Développement
npm run tauri dev

# Build
npm run tauri build
```

## 📱 Test de l'Interface

### Dans Lovable (maintenant)
1. Naviguez entre `/`, `/editor`, `/regie`, `/client`, `/screen`
2. Testez les interactions
3. Créez des questions
4. Simulez une session

### En local avec Tauri (après setup)
1. Clonez depuis GitHub
2. Installez Rust et Tauri
3. `npm install`
4. `npm run tauri dev`

## 🎯 Prochaines Améliorations Possibles

- [ ] Import de fichiers audio MP3
- [ ] Gestion des cue points audio
- [ ] Statistiques détaillées par équipe
- [ ] Export des résultats (PDF/CSV)
- [ ] Mode replay
- [ ] Thèmes personnalisables
- [ ] Support multilingue

## 📞 Support

Pour toute question sur l'intégration Tauri ou le développement backend, consultez :
- [Tauri Docs](https://tauri.app)
- [Tokio WebSocket](https://tokio.rs)
- [Rusqlite](https://github.com/rusqlite/rusqlite)

---

**Version:** 1.0.0 (Frontend)  
**Auteur:** EvoluDream  
**Date:** Octobre 2025
