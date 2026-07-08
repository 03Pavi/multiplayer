"use client";

import React from "react";
import { Box, Container, Typography, Stack, Switch, FormControlLabel } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Card } from "@/components/ui";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  toggleSound,
  toggleMusic,
  toggleNotifications,
} from "@/store/settings-slice";
import { playSound } from "@/utils/sound";

export default function SettingsPage() {
  const settings = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  const handleToggle = (action: any) => {
    dispatch(action());
    if (settings.soundEnabled) {
      playSound("click");
    }
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, minHeight: "100vh" }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box mb={5}>
          <Typography variant="h4" fontWeight={900}>
            SETTINGS
          </Typography>
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
            Configure audio parameters, accessibility, and notifications.
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* Audio Settings */}
          <Card sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} mb={3} display="flex" alignItems="center" gap={1.5}>
              <VolumeUpIcon sx={{ color: "#3B82F6" }} />
              Audio Parameters
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.soundEnabled}
                    onChange={() => handleToggle(toggleSound)}
                    color="primary"
                  />
                }
                label="Sound Effects (UI & Clicks)"
                sx={{ color: "#FFFFFF" }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.musicEnabled}
                    onChange={() => handleToggle(toggleMusic)}
                    color="primary"
                  />
                }
                label="Lobby Background Music"
                sx={{ color: "#FFFFFF" }}
              />
            </Stack>
          </Card>

          {/* Notifications */}
          <Card sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} mb={3} display="flex" alignItems="center" gap={1.5}>
              <NotificationsIcon sx={{ color: "#EF4444" }} />
              Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notificationsEnabled}
                  onChange={() => handleToggle(toggleNotifications)}
                  color="primary"
                />
              }
              label="Allow Push Notifications (Friend online, Room Invites)"
              sx={{ color: "#FFFFFF" }}
            />
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

