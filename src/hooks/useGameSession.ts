import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GameSession {
  id: string;
  project_name: string;
  max_teams: number;
  websocket_port: number;
  is_live: boolean;
  current_round_id: string | null;
  current_question_id: string | null;
  timer_active: boolean;
  time_remaining: number;
  buzzer_locked: boolean;
  buzzer_winner_id: string | null;
}

export interface Team {
  id: string;
  session_id: string;
  name: string;
  score: number;
  connected: boolean;
  color: string;
  jokers_remaining: number;
}

export interface Round {
  id: string;
  session_id: string;
  title: string;
  order_number: number;
}

export interface Question {
  id: string;
  round_id: string;
  type: "buzzer" | "qcm" | "text";
  text: string;
  choices: string[] | null;
  correct_answer: string;
  points: number;
  duration: number;
  audio_file: string | null;
}

export const useGameSession = (sessionId?: string) => {
  const { toast } = useToast();
  const [session, setSession] = useState<GameSession | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize or load session
  useEffect(() => {
    const initSession = async () => {
      try {
        if (sessionId) {
          // Load existing session
          const { data, error } = await supabase
            .from("game_sessions")
            .select("*")
            .eq("id", sessionId)
            .single();

          if (error) throw error;
          setSession(data);
        } else {
          // Create new session
          const { data, error } = await supabase
            .from("game_sessions")
            .insert({})
            .select()
            .single();

          if (error) throw error;
          setSession(data);
          
          // Create default round
          await supabase.from("rounds").insert({
            session_id: data.id,
            title: "Manche 1 - Classiques",
            order_number: 1,
          });
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la session",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [sessionId, toast]);

  // Subscribe to session changes
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`game_session_${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          setSession(payload.new as GameSession);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
          filter: `session_id=eq.${session.id}`,
        },
        async () => {
          const { data } = await supabase
            .from("teams")
            .select("*")
            .eq("session_id", session.id);
          if (data) setTeams(data);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rounds",
          filter: `session_id=eq.${session.id}`,
        },
        async () => {
          const { data } = await supabase
            .from("rounds")
            .select("*")
            .eq("session_id", session.id)
            .order("order_number");
          if (data) setRounds(data);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "questions",
        },
        async () => {
          if (rounds.length === 0) return;
          const roundIds = rounds.map((r) => r.id);
          const { data } = await supabase
            .from("questions")
            .select("*")
            .in("round_id", roundIds);
          if (data) setQuestions(data as Question[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, rounds]);

  // Load initial data
  useEffect(() => {
    if (!session?.id) return;

    const loadData = async () => {
      const [teamsRes, roundsRes] = await Promise.all([
        supabase.from("teams").select("*").eq("session_id", session.id),
        supabase
          .from("rounds")
          .select("*")
          .eq("session_id", session.id)
          .order("order_number"),
      ]);

      if (teamsRes.data) setTeams(teamsRes.data);
      if (roundsRes.data) {
        setRounds(roundsRes.data);
        
        // Load questions for all rounds
        if (roundsRes.data.length > 0) {
          const roundIds = roundsRes.data.map((r) => r.id);
          const { data: questionsData } = await supabase
            .from("questions")
            .select("*")
            .in("round_id", roundIds);
          if (questionsData) setQuestions(questionsData as Question[]);
        }
      }
    };

    loadData();
  }, [session?.id]);

  return {
    session,
    teams,
    rounds,
    questions,
    loading,
  };
};
