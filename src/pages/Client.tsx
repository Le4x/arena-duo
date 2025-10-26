import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Radio, Trophy, Zap } from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import { useToast } from "@/hooks/use-toast";

const Client = () => {
  const { state, pressBuzzer, submitAnswer } = useGame();
  const { toast } = useToast();
  const [teamName, setTeamName] = useState("");
  const [joined, setJoined] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [textAnswer, setTextAnswer] = useState("");

  const currentQuestion = state.rounds
    .flatMap((r) => r.questions)
    .find((q) => q.id === state.currentQuestionId);

  const myTeam = state.teams.find((t) => t.id === teamId);

  const handleJoin = () => {
    if (teamName.trim()) {
      const newTeamId = `t${Date.now()}`;
      setTeamId(newTeamId);
      setJoined(true);
      toast({
        title: "Connecté !",
        description: `Bienvenue ${teamName}`,
      });
    }
  };

  const handleBuzzer = () => {
    if (state.buzzerLocked) {
      toast({
        title: "Trop tard !",
        description: "Un autre joueur a déjà buzzé",
        variant: "destructive",
      });
      return;
    }
    pressBuzzer(teamId);
    toast({
      title: "Buzzer appuyé !",
      description: "Vous pouvez répondre",
    });
  };

  const handleSubmitAnswer = (answer: string) => {
    submitAnswer(teamId, answer);
    toast({
      title: "Réponse envoyée !",
      description: "En attente de la validation...",
    });
    setTextAnswer("");
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card border-arena-border">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gold mb-2">ARENA</h1>
            <p className="text-muted-foreground">Rejoindre la partie</p>
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
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>
            <Button className="w-full" onClick={handleJoin} disabled={!teamName.trim()}>
              Rejoindre
            </Button>
          </div>
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              {state.teams.length} équipes connectées
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
            <h1 className="text-2xl font-bold text-gold">{teamName}</h1>
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
                  {state.timeRemaining}s
                </div>
              </div>

              {/* Buzzer Mode */}
              {currentQuestion.type === "buzzer" && (
                <div className="space-y-4">
                  <Button
                    className="w-full h-32 text-2xl font-bold"
                    onClick={handleBuzzer}
                    disabled={state.buzzerLocked}
                  >
                    <Zap className="w-8 h-8 mr-3" />
                    {state.buzzerLocked
                      ? state.buzzerWinner === teamId
                        ? "Vous pouvez répondre !"
                        : "Buzzer verrouillé"
                      : "BUZZER"}
                  </Button>
                  {state.buzzerWinner === teamId && (
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
