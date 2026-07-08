"use client";

import React, { useState } from "react";
import { Box, Typography, TextField } from "@mui/material";
import { GameState } from "@/types";
import { Button, Card } from "@/components/ui";

interface StoryBuilderUIProps {
  gameState: GameState;
  onSubmitAnswer: (answer: string) => void;
}

export const StoryBuilderUI: React.FC<StoryBuilderUIProps> = ({
  gameState,
  onSubmitAnswer,
}) => {
  const [sentence, setSentence] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentence.trim()) return;
    onSubmitAnswer(sentence.trim());
    setSubmitted(true);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: 4 }}>
      <Card sx={{ p: 4 }}>
        <Typography variant="subtitle2" sx={{ color: "#3B82F6", fontWeight: 800, mb: 2, textAlign: "center" }}>
          STORY BUILDER
        </Typography>

        <Box
          sx={{
            backgroundColor: "#0B0F14",
            p: 3,
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            mb: 3,
            minHeight: "100px",
          }}
        >
          <Typography variant="body1" sx={{ fontStyle: "italic", lineHeight: 1.6 }}>
            {gameState.prompt || "Starting the saga..."}
          </Typography>
        </Box>

        {!submitted ? (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Enter the next sentence..."
              fullWidth
              variant="outlined"
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                  "&:hover fieldset": { borderColor: "#3B82F6" },
                },
                "& .MuiInputLabel-root": { color: "#9CA3AF" },
              }}
            />
            <Button variant="contained" color="primary" fullWidth type="submit" disabled={!sentence.trim()}>
              Publish Sentence
            </Button>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="body2" sx={{ color: "#22C55E", fontWeight: 700 }}>
              ✓ Sentence submitted! The AI is stitching the narrative.
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default StoryBuilderUI;
