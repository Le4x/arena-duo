import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGameActions = (sessionId: string | undefined) => {
  const { toast } = useToast();

  const addTeam = async (name: string) => {
    if (!sessionId) return;
    
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#95E1D3", "#F38181", "#AA96DA"];
    
    // Get current teams count
    const { count } = await supabase
      .from("teams")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    const { error } = await supabase.from("teams").insert({
      session_id: sessionId,
      name,
      color: colors[(count || 0) % colors.length],
      connected: true,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'équipe",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Équipe ajoutée",
        description: `"${name}" a rejoint la partie`,
      });
    }
  };

  const removeTeam = async (teamId: string) => {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'équipe",
        variant: "destructive",
      });
    }
  };

  const updateScore = async (teamId: string, points: number) => {
    const { data: team } = await supabase
      .from("teams")
      .select("score")
      .eq("id", teamId)
      .single();

    if (team) {
      await supabase
        .from("teams")
        .update({ score: team.score + points })
        .eq("id", teamId);
    }
  };

  const addRound = async (title: string) => {
    if (!sessionId) return;

    const { count } = await supabase
      .from("rounds")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    const { error } = await supabase.from("rounds").insert({
      session_id: sessionId,
      title,
      order_number: (count || 0) + 1,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la manche",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Manche ajoutée",
        description: `"${title}" a été créée`,
      });
    }
  };

  const addQuestion = async (
    roundId: string,
    question: {
      type: "buzzer" | "qcm" | "text";
      text: string;
      choices?: string[];
      correct_answer: string;
      points: number;
      duration: number;
    }
  ) => {
    const { error } = await supabase.from("questions").insert({
      round_id: roundId,
      type: question.type,
      text: question.text,
      choices: question.choices || null,
      correct_answer: question.correct_answer,
      points: question.points,
      duration: question.duration,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la question",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Question ajoutée",
        description: "La question a été ajoutée à la manche",
      });
    }
  };

  const setCurrentQuestion = async (questionId: string, roundId: string) => {
    if (!sessionId) return;

    // Get question duration
    const { data: question } = await supabase
      .from("questions")
      .select("duration")
      .eq("id", questionId)
      .single();

    await supabase
      .from("game_sessions")
      .update({
        current_question_id: questionId,
        current_round_id: roundId,
        time_remaining: question?.duration || 30,
        buzzer_locked: false,
        buzzer_winner_id: null,
      })
      .eq("id", sessionId);
  };

  const startTimer = async () => {
    if (!sessionId) return;
    await supabase
      .from("game_sessions")
      .update({ timer_active: true })
      .eq("id", sessionId);
  };

  const stopTimer = async () => {
    if (!sessionId) return;
    await supabase
      .from("game_sessions")
      .update({ timer_active: false })
      .eq("id", sessionId);
  };

  const pressBuzzer = async (teamId: string) => {
    if (!sessionId) return;

    const { data: session } = await supabase
      .from("game_sessions")
      .select("buzzer_locked")
      .eq("id", sessionId)
      .single();

    if (session && !session.buzzer_locked) {
      await supabase
        .from("game_sessions")
        .update({
          buzzer_locked: true,
          buzzer_winner_id: teamId,
        })
        .eq("id", sessionId);
    }
  };

  const submitAnswer = async (teamId: string, questionId: string, answer: string) => {
    await supabase.from("answers").insert({
      team_id: teamId,
      question_id: questionId,
      answer,
    });
  };

  const useJoker = async (teamId: string, questionId: string, jokerType: string) => {
    // Check if team has jokers remaining
    const { data: team } = await supabase
      .from("teams")
      .select("jokers_remaining")
      .eq("id", teamId)
      .single();

    if (team && team.jokers_remaining > 0) {
      await Promise.all([
        supabase
          .from("teams")
          .update({ jokers_remaining: team.jokers_remaining - 1 })
          .eq("id", teamId),
        supabase.from("joker_usage").insert({
          team_id: teamId,
          question_id: questionId,
          joker_type: jokerType,
        }),
      ]);

      toast({
        title: "Joker utilisé",
        description: `Joker "${jokerType}" activé`,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Plus de jokers disponibles",
        variant: "destructive",
      });
    }
  };

  const startLiveSession = async () => {
    if (!sessionId) return;
    await supabase
      .from("game_sessions")
      .update({ is_live: true })
      .eq("id", sessionId);
  };

  const stopLiveSession = async () => {
    if (!sessionId) return;
    await supabase
      .from("game_sessions")
      .update({ is_live: false })
      .eq("id", sessionId);
  };

  const saveProject = async () => {
    toast({
      title: "Projet sauvegardé",
      description: "Toutes les modifications sont automatiquement synchronisées",
    });
  };

  const updateSettings = async (settings: {
    project_name?: string;
    max_teams?: number;
    websocket_port?: number;
  }) => {
    if (!sessionId) return;
    
    const { error } = await supabase
      .from("game_sessions")
      .update(settings)
      .eq("id", sessionId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Paramètres mis à jour",
        description: "Les modifications ont été enregistrées",
      });
    }
  };

  return {
    addTeam,
    removeTeam,
    updateScore,
    addRound,
    addQuestion,
    setCurrentQuestion,
    startTimer,
    stopTimer,
    pressBuzzer,
    submitAnswer,
    useJoker,
    startLiveSession,
    stopLiveSession,
    saveProject,
    updateSettings,
  };
};
