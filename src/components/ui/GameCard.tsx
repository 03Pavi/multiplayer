"use client";

import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import Card from "./Card";
import Button from "./Button";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

export interface GameCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  playersCount: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  onSelect?: () => void;
  ctaText?: string;
  layout?: "vertical" | "horizontal";
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  icon,
  playersCount,
  duration,
  difficulty,
  onSelect,
  ctaText = "Select Game",
  layout = "vertical",
}) => {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case "Easy":
        return "#22C55E";
      case "Medium":
        return "#F59E0B";
      case "Hard":
        return "#EF4444";
      default:
        return "#3B82F6";
    }
  };

  const isHorizontal = layout === "horizontal";

  return (
    <Card
      sx={{
        p: 3,
        display: "flex",
        flexDirection: isHorizontal ? { xs: "column", sm: "row" } : "column",
        justifyContent: "space-between",
        height: "100%",
        minHeight: isHorizontal ? { xs: "280px", sm: "200px" } : "260px",
        gap: 3,
        width: "100%",
        position: "relative",
      }}
    >
      {/* Left Column (or main block) */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box
              sx={{
                fontSize: "2rem",
                p: 1.5,
                borderRadius: "12px",
                backgroundColor: "#222831",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </Box>
            {!isHorizontal && (
              <Chip
                label={difficulty}
                size="small"
                sx={{
                  backgroundColor: `${getDifficultyColor()}15`,
                  color: getDifficultyColor(),
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  borderRadius: "6px",
                  border: `1px solid ${getDifficultyColor()}30`,
                }}
              />
            )}
          </Box>

          <Typography variant="h5" fontWeight={900} mb={1}>
            {title}
          </Typography>
          
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
            {description}
          </Typography>
        </Box>
      </Box>

      {/* Right Column (or footer block) */}
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", width: isHorizontal ? { xs: "100%", sm: "240px" } : "100%" }}>
        {isHorizontal && (
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Chip
              label={difficulty}
              size="small"
              sx={{
                backgroundColor: `${getDifficultyColor()}15`,
                color: getDifficultyColor(),
                fontWeight: 800,
                fontSize: "0.75rem",
                borderRadius: "6px",
                border: `1px solid ${getDifficultyColor()}30`,
              }}
            />
          </Box>
        )}

        <Box display="flex" gap={2} mb={2.5} sx={{ color: "#9CA3AF" }}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <SportsEsportsIcon sx={{ fontSize: 16, color: "#3B82F6" }} />
            <Typography variant="caption" fontWeight={600}>
              {playersCount} Players
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <AccessTimeIcon sx={{ fontSize: 16, color: "#3B82F6" }} />
            <Typography variant="caption" fontWeight={600}>
              {duration}
            </Typography>
          </Box>
        </Box>

        {onSelect && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onSelect}
            sx={{
              minHeight: "44px",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            {ctaText}
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default GameCard;
