"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { GameState } from "@/types";
import { Card } from "@/components/ui";

interface ReactionUIProps {
  gameState: GameState;
  onSubmitAnswer: (answer: string) => void;
}

export const ReactionUI: React.FC<ReactionUIProps> = ({
  onSubmitAnswer,
}) => {
  const [phase, setPhase] = useState<"idle" | "wait" | "go" | "done" | "early">("idle");
  const [startTime, setStartTime] = useState(0);
  const [resultTime, setResultTime] = useState(0);

  useEffect(() => {
    let timeout: any;
    if (phase === "wait") {
      const delay = Math.random() * 3000 + 2000; // 2-5 seconds random delay
      timeout = setTimeout(() => {
        setPhase("go");
        setStartTime(Date.now());
      }, delay);
    }
    return () => clearTimeout(timeout);
  }, [phase]);

  const handleTrigger = () => {
    if (phase === "idle") {
      setPhase("wait");
    } else if (phase === "wait") {
      setPhase("early");
    } else if (phase === "go") {
      const duration = Date.now() - startTime;
      setResultTime(duration);
      setPhase("done");
      onSubmitAnswer(`${duration}ms`);
    }
  };

  const getBgColor = () => {
    switch (phase) {
      case "wait":
        return "#EF4444"; // Red (Wait)
      case "go":
        return "#22C55E"; // Green (TAP NOW!)
      case "done":
        return "#1A202C"; // Neutral Card
      case "early":
        return "#F59E0B"; // Early Warning
      default:
        return "#111827"; // Dark Idle
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: 4 }}>
      <Card
        onClick={handleTrigger}
        sx={{
          p: 6,
          height: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: getBgColor(),
          cursor: phase !== "done" ? "pointer" : "default",
          transition: "background-color 0.1s ease",
          textAlign: "center",
          userSelect: "none",
        }}
      >
        {phase === "idle" && (
          <>
            <Typography variant="h5" fontWeight={800} mb={2}>
              REACTION CHALLENGE
            </Typography>
            <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
              TAP HERE TO START. Once the screen turns GREEN, tap as fast as you can.
            </Typography>
          </>
        )}

        {phase === "wait" && (
          <Typography variant="h4" fontWeight={900}>
            WAIT FOR GREEN...
          </Typography>
        )}

        {phase === "go" && (
          <Typography variant="h3" fontWeight={900}>
            TAP NOW!!!
          </Typography>
        )}

        {phase === "early" && (
          <>
            <Typography variant="h4" fontWeight={900} mb={1}>
              TOO EARLY!
            </Typography>
            <Typography variant="body2" onClick={() => setPhase("idle")} sx={{ textDecoration: "underline", cursor: "pointer" }}>
              Tap to try again.
            </Typography>
          </>
        )}

        {phase === "done" && (
          <>
            <Typography variant="h4" fontWeight={900} color="#22C55E" mb={1}>
              {resultTime} MS
            </Typography>
            <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
              Score locked in. Waiting for other players...
            </Typography>
          </>
        )}
      </Card>
    </Box>
  );
};

export default ReactionUI;
