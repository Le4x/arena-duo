import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Users, Settings, Play } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const Index = () => {
  const navigate = useNavigate();
  const clientUrl = `${window.location.origin}/client`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-glow-pulse">
            🎮 ARENA
          </h1>
          <p className="text-xl text-muted-foreground">
            Système de Blind Test Interactif Professionnel
          </p>
        </div>

        {/* QR Code Section */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">QR Code pour les Équipes</CardTitle>
            <CardDescription className="text-center">
              Les joueurs scannent ce code pour rejoindre la session
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={clientUrl} size={200} />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {clientUrl}
            </p>
          </CardContent>
        </Card>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Régie */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/regie")}>
            <CardHeader>
              <Settings className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>Régie</CardTitle>
              <CardDescription>
                Contrôle du jeu en direct
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default">
                Ouvrir la Régie
              </Button>
            </CardContent>
          </Card>

          {/* Écran Public */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/screen")}>
            <CardHeader>
              <Monitor className="w-12 h-12 mb-4 text-accent" />
              <CardTitle>Écran Public</CardTitle>
              <CardDescription>
                Affichage pour le projecteur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Afficher l'Écran
              </Button>
            </CardContent>
          </Card>

          {/* Interface Client */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/client")}>
            <CardHeader>
              <Users className="w-12 h-12 mb-4 text-secondary" />
              <CardTitle>Client Mobile</CardTitle>
              <CardDescription>
                Interface pour les joueurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">
                Rejoindre
              </Button>
            </CardContent>
          </Card>

          {/* Éditeur */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/editor")}>
            <CardHeader>
              <Play className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>Éditeur</CardTitle>
              <CardDescription>
                Créer et modifier le contenu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default">
                Éditer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions de Démarrage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                Préparez votre contenu
              </h3>
              <p className="text-muted-foreground ml-8">
                Utilisez l'<strong>Éditeur</strong> pour créer vos manches, questions et pré-inscrire les équipes.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                Configurez l'affichage
              </h3>
              <p className="text-muted-foreground ml-8">
                Ouvrez l'<strong>Écran Public</strong> sur le projecteur pour afficher les questions et le classement.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                Les équipes rejoignent
              </h3>
              <p className="text-muted-foreground ml-8">
                Les joueurs scannent le <strong>QR Code</strong> ci-dessus pour accéder à l'interface Client et sélectionner leur équipe.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                Lancez la partie
              </h3>
              <p className="text-muted-foreground ml-8">
                Depuis la <strong>Régie</strong>, démarrez la session et contrôlez le déroulement du jeu en temps réel.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>🎵 MusicArena • Système Local • Sans Authentification</p>
          <p className="mt-2">Prêt pour le 21 février 2026 🚀</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
