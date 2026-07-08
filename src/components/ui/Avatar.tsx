"use client";

import React from "react";
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps, Badge, Box } from "@mui/material";

export interface AvatarProps extends MuiAvatarProps {
  online?: boolean;
  level?: number;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  online,
  level,
  size = 48,
  sx,
  children,
  ...props
}) => {
  const avatarEl = (
    <MuiAvatar
      sx={{
        width: size,
        height: size,
        backgroundColor: "#222831",
        border: "2px solid rgba(255, 255, 255, 0.1)",
        fontSize: size * 0.45,
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiAvatar>
  );

  return (
    <Box position="relative" display="inline-flex">
      {online !== undefined ? (
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: online ? "#22C55E" : "#9CA3AF",
              color: online ? "#22C55E" : "#9CA3AF",
              boxShadow: online ? "0 0 0 2px #0B0F14, 0 0 8px #22C55E" : "0 0 0 2px #0B0F14",
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: "50%",
            },
          }}
        >
          {avatarEl}
        </Badge>
      ) : (
        avatarEl
      )}
      
      {level !== undefined && (
        <Box
          sx={{
            position: "absolute",
            bottom: -4,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#3B82F6",
            color: "#FFFFFF",
            fontSize: "0.65rem",
            fontWeight: 800,
            borderRadius: "4px",
            px: 0.8,
            py: 0.1,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {level}
        </Box>
      )}
    </Box>
  );
};

export default Avatar;
