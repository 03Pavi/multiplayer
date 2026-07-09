"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { GameState } from "@/types";
import { Button, Card } from "@/components/ui";
import { useAppDispatch } from "@/store/hooks";
import { tickTimer } from "@/store/game-slice";

interface TruthOrDareUIProps {
  gameState: GameState;
  onSubmitAnswer: (answer: string) => void;
}

export const TruthOrDareUI: React.FC<TruthOrDareUIProps> = ({
  gameState,
  onSubmitAnswer,
}) => {
  const dispatch = useAppDispatch();
  const [selectedType, setSelectedType] = useState<"truth" | "dare" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Local countdown so players can see the reading time remaining.
  useEffect(() => {
    if (gameState.status !== "action") return;
    const id = setInterval(() => dispatch(tickTimer()), 1000);
    return () => clearInterval(id);
  }, [dispatch, gameState.status, gameState.currentRound]);

  const handleChoice = (choice: "truth" | "dare") => {
    // Just reveal the task. Do NOT end the round yet — the player needs time
    // to read and act on it; the host advances the round afterwards.
    setSelectedType(choice);
  };

  const handleDone = () => {
    if (!selectedType || submitted) return;
    onSubmitAnswer(`Chose ${selectedType.toUpperCase()}`);
    setSubmitted(true);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: 4, textAlign: "center" }}>
      {!selectedType ? (
        <Card sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={800} mb={3}>
            CHOOSE YOUR FATE
          </Typography>
          <Typography variant="body2" sx={{ color: "#9CA3AF" }} mb={4}>
            The AI generates questions based on your choice. Dare is high reward, Truth is high risk.
          </Typography>
          
          <Stack spacing={2}>
            <Button variant="contained" color="secondary" fullWidth onClick={() => handleChoice("truth")}>
              🤫 TRUTH
            </Button>
            <Button variant="contained" color="primary" fullWidth onClick={() => handleChoice("dare")}>
              ⚡ DARE
            </Button>
          </Stack>
        </Card>
      ) : (
        <Card sx={{ p: 4, borderColor: "#22C55E", borderStyle: "solid" }}>
          <Typography variant="subtitle2" sx={{ color: "#3B82F6", fontWeight: 800, mb: 2 }}>
            YOUR SELECTION: {selectedType.toUpperCase()}
          </Typography>

          <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 700, display: "block", mb: 2 }}>
            ⏳ {Math.max(gameState.timer, 0)}s remaining
          </Typography>
          
          <Typography variant="h5" fontWeight={700} mb={4}>
            {gameState.prompt || "Generating spicy prompt from AI..."}
          </Typography>
          
          <Typography variant="caption" sx={{ color: "#9CA3AF", display: "block", mb: 3 }}>
            Read the task and act on it live. Take your time — submit when you're done.
          </Typography>

          {!submitted ? (
            <Button variant="contained" color="primary" fullWidth onClick={handleDone}>
              Done — Submit
            </Button>
          ) : (
            <Typography variant="caption" sx={{ color: "#22C55E", fontWeight: 700 }}>
              ✓ Submitted. Waiting for others / host to advance...
            </Typography>
          )}
        </Card>
      )}
    </Box>
  );
};

export default TruthOrDareUI;
