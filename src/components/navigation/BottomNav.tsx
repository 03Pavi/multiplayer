"use client";

import React from "react";
import { Box, Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import { useAppNavigation } from "@/hooks/use-app-navigation";

export const BottomNav: React.FC = () => {
  const { navigate, pathname } = useAppNavigation();

  // Find index of current route
  const getIndex = () => {
    switch (pathname) {
      case "/dashboard":
        return 0;
      case "/leaderboard":
        return 1;
      case "/profile":
        return 2;
      case "/settings":
        return 3;
      default:
        return 0;
    }
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    const paths = ["/dashboard", "/leaderboard", "/profile", "/settings"];
    navigate(paths[newValue]);
  };

  return (
    <Box sx={{ display: { xs: "block", md: "none" }, position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
      <Paper elevation={3} sx={{ borderRadius: "16px 16px 0 0", borderTop: "1px solid rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
        <BottomNavigation
          value={getIndex()}
          onChange={handleChange}
          sx={{
            height: 64,
            backgroundColor: "#111827",
            "& .MuiBottomNavigationAction-root": {
              minWidth: "auto",
              color: "#9CA3AF",
              "&.Mui-selected": {
                color: "#22C55E",
              },
            },
          }}
        >
          <BottomNavigationAction label="Home" icon={<DashboardIcon />} />
          <BottomNavigationAction label="Leaderboard" icon={<LeaderboardIcon />} />
          <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} />
          <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default BottomNav;
