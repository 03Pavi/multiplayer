"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

const GAMING_TIPS = [
  "Tip: AI content is generated in real-time, keep your answers creative!",
  "Tip: In Meme Battle, look closely at what your opponents are voting for.",
  "Tip: Be fast in Reaction Challenges! Every millisecond counts.",
  "Tip: You can transfer host status in the lobby settings menu.",
  "Tip: Level up to unlock rare rank titles and showcase badges on your card.",
  "Tip: Double-tap the room code in a lobby to copy it to your clipboard instantly.",
];

export const LoadingScreen: React.FC = () => {
  const [tip, setTip] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setTip(GAMING_TIPS[Math.floor(Math.random() * GAMING_TIPS.length)]);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0B0F14",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Animated Brand Icon */}
        <Box
          sx={{
            fontSize: "4rem",
            color: "#22C55E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
            animation: "pulse 2s infinite ease-in-out",
            "@keyframes pulse": {
              "0%, 100%": { transform: "scale(1)", filter: "drop-shadow(0 0 10px rgba(34, 197, 94, 0.4))" },
              "50%": { transform: "scale(1.1)", filter: "drop-shadow(0 0 25px rgba(34, 197, 94, 0.7))" },
            },
          }}
        >
          <SportsEsportsIcon sx={{ fontSize: 80 }} />
        </Box>

        <Typography variant="h4" fontWeight={900} letterSpacing="-0.03em" mb={0.5}>
          PARTYVERSE <span style={{ color: "#22C55E" }}>AI</span>
        </Typography>
        
        <Typography variant="body2" sx={{ color: "#9CA3AF", letterSpacing: "0.2em", fontSize: "0.75rem", mb: 6 }}>
          PREPARING GAME ENGINE...
        </Typography>

        <Box sx={{ width: "100%", mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#22C55E",
                borderRadius: 3,
              },
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "#9CA3AF",
            fontSize: "0.85rem",
            minHeight: "40px",
            lineHeight: 1.4,
            px: 2,
          }}
        >
          {tip}
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingScreen;
