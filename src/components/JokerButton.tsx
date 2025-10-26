import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface JokerButtonProps {
  jokersRemaining: number;
  onUseJoker: () => void;
  disabled?: boolean;
}

export const JokerButton = ({ jokersRemaining, onUseJoker, disabled }: JokerButtonProps) => {
  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={onUseJoker}
        disabled={disabled || jokersRemaining === 0}
        className="bg-gradient-to-r from-gold to-yellow-600 hover:from-gold/90 hover:to-yellow-600/90 text-background font-bold"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Utiliser un Joker
      </Button>
      <div className="flex items-center gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              i < jokersRemaining
                ? "border-gold bg-gold/20 text-gold"
                : "border-muted bg-muted text-muted-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
};
