"use client";

import React from "react";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/auth-slice";

export const Sidebar: React.FC = () => {
  const { navigate, pathname } = useAppNavigation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Leaderboard", icon: <LeaderboardIcon />, path: "/leaderboard" },
    { text: "Profile", icon: <AccountCircleIcon />, path: "/profile" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Box
      sx={{
        width: "260px",
        height: "100vh",
        backgroundColor: "#111827",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 3,
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      <Box>
        {/* Brand Logo */}
        <Box display="flex" alignItems="center" gap={1.5} mb={6} sx={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
          <SportsEsportsIcon sx={{ fontSize: 32, color: "#22C55E" }} />
          <Typography variant="h6" fontWeight={900} letterSpacing="-0.03em">
            PARTYVERSE <span style={{ color: "#22C55E" }}>AI</span>
          </Typography>
        </Box>

        {/* Menu Items */}
        <Stack spacing={1}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Box
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: isActive ? "rgba(34, 197, 94, 0.08)" : "transparent",
                  borderLeft: isActive ? "3px solid #22C55E" : "3px solid transparent",
                  color: isActive ? "#22C55E" : "#9CA3AF",
                  fontWeight: isActive ? 700 : 500,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: isActive ? "rgba(34, 197, 94, 0.08)" : "rgba(255, 255, 255, 0.03)",
                    color: isActive ? "#22C55E" : "#FFFFFF",
                  },
                }}
              >
                {item.icon}
                <Typography variant="body2">{item.text}</Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* User Info & Logout */}
      {user && (
        <Box
          sx={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            pt: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5} sx={{ minWidth: 0, cursor: "pointer" }} onClick={() => navigate("/profile")}>
            <Box sx={{ fontSize: "1.5rem" }}>{user.avatar}</Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                {user.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#3B82F6", fontWeight: 700 }}>
                {user.rank}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleLogout} sx={{ color: "#EF4444", "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.08)" } }}>
            <LogoutIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
