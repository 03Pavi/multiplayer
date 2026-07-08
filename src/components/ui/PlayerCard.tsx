"use client";

import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import Card from "./Card";
import Avatar from "./Avatar";

export interface PlayerCardProps {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  rank: string;
  isHost?: boolean;
  isReady?: boolean;
  isOnline?: boolean;
  score?: number;
  status?: string;
  typing?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  avatar,
  level,
  xp,
  rank,
  isHost = false,
  isReady = false,
  isOnline = true,
  score,
  status,
  typing = false,
}) => {
  const xpNeeded = level * 1000;
  const xpPercentage = Math.min((xp / xpNeeded) * 100, 100);

  return (
    <Card
      sx={{
        p: 2,
        position: "relative",
        background: isReady ? "linear-gradient(135deg, #1A202C 0%, #152A20 100%)" : "#1A202C",
        borderColor: isReady ? "#22C55E" : "rgba(255, 255, 255, 0.08)",
        borderWidth: "1px",
        borderStyle: "solid",
        display: "flex",
        alignItems: "center",
        gap: 2,
        minWidth: "220px",
        overflow: "hidden",
      }}
    >
      {/* Ready / Host Indicators */}
      {isHost && (
        <Box
          sx={{
            position: "absolute",
            top: 6,
            right: 8,
            backgroundColor: "#F59E0B",
            color: "#000000",
            fontSize: "0.55rem",
            fontWeight: 900,
            borderRadius: "4px",
            px: 0.8,
            py: 0.2,
          }}
        >
          HOST
        </Box>
      )}

      {isReady && !isHost && (
        <Box
          sx={{
            position: "absolute",
            top: 6,
            right: 8,
            backgroundColor: "#22C55E",
            color: "#FFFFFF",
            fontSize: "0.55rem",
            fontWeight: 900,
            borderRadius: "4px",
            px: 0.8,
            py: 0.2,
          }}
        >
          READY
        </Box>
      )}

      <Avatar online={isOnline} level={level} size={54}>
        {avatar}
      </Avatar>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          noWrap
          sx={{ color: isOnline ? "#FFFFFF" : "#9CA3AF" }}
        >
          {name}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
          <Typography variant="caption" sx={{ color: "#3B82F6", fontWeight: 700 }}>
            {rank}
          </Typography>
          {score !== undefined && (
            <Typography variant="caption" sx={{ color: "#22C55E", fontWeight: 800 }}>
              {score} PTS
            </Typography>
          )}
        </Box>

        {/* XP Progress Bar */}
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress
              variant="determinate"
              value={xpPercentage}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: "#2D3748",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#22C55E",
                },
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "0.6rem" }}>
            XP
          </Typography>
        </Box>

        {typing && (
          <Typography
            variant="caption"
            sx={{
              color: "#22C55E",
              fontStyle: "italic",
              display: "block",
              mt: 0.5,
              animation: "pulse 1.5s infinite",
            }}
          >
            Typing...
          </Typography>
        )}

        {status && !typing && (
          <Typography variant="caption" sx={{ color: "#9CA3AF", display: "block", mt: 0.5 }}>
            {status}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default PlayerCard;
