import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Eye,
  Edit,
  QrCode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGameSession } from "@/hooks/useGameSession";
import { useGameActions } from "@/hooks/useGameActions";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Regie = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showQRCode, setShowQRCode] = useState(false);
  const [answersData, setAnswersData] = useState<Record<string, any>>({});
  
  const { session, teams, rounds, questions, loading } = useGameSession();
  const {
    setCurrentQuestion,
    startTimer,
    stopTimer,
    updateScore,
    startLiveSession,
    stopLiveSession,
  } = useGameActions(session?.id);

  const currentRound = rounds.find((r) => r.id === session?.current_round_id);
  const currentQuestion = questions.find((q) => q.id === session?.current_question_id);
  const currentRoundQuestions = questions.filter((q) => q.round_id === currentRound?.id);

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  
  const clientUrl = `${window.location.origin}/client?session=${session?.id || ""}`;

  const handleStartQuestion = async (questionId: string) => {
    if (!currentRound) return;
    await setCurrentQuestion(questionId, currentRound.id);
    await startTimer();
    toast({
      title: "Question envoyée",
      description: "Les joueurs peuvent maintenant répondre",
    });
  };

  const handleToggleLive = async () => {
    if (session?.is_live) {
      await stopLiveSession();
      toast({ title: "Session mise en pause" });
    } else {
      await startLiveSession();
      toast({ title: "Session démarrée", description: "Les joueurs peuvent rejoindre" });
    }
  };

  const handleOpenScreen = () => {
    window.open(`/screen?session=${session?.id || ""}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gold mb-4">Chargement...</h1>
        </div>
      </div>
    );
  }

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
              {session?.project_name} • Manche {currentRound?.order_number || 1}/{rounds.length}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={handleOpenScreen}>
              <Monitor className="w-4 h-4 mr-2" />
              Écran Public
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate("/editor")}>
              <Edit className="w-4 h-4 mr-2" />
              Éditeur
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
            {/* Connection Info */}
            <Card className="p-4 bg-card border-arena-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold" />
                  Équipes Connectées
                </h3>
                <span className="text-2xl font-bold text-gold">{teams.length}</span>
              </div>
              <div className="space-y-2">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowQRCode(true)}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Afficher QR Code
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(clientUrl, "_blank")}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ouvrir Client
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Session Live
              </h3>
              <Button
                variant={session?.is_live ? "secondary" : "default"}
                className="w-full justify-start"
                onClick={handleToggleLive}
              >
                {session?.is_live ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Mettre en Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Démarrer Session
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={stopTimer}
                disabled={!currentQuestion || !session?.timer_active}
              >
                <Pause className="w-4 h-4 mr-2" />
                Arrêter Question
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Trophy className="w-4 h-4 mr-2" />
                Afficher Classement
              </Button>
            </div>

            {/* Rounds */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Manches ({rounds.length})
              </h3>
              {rounds.map((round) => (
                <Button
                  key={round.id}
                  variant={session?.current_round_id === round.id ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <List className="w-4 h-4 mr-2" />
                  {round.title}
                  {session?.current_round_id === round.id && (
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
              {currentRoundQuestions.map((question, idx) => (
                <Card key={question.id} className="p-6 bg-card border-arena-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Question {idx + 1} - {question.type.toUpperCase()}
                      </h3>
                      <p className="text-foreground">{question.text}</p>
                    </div>
                    {currentQuestion?.id === question.id && (
                      <span className="px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium">
                        En cours
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Type</p>
                      <p className="font-medium text-foreground uppercase text-sm">
                        {question.type}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Points</p>
                      <p className="font-medium text-gold text-sm">{question.points}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Durée</p>
                      <p className="font-medium text-foreground text-sm">
                        {question.duration}s
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Réponses</p>
                      <p className="font-medium text-foreground text-sm">
                        {answersData[question.id]?.length || 0}
                      </p>
                    </div>
                  </div>

                  {question.choices && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Choix :</p>
                      <div className="grid grid-cols-2 gap-2">
                        {question.choices.map((choice, i) => (
                          <div
                            key={i}
                            className={`text-sm p-2 rounded ${
                              choice === question.correct_answer
                                ? "bg-green-500/20 text-green-500 font-semibold"
                                : "bg-background text-foreground"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}. {choice}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => handleStartQuestion(question.id)}
                      disabled={currentQuestion?.id === question.id}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {currentQuestion?.id === question.id
                        ? "Question Active"
                        : "Envoyer Question"}
                    </Button>
                    {question.audio_file && (
                      <Button variant="secondary">
                        <Volume2 className="w-4 h-4 mr-2" />
                        Prévisualiser
                      </Button>
                    )}
                  </div>
                </Card>
              ))}

              {!currentRoundQuestions.length && (
                <div className="text-center py-16 text-muted-foreground">
                  <Radio className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Aucune question dans cette manche</p>
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() => navigate("/editor")}
                  >
                    Ajouter des Questions
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="scores" className="space-y-4">
              <Card className="p-6 bg-card border-arena-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-gold" />
                    Classement Général
                  </h3>
                  <Button variant="secondary" size="sm">
                    Rafraîchir
                  </Button>
                </div>
                <div className="space-y-3">
                  {sortedTeams.map((team, idx) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${
                            idx === 0
                              ? "bg-gold text-background"
                              : idx === 1
                              ? "bg-gray-400 text-background"
                              : idx === 2
                              ? "bg-orange-600 text-background"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: team.color }}
                            />
                            <span className="font-semibold text-foreground text-lg">
                              {team.name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {team.connected ? "Connecté" : "Déconnecté"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold text-gold">
                          {team.score}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateScore(team.id, 50)}
                        >
                          +50
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <Card className="p-8 bg-card border-arena-border">
                <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <Volume2 className="w-6 h-6 text-gold" />
                  Lecteur Audio
                </h3>
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Piste Actuelle</p>
                    <p className="text-xl font-semibold text-foreground">
                      {currentQuestion?.audio_file || "Aucune piste"}
                    </p>
                  </div>

                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-gold h-full w-1/3 transition-all duration-300"></div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>0:15</span>
                    <span>0:45</span>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <Button size="lg" variant="secondary">
                      <SkipForward className="w-5 h-5 rotate-180" />
                    </Button>
                    <Button size="lg" className="w-20 h-20 rounded-full">
                      <Play className="w-8 h-8" />
                    </Button>
                    <Button size="lg" variant="secondary">
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-gold h-full w-3/4"></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12">75%</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-gold">
              Scanner pour rejoindre
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="bg-white p-6 rounded-lg">
              <QRCodeSVG value={clientUrl} size={256} level="H" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Ou visitez :</p>
              <code className="text-xs text-gold bg-muted px-3 py-2 rounded block">
                {clientUrl}
              </code>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Regie;
