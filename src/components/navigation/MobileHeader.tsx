"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/auth-slice";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leaderboard": "Leaderboard",
  "/profile": "Profile",
  "/settings": "Settings",
};

export const MobileHeader: React.FC = () => {
  const { navigate, pathname } = useAppNavigation();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

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

      {/* Right: Logout (mobile) / Avatar (desktop handled by Sidebar) */}
      <IconButton
        onClick={handleLogout}
        aria-label="Log out"
        sx={{
          display: { xs: "flex", sm: "none" },
          color: "#EF4444",
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          width: 36,
          height: 36,
          "&:hover": { backgroundColor: "rgba(239,68,68,0.12)", borderColor: "#EF4444" },
        }}
      >
        <LogoutIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  );
};

export default MobileHeader;

