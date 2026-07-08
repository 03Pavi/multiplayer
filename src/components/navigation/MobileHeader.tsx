"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useAppSelector } from "@/store/hooks";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leaderboard": "Leaderboard",
  "/profile": "Profile",
  "/settings": "Settings",
};

export const MobileHeader: React.FC = () => {
  const { navigate, pathname } = useAppNavigation();
  const user = useAppSelector((state) => state.auth.user);

  const pageTitle = pathname
    ? PAGE_TITLES[pathname] ?? (pathname.startsWith("/room/") ? "Game Room" : "PartyVerse")
    : "PartyVerse";

  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: "60px",
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
      }}
    >
      {/* Left: Brand */}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        sx={{ cursor: "pointer" }}
        onClick={() => navigate("/dashboard")}
      >
        <SportsEsportsIcon sx={{ fontSize: 22, color: "#22C55E" }} />
        <Typography
          variant="subtitle2"
          fontWeight={900}
          letterSpacing="-0.02em"
          sx={{ color: "#FFFFFF" }}
        >
          PARTY<span style={{ color: "#22C55E" }}>VERSE</span>
        </Typography>
      </Box>

      {/* Center: Page Title */}
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ color: "#9CA3AF", letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.7rem" }}
      >
        {pageTitle}
      </Typography>

      {/* Right: Avatar shortcut */}
      <Box
        onClick={() => navigate("/profile")}
        sx={{
          fontSize: "1.4rem",
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": { backgroundColor: "rgba(34,197,94,0.12)", borderColor: "#22C55E" },
        }}
      >
        {user?.avatar ?? "🎮"}
      </Box>
    </Box>
  );
};

export default MobileHeader;

