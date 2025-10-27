# 🎮 ARENA - Version Sans Authentification

## ✅ Modifications Effectuées

### Système Simplifié
- ❌ **Authentification supprimée** : Plus de login/signup
- ✅ **Sélection d'équipes** : Les joueurs choisissent leur équipe dans une liste
- ✅ **QR Code** : Pour rejoindre facilement la session
- ✅ **Bouton de secours** : "Mon équipe n'est pas dans la liste"
- ✅ **Routes ouvertes** : Pas de protection par rôle

---

## 🎯 Workflow Utilisateur

### 1. Page d'Accueil (`/`)
- Affiche un **QR Code** pour rejoindre
- 4 boutons d'accès rapide :
  - **Régie** : Contrôle du jeu
  - **Écran Public** : Affichage projecteur
  - **Client Mobile** : Interface joueurs
  - **Éditeur** : Création de contenu

### 2. Pré-inscription des Équipes
**Dans l'Éditeur (`/editor`)** :
- Créer les équipes à l'avance :
  - Les Champions
  - Team Rocket
  - Les Invincibles
  - etc.

### 3. Les Joueurs Rejoignent (`/client`)

#### A. Scanner le QR Code
Les joueurs scannent le QR code affiché sur la page d'accueil

#### B. Sélectionner l'Équipe
Interface de sélection :
```
┌─────────────────────────────┐
│    🎮 ARENA                 │
│    Sélectionnez votre équipe│
│                             │
│  ┌─────────────────────┐   │
│  │ Choisir une équipe...│   │
│  │  ▼ Les Champions    │   │
│  │    Team Rocket      │   │
│  │    Les Invincibles  │   │
│  └─────────────────────┘   │
│                             │
│  [Mon équipe n'est pas      │
│   dans la liste]            │
└─────────────────────────────┘
```

#### C. Équipe Manquante ?
Si l'équipe n'apparaît pas :
1. Cliquer sur "Mon équipe n'est pas dans la liste"
2. Saisir le nom de l'équipe
3. Bouton "Créer"

**Système de sauvegarde** :
- Le choix d'équipe est stocké dans `localStorage`
- Pas besoin de se reconnecter si on ferme/rouvre l'app

---

## 🔧 Fonctionnement Technique

### Gestion des Équipes

**Avant (avec auth)** :
```typescript
// Liée à un utilisateur
const myTeam = teams.find(t => t.user_id === user?.id);
```

**Maintenant (sans auth)** :
```typescript
// Sélectionnée localement
const selectedTeamId = localStorage.getItem("arena_selected_team_id");
const myTeam = teams.find(t => t.id === selectedTeamId);
```

### Routes Simplifiées

```tsx
// App.tsx - Plus de ProtectedRoute
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/regie" element={<Regie />} />
  <Route path="/client" element={<Client />} />
  <Route path="/screen" element={<PublicScreen />} />
  <Route path="/editor" element={<Editor />} />
</Routes>
```

---

## 📱 Utilisation Mobile

### Étape 1 : Connexion Wi-Fi
Les joueurs se connectent au **même réseau Wi-Fi** que le PC régie.

### Étape 2 : Scanner le QR Code
- Ouvrir l'appareil photo du téléphone
- Scanner le QR code affiché sur l'écran d'accueil
- Le navigateur s'ouvre automatiquement sur `/client`

### Étape 3 : Sélection
- Choisir son équipe dans la liste
- Ou créer une nouvelle équipe si absente

### Étape 4 : Jouer !
- Attendre que le maître du jeu lance une question
- Buzzer / Répondre selon le type de question
- Voir son score en temps réel

---

## 🎮 Interface Régie

### Pas de Login Requis
- Accès direct à la régie : `/regie`
- Contrôle complet sans mot de passe
- ⚠️ **Note** : Réservé au maître du jeu sur le PC principal

### Fonctions Disponibles
- Lancer une question
- Démarrer/arrêter le timer
- Valider les réponses
- Gérer les scores
- Afficher le classement

---

## 🎯 Prochaine Étape : Migration Tauri

Pour un système **100% local sans Internet**, voir :
👉 **[MIGRATION_TAURI.md](./MIGRATION_TAURI.md)**

---

## 🆘 FAQ

### Q : Que se passe-t-il si je ferme mon navigateur ?
**R :** Votre sélection d'équipe est sauvegardée dans `localStorage`. Rouvrez `/client` et vous serez reconnecté automatiquement.

### Q : Plusieurs personnes peuvent-elles rejoindre la même équipe ?
**R :** Oui, plusieurs appareils peuvent sélectionner la même équipe. Ils partagent le score mais peuvent répondre indépendamment.

### Q : Peut-on modifier le nom d'une équipe après création ?
**R :** Actuellement non. Il faut créer une nouvelle équipe ou modifier directement dans l'éditeur.

### Q : Le système fonctionne-t-il sans Internet ?
**R :** **Partiellement**. Le frontend fonctionne, mais Supabase nécessite Internet. Pour un système 100% local, migrer vers Tauri (voir guide de migration).

---

**Version :** 2.0.0 (Sans Auth)  
**Date :** 27 octobre 2025  
**Prêt pour :** MusicArena • 21 février 2026 🎵
