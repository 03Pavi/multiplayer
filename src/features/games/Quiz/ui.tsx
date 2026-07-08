"use client";

import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { GameState } from "@/types";
import { Button, Card } from "@/components/ui";

interface QuizUIProps {
  gameState: GameState;
  onSubmitAnswer: (answer: string) => void;
}

export const QuizUI: React.FC<QuizUIProps> = ({
  gameState,
  onSubmitAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    setSelectedAnswer(option);
    onSubmitAnswer(option);
  };

  const options = gameState.options && gameState.options.length > 0 
    ? gameState.options 
    : ["Option A", "Option B", "Option C", "Option D"];

  return (
    <Box sx={{ width: "100%", maxWidth: "600px", mx: "auto", mt: 4 }}>
      <Card sx={{ p: 4, mb: 3, textAlign: "center" }}>
        <Typography variant="subtitle2" sx={{ color: "#3B82F6", fontWeight: 800, mb: 1 }}>
          AI TRIVIA CHALLENGE
        </Typography>
        <Typography variant="h5" fontWeight={800}>
          {gameState.prompt || "Loading AI Question..."}
        </Typography>
      </Card>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          return (
            <Box key={option} sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" }, boxSizing: "border-box" }}>
              <Button
                variant={isSelected ? "contained" : "outlined"}
                color={isSelected ? "secondary" : "inherit"}
                fullWidth
                onClick={() => handleSelect(option)}
                sx={{
                  py: 3,
                  fontSize: "1rem",
                  fontWeight: 700,
                  border: isSelected ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                  backgroundColor: isSelected ? "#3B82F6" : "rgba(255,255,255,0.02)",
                  "&:hover": {
                    backgroundColor: isSelected ? "#2563EB" : "rgba(255,255,255,0.05)",
                  },
                }}
              >
                {`${idx + 1}. ${option}`}
              </Button>
            </Box>
          );
        })}
      </Box>

      {selectedAnswer && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="caption" sx={{ color: "#22C55E", fontWeight: 700 }}>
            ✓ Locked in: {selectedAnswer}. Waiting for other players...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default QuizUI;

