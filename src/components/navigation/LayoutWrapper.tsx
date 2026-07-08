"use client";

import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import MobileHeader from "./MobileHeader";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useAppSelector } from "@/store/hooks";

export interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const { pathname } = useAppNavigation();
  const theme = useTheme();
  // Sidebar visible on anything > 600px (sm). Only true phones hide it.
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Paths that do NOT show the sidebar or bottom navigation
  const noNavPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/email-verification"];
  const isNavHidden = noNavPaths.includes(pathname || "");

  if (isNavHidden) {
    return <Box sx={{ minHeight: "100vh", backgroundColor: "#0B0F14" }}>{children}</Box>;
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#0B0F14", display: "flex" }}>
      {/* Sidebar — always visible on sm+ (tablets & desktops) */}
      {!isMobile && <Sidebar />}

      {/* Top Header — only on true mobile phones */}
      {isMobile && <MobileHeader />}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          pl: !isMobile ? "260px" : 0,   // offset for fixed sidebar
          pt: isMobile ? "60px" : 0,      // offset for mobile top bar
          pb: isMobile ? "70px" : 0,      // offset for bottom nav
          width: "100%",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Box>

      {/* Bottom Nav — only on true mobile phones */}
      {isMobile && <BottomNav />}
    </Box>
  );
};

export default LayoutWrapper;
