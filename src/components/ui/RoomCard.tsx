"use client";

import React from "react";
import { Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import Card from "./Card";
import Button from "./Button";
import PeopleIcon from "@mui/icons-material/People";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export interface RoomCardProps {
  id: string;
  name: string;
  code: string;
  hostName: string;
  playersCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  gameType?: string;
  onJoin?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  name,
  code,
  hostName,
  playersCount,
  maxPlayers,
  isPrivate,
  gameType = "Lobby",
  onJoin,
  onDelete,
  isOwner,
}) => {
  return (
    <Card
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <Typography variant="subtitle1" fontWeight={800} noWrap>
            {name}
          </Typography>
          <Chip
            label={code}
            size="small"
            sx={{
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              color: "#3B82F6",
              fontWeight: 800,
              borderRadius: "4px",
              fontFamily: "monospace",
              height: 20,
            }}
          />
        </Box>
        
        <Typography variant="caption" sx={{ color: "#9CA3AF", display: "block" }}>
          Host: <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{hostName}</span> • Playing: <span style={{ color: "#22C55E", fontWeight: 600 }}>{gameType}</span>
        </Typography>

        <Box display="flex" alignItems="center" gap={2} mt={1}>
          <Box display="flex" alignItems="center" gap={0.5} sx={{ color: "#9CA3AF" }}>
            <PeopleIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight={600}>
              {playersCount}/{maxPlayers}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5} sx={{ color: isPrivate ? "#EF4444" : "#22C55E" }}>
            {isPrivate ? <LockIcon sx={{ fontSize: 14 }} /> : <LockOpenIcon sx={{ fontSize: 14 }} />}
            <Typography variant="caption" fontWeight={700}>
              {isPrivate ? "Private" : "Public"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={1}>
        {isOwner && onDelete && (
          <Tooltip title="Delete Room">
            <IconButton
              onClick={onDelete}
              size="small"
              sx={{
                color: "#EF4444",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px",
                width: 40,
                height: 40,
                "&:hover": {
                  backgroundColor: "rgba(239,68,68,0.1)",
                  borderColor: "#EF4444",
                },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {onJoin && (
          <Button
            variant="contained"
            color="secondary"
            onClick={onJoin}
            sx={{
              minHeight: "40px",
              px: 3,
              fontSize: "0.85rem",
              fontWeight: 700,
            }}
          >
            Join
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default RoomCard;

