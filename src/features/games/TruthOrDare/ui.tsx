"use client";

import React, { useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { GameState } from "@/types";
import { Button, Card } from "@/components/ui";

interface TruthOrDareUIProps {
  gameState: GameState;
  onSubmitAnswer: (answer: string) => void;
}

export const TruthOrDareUI: React.FC<TruthOrDareUIProps> = ({
  gameState,
  onSubmitAnswer,
}) => {
  const [selectedType, setSelectedType] = useState<"truth" | "dare" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChoice = (choice: "truth" | "dare") => {
    setSelectedType(choice);
    // Simulate AI prompt selection
    onSubmitAnswer(`Chose ${choice.toUpperCase()}`);
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
          
          <Typography variant="h5" fontWeight={700} mb={4}>
            {gameState.prompt || "Generating spicy prompt from AI..."}
          </Typography>
          
          <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
            Discuss your response or complete the dare live! Ticking down...
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default TruthOrDareUI;
