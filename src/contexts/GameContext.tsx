import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Types
export type QuestionType = "buzzer" | "qcm" | "text";

export interface Question {
  id: string;
  roundId: string;
  type: QuestionType;
  text: string;
  choices?: string[];
  correctAnswer: string;
  points: number;
  duration: number;
  audioFile?: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  color: string;
}

export interface Round {
  id: string;
  title: string;
  order: number;
  questions: Question[];
}

export interface GameState {
  projectName: string;
  rounds: Round[];
  teams: Team[];
  currentRoundId: string | null;
  currentQuestionId: string | null;
  isLive: boolean;
  timerActive: boolean;
  timeRemaining: number;
  buzzerLocked: boolean;
  buzzerWinner: string | null;
  answers: Record<string, { teamId: string; answer: string; timestamp: number }>;
}

interface GameContextType {
  state: GameState;
  addTeam: (name: string) => void;
  removeTeam: (id: string) => void;
  updateScore: (teamId: string, points: number) => void;
  addRound: (title: string) => void;
  addQuestion: (roundId: string, question: Omit<Question, "id">) => void;
  setCurrentQuestion: (questionId: string) => void;
  startTimer: () => void;
  stopTimer: () => void;
  pressBuzzer: (teamId: string) => void;
  submitAnswer: (teamId: string, answer: string) => void;
  revealAnswer: () => void;
  nextQuestion: () => void;
  startLiveSession: () => void;
  stopLiveSession: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GameState>({
    projectName: "MusicArena #1",
    rounds: [
      {
        id: "round-1",
        title: "Manche 1 - Classiques",
        order: 1,
        questions: [
          {
            id: "q1",
            roundId: "round-1",
            type: "buzzer",
            text: "Quel est le titre de cette chanson ?",
            correctAnswer: "Bohemian Rhapsody",
            points: 100,
            duration: 30,
            audioFile: "bohemian.mp3",
          },
          {
            id: "q2",
            roundId: "round-1",
            type: "qcm",
            text: "Qui a chanté 'Imagine' ?",
            choices: ["John Lennon", "Paul McCartney", "Bob Dylan", "Elvis Presley"],
            correctAnswer: "John Lennon",
            points: 50,
            duration: 20,
          },
        ],
      },
    ],
    teams: [
      { id: "t1", name: "Les Rockeurs", score: 450, connected: true, color: "#FFD700" },
      { id: "t2", name: "Team Melody", score: 420, connected: true, color: "#C0C0C0" },
      { id: "t3", name: "Sound Masters", score: 380, connected: true, color: "#CD7F32" },
    ],
    currentRoundId: "round-1",
    currentQuestionId: null,
    isLive: false,
    timerActive: false,
    timeRemaining: 0,
    buzzerLocked: false,
    buzzerWinner: null,
    answers: {},
  });

  const addTeam = useCallback((name: string) => {
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#95E1D3", "#F38181", "#AA96DA"];
    setState((prev) => ({
      ...prev,
      teams: [
        ...prev.teams,
        {
          id: `t${Date.now()}`,
          name,
          score: 0,
          connected: true,
          color: colors[prev.teams.length % colors.length],
        },
      ],
    }));
  }, []);

  const removeTeam = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t.id !== id),
    }));
  }, []);

  const updateScore = useCallback((teamId: string, points: number) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) =>
        t.id === teamId ? { ...t, score: t.score + points } : t
      ),
    }));
  }, []);

  const addRound = useCallback((title: string) => {
    setState((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          id: `round-${Date.now()}`,
          title,
          order: prev.rounds.length + 1,
          questions: [],
        },
      ],
    }));
  }, []);

  const addQuestion = useCallback((roundId: string, question: Omit<Question, "id">) => {
    setState((prev) => ({
      ...prev,
      rounds: prev.rounds.map((r) =>
        r.id === roundId
          ? {
              ...r,
              questions: [
                ...r.questions,
                { ...question, id: `q${Date.now()}` } as Question,
              ],
            }
          : r
      ),
    }));
  }, []);

  const setCurrentQuestion = useCallback((questionId: string) => {
    const question = state.rounds
      .flatMap((r) => r.questions)
      .find((q) => q.id === questionId);

    setState((prev) => ({
      ...prev,
      currentQuestionId: questionId,
      timeRemaining: question?.duration || 30,
      buzzerLocked: false,
      buzzerWinner: null,
      answers: {},
    }));
  }, [state.rounds]);

  const startTimer = useCallback(() => {
    setState((prev) => ({ ...prev, timerActive: true }));
  }, []);

  const stopTimer = useCallback(() => {
    setState((prev) => ({ ...prev, timerActive: false }));
  }, []);

  const pressBuzzer = useCallback((teamId: string) => {
    setState((prev) => {
      if (prev.buzzerLocked) return prev;
      return {
        ...prev,
        buzzerLocked: true,
        buzzerWinner: teamId,
      };
    });
  }, []);

  const submitAnswer = useCallback((teamId: string, answer: string) => {
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [teamId]: { teamId, answer, timestamp: Date.now() },
      },
    }));
  }, []);

  const revealAnswer = useCallback(() => {
    // Logic to reveal answer and update scores
    console.log("Revealing answer...");
  }, []);

  const nextQuestion = useCallback(() => {
    const currentRound = state.rounds.find((r) => r.id === state.currentRoundId);
    if (!currentRound) return;

    const currentIndex = currentRound.questions.findIndex(
      (q) => q.id === state.currentQuestionId
    );
    const nextQ = currentRound.questions[currentIndex + 1];

    if (nextQ) {
      setCurrentQuestion(nextQ.id);
    }
  }, [state.rounds, state.currentRoundId, state.currentQuestionId, setCurrentQuestion]);

  const startLiveSession = useCallback(() => {
    setState((prev) => ({ ...prev, isLive: true }));
  }, []);

  const stopLiveSession = useCallback(() => {
    setState((prev) => ({ ...prev, isLive: false }));
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
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
        revealAnswer,
        nextQuestion,
        startLiveSession,
        stopLiveSession,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};
