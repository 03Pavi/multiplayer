"use client";

import React, { useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { GameState } from "@/types";
import { Button, Card } from "@/components/ui";

interface NeverHaveIEverUIProps {
  gameState: GameState;
  onSubmitAnswer: (answer: string) => void;
}

export const NeverHaveIEverUI: React.FC<NeverHaveIEverUIProps> = ({
  gameState,
  onSubmitAnswer,
}) => {
  const [confessed, setConfessed] = useState<string | null>(null);

  const handleSelect = (choice: "I HAVE" | "NEVER") => {
    setConfessed(choice);
    onSubmitAnswer(choice);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: 4 }}>
      <Card sx={{ p: 4, mb: 3, textAlign: "center" }}>
        <Typography variant="subtitle2" sx={{ color: "#EF4444", fontWeight: 800, mb: 1 }}>
          NEVER HAVE I EVER...
        </Typography>
        <Typography variant="h5" fontWeight={800} sx={{ minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {gameState.prompt || "Never have I ever had my coding assistant build a whole PWA in one go."}
        </Typography>
      </Card>

      {!confessed ? (
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={() => handleSelect("I HAVE")}
            sx={{ py: 2, fontWeight: 800 }}
          >
            🙋‍♂️ I HAVE
          </Button>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={() => handleSelect("NEVER")}
            sx={{ py: 2, fontWeight: 800 }}
          >
            🙅‍♂️ NEVER
          </Button>
        </Stack>
      ) : (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography
            variant="h6"
            fontWeight={800}
            color={confessed === "I HAVE" ? "#EF4444" : "#22C55E"}
          >
            Locked: {confessed}
          </Typography>
          <Typography variant="caption" sx={{ color: "#9CA3AF", display: "block", mt: 1 }}>
            Waiting for other confessions...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default NeverHaveIEverUI;
