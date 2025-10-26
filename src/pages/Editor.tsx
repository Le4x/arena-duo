import { useState } from "react";
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
import { Plus, Save, Trash2, Music, Users } from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import { useToast } from "@/hooks/use-toast";

const Editor = () => {
  const { state, addRound, addQuestion, addTeam, removeTeam } = useGame();
  const { toast } = useToast();

  const [newRoundTitle, setNewRoundTitle] = useState("");
  const [selectedRound, setSelectedRound] = useState(state.rounds[0]?.id || "");
  
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
      addRound(newRoundTitle);
      setNewRoundTitle("");
      toast({
        title: "Manche ajoutée",
        description: `"${newRoundTitle}" a été créée`,
      });
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

    addQuestion(selectedRound, {
      roundId: selectedRound,
      type: newQuestion.type,
      text: newQuestion.text,
      choices: newQuestion.type === "qcm" ? newQuestion.choices : undefined,
      correctAnswer: newQuestion.correctAnswer,
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

    toast({
      title: "Question ajoutée",
      description: "La question a été ajoutée à la manche",
    });
  };

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      addTeam(newTeamName);
      setNewTeamName("");
      toast({
        title: "Équipe ajoutée",
        description: `"${newTeamName}" peut maintenant se connecter`,
      });
    }
  };

  const currentRound = state.rounds.find((r) => r.id === selectedRound);

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
              {state.projectName}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
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
                  {state.rounds.map((round) => (
                    <Button
                      key={round.id}
                      variant={selectedRound === round.id ? "default" : "secondary"}
                      className="w-full justify-start"
                      onClick={() => setSelectedRound(round.id)}
                    >
                      {round.title}
                      <span className="ml-auto text-xs">
                        {round.questions.length} Q
                      </span>
                    </Button>
                  ))}
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
                {currentRound && currentRound.questions.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-foreground mb-4">
                      Questions ({currentRound.questions.length})
                    </h4>
                    <div className="space-y-2">
                      {currentRound.questions.map((q, idx) => (
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
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
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
                {state.teams.map((team) => (
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
                        {team.score} points
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeam(team.id)}
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
                  <Input defaultValue={state.projectName} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Nombre Max d'Équipes
                  </label>
                  <Input type="number" defaultValue={30} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Port WebSocket
                  </label>
                  <Input defaultValue={3000} />
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
