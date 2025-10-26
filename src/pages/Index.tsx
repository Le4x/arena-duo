import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FolderOpen, Play } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [recentProjects] = useState([
    { id: 1, name: "Blind Test Soirée #1", date: "2025-10-20", teams: 15 },
    { id: 2, name: "MusicArena Corporate", date: "2025-10-18", teams: 22 },
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-arena-border bg-arena-bg-secondary">
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-4xl font-bold text-gold animate-glow-pulse">
            ARENA
          </h1>
          <p className="text-muted-foreground mt-1">
            Système professionnel de Blind Test interactif
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Action Cards */}
          <Card className="p-8 bg-card border-arena-border hover:border-gold transition-all duration-300 cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Nouveau Projet
              </h3>
              <p className="text-sm text-muted-foreground">
                Créer un nouveau spectacle Arena
              </p>
              <Button 
                variant="default" 
                className="w-full mt-4"
                onClick={() => navigate("/regie")}
              >
                Créer
              </Button>
            </div>
          </Card>

          <Card className="p-8 bg-card border-arena-border hover:border-gold transition-all duration-300 cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-secondary transition-colors">
                <FolderOpen className="w-10 h-10 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Ouvrir Projet
              </h3>
              <p className="text-sm text-muted-foreground">
                Charger un fichier .ARE existant
              </p>
              <Button variant="secondary" className="w-full mt-4">
                Parcourir
              </Button>
            </div>
          </Card>

          <Card className="p-8 bg-card border-arena-border hover:border-gold transition-all duration-300 cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Play className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Session Live
              </h3>
              <p className="text-sm text-muted-foreground">
                Lancer une session multijoueur
              </p>
              <Button variant="secondary" className="w-full mt-4">
                Démarrer
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Projects */}
        <div className="mt-16 max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Projets Récents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProjects.map((project) => (
              <Card
                key={project.id}
                className="p-6 bg-card border-arena-border hover:border-gold transition-all duration-300 cursor-pointer group animate-slide-in"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.date} • {project.teams} équipes
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => navigate("/regie")}
                  >
                    Ouvrir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-arena-border bg-arena-bg-secondary py-6">
        <div className="container mx-auto px-8 text-center text-sm text-muted-foreground">
          ARENA Live 1.0 • Système de Blind Test Professionnel • © 2025 EvoluDream
        </div>
      </footer>
    </div>
  );
};

export default Index;
