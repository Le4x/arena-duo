import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  Users,
  Trophy,
  Radio,
  Settings,
  List,
  Monitor,
} from "lucide-react";

const Regie = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-arena-border bg-arena-bg-secondary">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gold">
              ARENA <span className="text-sm text-muted-foreground ml-2">• Régie</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              MusicArena #1 • Manche {currentRound}/5
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">
              <Monitor className="w-4 h-4 mr-2" />
              Écran Public
            </Button>
            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-80 border-r border-arena-border bg-arena-bg-secondary p-6">
          <div className="space-y-6">
            {/* Teams Summary */}
            <Card className="p-4 bg-card border-arena-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold" />
                  Équipes Connectées
                </h3>
                <span className="text-2xl font-bold text-gold">24</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Connectez-vous sur : <span className="text-gold">192.168.1.100:3000</span>
              </p>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Actions Rapides
              </h3>
              <Button
                variant={isPlaying ? "secondary" : "default"}
                className="w-full justify-start"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Mettre en Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Lancer la Manche
                  </>
                )}
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <SkipForward className="w-4 h-4 mr-2" />
                Question Suivante
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Trophy className="w-4 h-4 mr-2" />
                Afficher Classement
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Radio className="w-4 h-4 mr-2" />
                Buzzer Mode
              </Button>
            </div>

            {/* Rounds */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Manches
              </h3>
              {[1, 2, 3, 4, 5].map((round) => (
                <Button
                  key={round}
                  variant={currentRound === round ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCurrentRound(round)}
                >
                  <List className="w-4 h-4 mr-2" />
                  Manche {round}
                  {currentRound === round && (
                    <span className="ml-auto text-xs">En cours</span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="scores">Scores</TabsTrigger>
              <TabsTrigger value="audio">Lecteur Audio</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4">
              <Card className="p-6 bg-card border-arena-border">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Question 1 - Blind Test Audio
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Fichier audio :</p>
                    <p className="font-medium text-foreground">01_chanson_mystere.mp3</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Type</p>
                      <p className="font-medium text-foreground">Buzzer</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Points</p>
                      <p className="font-medium text-gold">100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Durée</p>
                      <p className="font-medium text-foreground">30s</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Statut</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold/20 text-gold">
                        Prêt
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Envoyer Question
                    </Button>
                    <Button variant="secondary">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Prévisualiser
                    </Button>
                  </div>
                </div>
              </Card>

              {/* More questions would be listed here */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Ajoutez plus de questions dans l'éditeur de projet</p>
              </div>
            </TabsContent>

            <TabsContent value="scores" className="space-y-4">
              <Card className="p-6 bg-card border-arena-border">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  Classement Actuel
                </h3>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: "Les Rockeurs", score: 450 },
                    { rank: 2, name: "Team Melody", score: 420 },
                    { rank: 3, name: "Sound Masters", score: 380 },
                  ].map((team) => (
                    <div
                      key={team.rank}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            team.rank === 1
                              ? "bg-gold text-background"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          {team.rank}
                        </div>
                        <span className="font-semibold text-foreground">
                          {team.name}
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-gold">
                        {team.score}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <Card className="p-6 bg-card border-arena-border">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  Lecteur Audio
                </h3>
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Piste Actuelle
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      01_chanson_mystere.mp3
                    </p>
                  </div>

                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-gold h-full w-1/3 transition-all duration-300"></div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <Button size="lg" variant="secondary">
                      <SkipForward className="w-5 h-5 rotate-180" />
                    </Button>
                    <Button size="lg" className="w-16 h-16">
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </Button>
                    <Button size="lg" variant="secondary">
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-gold h-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Regie;
