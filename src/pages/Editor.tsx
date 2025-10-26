import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGameSession } from "@/hooks/useGameSession";
import { useGameActions } from "@/hooks/useGameActions";

const Editor = () => {
  const { toast } = useToast();
  const { session, teams, rounds, questions, loading } = useGameSession();
  const actions = useGameActions(session?.id);

  const [newRoundTitle, setNewRoundTitle] = useState("");
  const [selectedRound, setSelectedRound] = useState("");
  
  useEffect(() => {
    if (rounds.length > 0 && !selectedRound) {
      setSelectedRound(rounds[0].id);
    }
  }, [rounds, selectedRound]);
  
  const [newQuestion, setNewQuestion] = useState({
    type: "buzzer" as "buzzer" | "qcm" | "text",
    text: "",
    choices: ["", "", "", ""],
    correctAnswer: "",
    points: 100,
    duration: 30,
  });

  const [newTeamName, setNewTeamName] = useState("");

  const handleAddRound = () => {
    if (newRoundTitle.trim()) {
      actions.addRound(newRoundTitle);
      setNewRoundTitle("");
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.text.trim()) {
      toast({
        title: "Erreur",
        description: "La question doit avoir un texte",
        variant: "destructive",
      });
      return;
    }

    actions.addQuestion(selectedRound, {
      type: newQuestion.type,
      text: newQuestion.text,
      choices: newQuestion.type === "qcm" ? newQuestion.choices.filter(c => c.trim()) : undefined,
      correct_answer: newQuestion.correctAnswer,
      points: newQuestion.points,
      duration: newQuestion.duration,
    });

    setNewQuestion({
      type: "buzzer",
      text: "",
      choices: ["", "", "", ""],
      correctAnswer: "",
      points: 100,
      duration: 30,
    });
  };

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      actions.addTeam(newTeamName);
      setNewTeamName("");
    }
  };

  const currentRound = rounds.find((r) => r.id === selectedRound);
  const currentQuestions = questions.filter((q) => q.round_id === selectedRound);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gold text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-arena-border bg-arena-bg-secondary">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gold">
              Éditeur de Projet
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {session?.project_name}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={actions.saveProject}>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">
        <Tabs defaultValue="rounds" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="rounds">Manches & Questions</TabsTrigger>
            <TabsTrigger value="teams">Équipes</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Rounds & Questions */}
          <TabsContent value="rounds" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Rounds List */}
              <Card className="p-6 bg-card border-arena-border">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Manches
                </h3>
                <div className="space-y-3 mb-4">
                  {rounds.map((round) => {
                    const roundQuestions = questions.filter((q) => q.round_id === round.id);
                    return (
                      <Button
                        key={round.id}
                        variant={selectedRound === round.id ? "default" : "secondary"}
                        className="w-full justify-start"
                        onClick={() => setSelectedRound(round.id)}
                      >
                        {round.title}
                        <span className="ml-auto text-xs">
                          {roundQuestions.length} Q
                        </span>
                      </Button>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  <Input
                    value={newRoundTitle}
                    onChange={(e) => setNewRoundTitle(e.target.value)}
                    placeholder="Titre de la manche"
                    onKeyDown={(e) => e.key === "Enter" && handleAddRound()}
                  />
                  <Button className="w-full" onClick={handleAddRound}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter Manche
                  </Button>
                </div>
              </Card>

              {/* Question Editor */}
              <Card className="col-span-2 p-6 bg-card border-arena-border">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  Nouvelle Question - {currentRound?.title}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Type
                      </label>
                      <Select
                        value={newQuestion.type}
                        onValueChange={(value: "buzzer" | "qcm" | "text") =>
                          setNewQuestion({ ...newQuestion, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buzzer">Buzzer</SelectItem>
                          <SelectItem value="qcm">QCM</SelectItem>
                          <SelectItem value="text">Texte Libre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Points
                      </label>
                      <Input
                        type="number"
                        value={newQuestion.points}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            points: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Question
                    </label>
                    <Input
                      value={newQuestion.text}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, text: e.target.value })
                      }
                      placeholder="Quel est le titre de cette chanson ?"
                    />
                  </div>

                  {newQuestion.type === "qcm" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Choix de réponses
                      </label>
                      {newQuestion.choices.map((choice, idx) => (
                        <Input
                          key={idx}
                          value={choice}
                          onChange={(e) => {
                            const newChoices = [...newQuestion.choices];
                            newChoices[idx] = e.target.value;
                            setNewQuestion({ ...newQuestion, choices: newChoices });
                          }}
                          placeholder={`Choix ${String.fromCharCode(65 + idx)}`}
                        />
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Réponse Correcte
                    </label>
                    <Input
                      value={newQuestion.correctAnswer}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          correctAnswer: e.target.value,
                        })
                      }
                      placeholder="La bonne réponse"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Durée (secondes)
                    </label>
                    <Input
                      type="number"
                      value={newQuestion.duration}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          duration: parseInt(e.target.value) || 30,
                        })
                      }
                    />
                  </div>

                  <Button className="w-full" onClick={handleAddQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter Question
                  </Button>
                </div>

                {/* Questions List */}
                {currentQuestions.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-foreground mb-4">
                      Questions ({currentQuestions.length})
                    </h4>
                    <div className="space-y-2">
                      {currentQuestions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-gold font-bold">{idx + 1}.</span>
                            <div>
                              <p className="font-medium text-foreground">{q.text}</p>
                              <p className="text-xs text-muted-foreground">
                                {q.type.toUpperCase()} • {q.points} pts • {q.duration}s
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Teams */}
          <TabsContent value="teams" className="space-y-6">
            <Card className="p-6 bg-card border-arena-border max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-gold" />
                <h3 className="text-xl font-semibold text-foreground">
                  Gestion des Équipes
                </h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Nom de l'équipe"
                    onKeyDown={(e) => e.key === "Enter" && handleAddTeam()}
                  />
                  <Button onClick={handleAddTeam}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="font-semibold text-foreground">
                        {team.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {team.score} points • {team.jokers_remaining} jokers
                      </span>
                      {team.connected && (
                        <span className="text-xs text-green-500">● Connecté</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => actions.removeTeam(team.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6 bg-card border-arena-border max-w-2xl">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                Paramètres du Projet
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Nom du Projet
                  </label>
                  <Input 
                    defaultValue={session?.project_name}
                    onBlur={(e) => actions.updateSettings({ project_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Nombre Max d'Équipes
                  </label>
                  <Input 
                    type="number" 
                    defaultValue={session?.max_teams}
                    onBlur={(e) => actions.updateSettings({ max_teams: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Port WebSocket
                  </label>
                  <Input 
                    type="number"
                    defaultValue={session?.websocket_port}
                    onBlur={(e) => actions.updateSettings({ websocket_port: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Editor;
