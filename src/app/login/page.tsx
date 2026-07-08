"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Stack, Divider } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import GoogleIcon from "@mui/icons-material/Google";
import EmailIcon from "@mui/icons-material/Email";
import { Button, Card } from "@/components/ui";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/auth-slice";
import { authService } from "@/services/auth-service";

const loginSchema = zod.object({
  email: zod.string().email("Enter a valid email address"),
});

type LoginForm = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const { navigate } = useAppNavigation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Check if we are returning from a Magic Link redirect
  useEffect(() => {
    const handleEmailLinkVerification = async () => {
      const href = window.location.href;
      if (href.includes("verifyEmail=true")) {
        setVerifying(true);
        try {
          const user = await authService.completeMagicLinkSignIn("", href);
          if (user) {
            dispatch(
              loginSuccess({
                user: {
                  id: user.uid,
                  name: user.displayName || user.email?.split("@")[0] || "Gamer",
                  avatar: "🎮",
                  level: 1,
                  xp: 0,
                  rank: "Unranked",
                  bio: "Activated with Magic Link!",
                  wins: 0,
                  gamesPlayed: 0,
                  badges: ["First Recruit"],
                },
                token: "magic-link-token",
              })
            );
            navigate("/dashboard");
          }
        } catch (err) {
          console.error("Magic link verification failed", err);
          alert("Magic link expired or invalid.");
        } finally {
          setVerifying(false);
        }
      }
    };

    handleEmailLinkVerification();
  }, [dispatch, navigate]);

  const onSendMagicLink = async (data: LoginForm) => {
    setLoading(true);
    try {
      await authService.sendMagicLink(data.email);
      setLinkSent(true);
    } catch (err) {
      console.error(err);
      alert("Failed to send Magic Link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const user = await authService.signInWithGoogle();
      if (user) {
        dispatch(
          loginSuccess({
            user: {
              id: user.uid,
              name: user.displayName || "Google Gamer",
              avatar: "🦊",
              level: 1,
              xp: 0,
              rank: "Unranked",
              bio: "Conquering the PartyVerse with Google!",
              wins: 0,
              gamesPlayed: 0,
              badges: ["First Recruit"],
            },
            token: "google-oauth-token",
          })
        );
        navigate("/dashboard");
      } else {
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Google Sign-In failed. Try again.");
      setGoogleLoading(false);
    }
  };


  if (verifying) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#0B0F14", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h6" fontWeight={800}>
          VERIFYING MAGIC LINK COORDINATES...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0B0F14",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Card sx={{ p: 4, width: "100%", maxWidth: "420px" }}>
        <Stack alignItems="center" spacing={1} mb={4}>
          <SportsEsportsIcon sx={{ color: "#22C55E", fontSize: 40 }} />
          <Typography variant="h5" fontWeight={900}>
            SIGN IN
          </Typography>
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
            Enter the PartyVerse AI Arena
          </Typography>
        </Stack>

        {!linkSent ? (
          <form onSubmit={handleSubmit(onSendMagicLink)}>
            <Stack spacing={3}>
              <TextField
                label="Email Address"
                fullWidth
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register("email")}
                InputLabelProps={{ style: { color: "#9CA3AF" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#FFFFFF",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                    "&:hover fieldset": { borderColor: "#3B82F6" },
                  },
                }}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                loading={loading}
                startIcon={<EmailIcon />}
              >
                Send Magic Link
              </Button>
            </Stack>
          </form>
        ) : (
          <Stack spacing={2} textAlign="center">
            <Typography variant="body1" color="#22C55E" fontWeight={700}>
              ✓ MAGIC LINK DISPATCHED!
            </Typography>
            <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
              Check your inbox for a passwordless sign-in connection link.
            </Typography>
            <Button variant="outlined" color="secondary" fullWidth onClick={() => setLinkSent(false)}>
              Back to Email Sign In
            </Button>
          </Stack>
        )}

        <Divider sx={{ my: 3, color: "rgba(255,255,255,0.15)", fontSize: "0.8rem", fontWeight: 700 }}>
          OR CONNECT VIA
        </Divider>

        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={onGoogleSignIn}
          loading={googleLoading}
          startIcon={<GoogleIcon />}
        >
          Sign In with Google
        </Button>
      </Card>
    </Box>
  );
}
