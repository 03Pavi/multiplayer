"use client";

import React, { useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { GameState } from "@/types";
import { Button, Card } from "@/components/ui";

interface WouldYouRatherUIProps {
  gameState: GameState;
  onSubmitAnswer: (answer: string) => void;
}

export const WouldYouRatherUI: React.FC<WouldYouRatherUIProps> = ({
  gameState,
  onSubmitAnswer,
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    setSelected(option);
    onSubmitAnswer(option);
  };

  const options = gameState.options && gameState.options.length >= 2
    ? gameState.options
    : ["Option One", "Option Two"];

  return (
    <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: 4 }}>
      <Card sx={{ p: 4, mb: 3, textAlign: "center" }}>
        <Typography variant="subtitle2" sx={{ color: "#3B82F6", fontWeight: 800, mb: 1 }}>
          WOULD YOU RATHER...
        </Typography>
        <Typography variant="h5" fontWeight={800}>
          {gameState.prompt || "Generating tough decisions..."}
        </Typography>
      </Card>

      <Stack spacing={2}>
        <Button
          variant={selected === options[0] ? "contained" : "outlined"}
          color="primary"
          fullWidth
          onClick={() => handleSelect(options[0])}
          sx={{
            py: 3,
            fontSize: "1.1rem",
            fontWeight: 800,
            borderColor: "#22C55E",
            backgroundColor: selected === options[0] ? "#22C55E" : "rgba(34, 197, 150, 0.05)",
          }}
        >
          {options[0]}
        </Button>
        
        <Typography variant="subtitle2" align="center" fontWeight={900} sx={{ color: "#9CA3AF" }}>
          — OR —
        </Typography>

        <Button
          variant={selected === options[1] ? "contained" : "outlined"}
          color="secondary"
          fullWidth
          onClick={() => handleSelect(options[1])}
          sx={{
            py: 3,
            fontSize: "1.1rem",
            fontWeight: 800,
            borderColor: "#3B82F6",
            backgroundColor: selected === options[1] ? "#3B82F6" : "rgba(59, 130, 246, 0.05)",
          }}
        >
          {options[1]}
        </Button>
      </Stack>

      {selected && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="caption" sx={{ color: "#22C55E", fontWeight: 700 }}>
            ✓ Vote registered. Waiting for final percentages...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default WouldYouRatherUI;
