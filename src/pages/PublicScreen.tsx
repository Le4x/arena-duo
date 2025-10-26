import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Trophy, Clock } from "lucide-react";
import { useGameSession } from "@/hooks/useGameSession";

const PublicScreen = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session") || undefined;
  const { session, teams, questions, loading } = useGameSession(sessionId);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentQuestion = questions.find((q) => q.id === session?.current_question_id);
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  useEffect(() => {
    setShowAnswer(false);
  }, [session?.current_question_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <h1 className="text-4xl font-bold text-gold">Chargement...</h1>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-glow-pulse">
          <h1 className="text-8xl font-bold text-gold mb-4">ARENA</h1>
          <p className="text-3xl text-muted-foreground">
            En attente de la prochaine question...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gold mb-2">ARENA LIVE</h1>
          <p className="text-xl text-muted-foreground">{session?.project_name}</p>
        </div>

        {/* Question Display */}
        <Card className="p-12 bg-card border-arena-border border-2 border-gold">
          <div className="space-y-8">
            {/* Timer */}
            <div className="flex items-center justify-center gap-4 text-gold">
              <Clock className="w-12 h-12" />
              <div className="text-7xl font-bold">{session?.time_remaining || 0}</div>
            </div>

            {/* Question */}
            <div className="text-center">
              <h2 className="text-5xl font-bold text-foreground mb-6">
                {currentQuestion.text}
              </h2>
              <div className="text-2xl text-gold font-semibold">
                {currentQuestion.points} points
              </div>
            </div>

            {/* QCM Choices */}
            {currentQuestion.type === "qcm" && currentQuestion.choices && (
              <div className="grid grid-cols-2 gap-6 mt-8">
                {currentQuestion.choices.map((choice, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-lg text-2xl font-semibold flex items-center gap-4 transition-all ${
                      showAnswer && choice === currentQuestion.correct_answer
                        ? "bg-green-500/20 border-2 border-green-500"
                        : "bg-secondary"
                    }`}
                  >
                    <span className="w-12 h-12 rounded-full bg-gold text-background font-bold flex items-center justify-center text-xl">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-foreground">{choice}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Buzzer Winner */}
            {currentQuestion.type === "buzzer" && session?.buzzer_winner_id && (
              <div className="text-center p-6 bg-gold/20 rounded-lg border-2 border-gold">
                <p className="text-3xl font-bold text-gold">
                  {teams.find((t) => t.id === session.buzzer_winner_id)?.name} a buzzé !
                </p>
              </div>
            )}

            {/* Correct Answer Reveal */}
            {showAnswer && (
              <div className="text-center p-8 bg-green-500/20 rounded-lg border-2 border-green-500 animate-slide-in">
                <p className="text-2xl text-muted-foreground mb-2">Réponse correcte :</p>
                <p className="text-5xl font-bold text-green-500">
                  {currentQuestion.correct_answer}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Leaderboard */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-arena-border">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-gold" />
              <h3 className="text-3xl font-bold text-foreground">Classement</h3>
            </div>
            <div className="space-y-3">
              {sortedTeams.slice(0, 5).map((team, idx) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${
                        idx === 0
                          ? "bg-gold text-background"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className="text-xl font-semibold"
                      style={{ color: team.color }}
                    >
                      {team.name}
                    </span>
                  </div>
                  <span className="text-3xl font-bold text-gold">{team.score}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6 bg-card border-arena-border">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Statistiques
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Équipes connectées</span>
                <span className="font-bold text-gold">{teams.length}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Temps restant</span>
                <span className="font-bold text-gold">
                  {session?.time_remaining || 0}s
                </span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Type de question</span>
                <span className="font-bold text-foreground uppercase">
                  {currentQuestion.type}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicScreen;
