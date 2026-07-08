"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import TimerIcon from "@mui/icons-material/Timer";

export interface GameHeaderProps {
  gameTitle: string;
  currentRound: number;
  totalRounds: number;
  timerSeconds: number;
  onExit: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  gameTitle,
  currentRound,
  totalRounds,
  timerSeconds,
  onExit,
}) => {
  const getTimerColor = () => {
    if (timerSeconds <= 5) return "#EF4444";
    if (timerSeconds <= 10) return "#F59E0B";
    return "#22C55E";
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#111827",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        px: 3,
        py: 1.5,
        borderRadius: "0 0 16px 16px",
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <IconButton onClick={onExit} sx={{ color: "#EF4444" }} title="Exit Match">
          <ExitToAppIcon />
        </IconButton>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "#9CA3AF", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em" }}>
            ACTIVE MATCH
          </Typography>
          <Typography variant="body1" fontWeight={800}>
            {gameTitle}
          </Typography>
        </Box>
      </Box>

      {/* Esports Scoreboard Round Tracker */}
      <Box
        sx={{
          backgroundColor: "#1A202C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "8px",
          px: 2,
          py: 0.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 700 }}>
          ROUND
        </Typography>
        <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.1, color: "#3B82F6" }}>
          {currentRound} <span style={{ color: "#9CA3AF", fontSize: "0.8rem", fontWeight: 500 }}>/ {totalRounds}</span>
        </Typography>
      </Box>

      {/* Countdown Timer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: `${getTimerColor()}15`,
          border: `1px solid ${getTimerColor()}30`,
          borderRadius: "8px",
          px: 2,
          py: 0.8,
          minWidth: "90px",
          justifyContent: "center",
        }}
      >
        <TimerIcon sx={{ fontSize: 18, color: getTimerColor() }} />
        <Typography variant="h6" fontWeight={900} sx={{ color: getTimerColor(), fontFamily: "monospace", lineHeight: 1 }}>
          {timerSeconds}s
        </Typography>
      </Box>
    </Box>
  );
};

export default GameHeader;
