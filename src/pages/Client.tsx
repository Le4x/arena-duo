import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Radio, Trophy, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGameSession } from "@/hooks/useGameSession";
import { useGameActions } from "@/hooks/useGameActions";
import { JokerButton } from "@/components/JokerButton";

const Client = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session") || undefined;
  const { session, teams, questions } = useGameSession(sessionId);
  const actions = useGameActions(sessionId);
  
  const [teamName, setTeamName] = useState("");
  const [textAnswer, setTextAnswer] = useState("");

  const currentQuestion = questions.find((q) => q.id === session?.current_question_id);
  
  // Automatically determine user's team based on user_id
  const myTeam = teams.find((t) => t.user_id === user?.id);

  const handleCreateTeam = async () => {
    if (teamName.trim() && user) {
      await actions.addTeam(teamName, user.id);
      setTeamName("");
      toast({
        title: "Équipe créée !",
        description: "Bienvenue dans le jeu",
      });
    }
  };

  const handleBuzzer = () => {
    if (!myTeam) return;
    if (session?.buzzer_locked) {
      toast({
        title: "Trop tard !",
        description: "Un autre joueur a déjà buzzé",
        variant: "destructive",
      });
      return;
    }
    actions.pressBuzzer(myTeam.id);
    toast({
      title: "Buzzer appuyé !",
      description: "Vous pouvez répondre",
    });
  };

  const handleSubmitAnswer = (answer: string) => {
    if (!myTeam || !currentQuestion) return;
    actions.submitAnswer(myTeam.id, currentQuestion.id, answer);
    toast({
      title: "Réponse envoyée !",
      description: "En attente de la validation...",
    });
    setTextAnswer("");
  };

  const handleUseJoker = () => {
    if (!myTeam || !currentQuestion) return;
    actions.useJoker(myTeam.id, currentQuestion.id, "aide");
  };

  // If user doesn't have a team yet, show team creation
  if (!myTeam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card border-arena-border">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gold mb-2">ARENA</h1>
            <p className="text-muted-foreground">Créez votre équipe pour rejoindre la partie</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Nom de votre équipe
              </label>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Les Champions"
                className="bg-muted border-arena-border"
                onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCreateTeam}
              disabled={!teamName.trim()}
            >
              Créer mon équipe
            </Button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Chaque joueur doit créer sa propre équipe
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-arena-border bg-arena-bg-secondary p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gold">{myTeam?.name}</h1>
            <p className="text-sm text-muted-foreground">
              {myTeam ? `${myTeam.score} points` : "En attente..."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            <span className="text-lg font-bold text-foreground">
              {myTeam ? myTeam.score : 0}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {!currentQuestion ? (
          <Card className="w-full max-w-2xl p-12 bg-card border-arena-border text-center">
            <Radio className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              En attente de question
            </h2>
            <p className="text-muted-foreground">
              Le maître du jeu va lancer la prochaine question...
            </p>
          </Card>
        ) : (
          <div className="w-full max-w-2xl space-y-6">
            {/* Question Card */}
            <Card className="p-8 bg-card border-arena-border">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  {currentQuestion.text}
                </h2>
                <div className="text-4xl font-bold text-gold">
                  {session?.time_remaining}s
                </div>
              </div>

              {/* Buzzer Mode */}
              {currentQuestion.type === "buzzer" && (
                <div className="space-y-4">
                  <Button
                    className="w-full h-32 text-2xl font-bold"
                    onClick={handleBuzzer}
                    disabled={session?.buzzer_locked}
                  >
                    <Zap className="w-8 h-8 mr-3" />
                    {session?.buzzer_locked
                      ? session?.buzzer_winner_id === myTeam?.id
                        ? "Vous pouvez répondre !"
                        : "Buzzer verrouillé"
                      : "BUZZER"}
                  </Button>
                  {session?.buzzer_winner_id === myTeam?.id && (
                    <Input
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="Votre réponse..."
                      className="text-lg"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSubmitAnswer(textAnswer)
                      }
                    />
                  )}
                </div>
              )}

              {/* QCM Mode */}
              {currentQuestion.type === "qcm" && currentQuestion.choices && (
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.choices.map((choice, idx) => (
                    <Button
                      key={idx}
                      variant="secondary"
                      className="w-full h-16 text-lg justify-start"
                      onClick={() => handleSubmitAnswer(choice)}
                    >
                      <span className="w-8 h-8 rounded-full bg-gold text-background font-bold flex items-center justify-center mr-3">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {choice}
                    </Button>
                  ))}
                </div>
              )}

              {/* Text Mode */}
              {currentQuestion.type === "text" && (
                <div className="space-y-3">
                  <Input
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Tapez votre réponse..."
                    className="text-lg h-12"
                  />
                  <Button
                    className="w-full"
                    onClick={() => handleSubmitAnswer(textAnswer)}
                    disabled={!textAnswer.trim()}
                  >
                    Envoyer la réponse
                  </Button>
                </div>
              )}
            </Card>

            {/* Joker System */}
            {myTeam && (
              <div className="flex justify-center">
                <JokerButton
                  jokersRemaining={myTeam.jokers_remaining}
                  onUseJoker={handleUseJoker}
                  disabled={!session?.timer_active}
                />
              </div>
            )}

            {/* Points */}
            <div className="text-center text-muted-foreground">
              Cette question vaut <span className="text-gold font-bold">{currentQuestion.points}</span> points
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Client;
