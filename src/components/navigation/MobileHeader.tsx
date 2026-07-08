"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Stack,
  Divider,
} from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/auth-slice";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leaderboard": "Leaderboard",
  "/profile": "Profile",
  "/settings": "Settings",
};

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Leaderboard", icon: <LeaderboardIcon />, path: "/leaderboard" },
  { text: "Profile", icon: <AccountCircleIcon />, path: "/profile" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

export const MobileHeader: React.FC = () => {
  const { navigate, pathname } = useAppNavigation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pageTitle = pathname
    ? PAGE_TITLES[pathname] ?? (pathname.startsWith("/room/") ? "Game Room" : "PartyVerse")
    : "PartyVerse";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Top App Bar */}
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
        {/* Left: Hamburger */}
        <IconButton
          onClick={() => setDrawerOpen(true)}
          size="small"
          sx={{
            color: "#9CA3AF",
            "&:hover": { color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.05)" },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Center: Page Title + Brand */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          <SportsEsportsIcon sx={{ fontSize: 20, color: "#22C55E" }} />
          <Typography
            variant="subtitle2"
            fontWeight={900}
            letterSpacing="-0.02em"
            sx={{ color: "#FFFFFF" }}
          >
            {pageTitle}
          </Typography>
        </Box>

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

      {/* Slide-in Drawer Menu */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: "#111827",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            p: 0,
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={3}
          py={2.5}
          sx={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <SportsEsportsIcon sx={{ fontSize: 26, color: "#22C55E" }} />
            <Typography variant="h6" fontWeight={900} letterSpacing="-0.03em">
              PARTY<span style={{ color: "#22C55E" }}>VERSE</span>
            </Typography>
          </Box>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            size="small"
            sx={{ color: "#6B7280", "&:hover": { color: "#FFFFFF" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* User card */}
        {user && (
          <Box
            px={3}
            py={2}
            sx={{ backgroundColor: "rgba(34,197,94,0.05)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ fontSize: "2rem" }}>{user.avatar}</Box>
              <Box>
                <Typography variant="body2" fontWeight={800}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "#3B82F6", fontWeight: 700 }}>
                  {user.rank} · Lv.{user.level ?? 1}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Nav Items */}
        <Stack spacing={0.5} p={2} flexGrow={1}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Box
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  borderRadius: "10px",
                  cursor: "pointer",
                  backgroundColor: isActive ? "rgba(34,197,94,0.08)" : "transparent",
                  borderLeft: isActive ? "3px solid #22C55E" : "3px solid transparent",
                  color: isActive ? "#22C55E" : "#9CA3AF",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor: isActive ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.04)",
                    color: isActive ? "#22C55E" : "#FFFFFF",
                  },
                }}
              >
                {item.icon}
                <Typography variant="body2" fontWeight={isActive ? 800 : 500}>
                  {item.text}
                </Typography>
                {isActive && (
                  <Box
                    sx={{
                      ml: "auto",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#22C55E",
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Stack>

        {/* Divider + Logout */}
        <Box px={2} pb={3}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", mb: 2 }} />
          <Box
            onClick={handleLogout}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 2,
              py: 1.5,
              borderRadius: "10px",
              cursor: "pointer",
              color: "#EF4444",
              transition: "all 0.15s ease",
              "&:hover": { backgroundColor: "rgba(239,68,68,0.08)" },
            }}
          >
            <LogoutIcon fontSize="small" />
            <Typography variant="body2" fontWeight={700}>
              Sign Out
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default MobileHeader;
