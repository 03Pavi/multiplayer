"use client";

import React, { useState } from "react";
import { Box, Typography, TextField, Stack, Link } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { Button, Card } from "@/components/ui";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/auth-slice";

const registerSchema = zod.object({
  username: zod.string().min(3, "Username must be at least 3 characters long"),
  email: zod.string().email("Enter a valid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters long"),
});

type RegisterForm = zod.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { navigate } = useAppNavigation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterForm) => {
    setLoading(true);
    // Simulate API Register & Login
    setTimeout(() => {
      dispatch(
        loginSuccess({
          user: {
            id: `user-${Date.now()}`,
            name: data.username,
            avatar: "🎮",
            level: 1,
            xp: 0,
            rank: "Unranked",
            bio: "PartyVerse Rookie ready to roll!",
            wins: 0,
            gamesPlayed: 0,
            badges: ["Rookie Recruit"],
          },
          token: "mock-jwt-token",
        })
      );
      setLoading(false);
      navigate("/email-verification");
    }, 1200);
  };

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
            CREATE ACCOUNT
          </Typography>
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
            Join the multiplayer party platform
          </Typography>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <TextField
              label="Username"
              fullWidth
              variant="outlined"
              error={!!errors.username}
              helperText={errors.username?.message}
              {...register("username")}
              InputLabelProps={{ style: { color: "#9CA3AF" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                  "&:hover fieldset": { borderColor: "#3B82F6" },
                },
              }}
            />

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

            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register("password")}
              InputLabelProps={{ style: { color: "#9CA3AF" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                  "&:hover fieldset": { borderColor: "#3B82F6" },
                },
              }}
            />

            <Button variant="contained" color="primary" fullWidth type="submit" loading={loading}>
              Register Account
            </Button>
          </Stack>
        </form>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
            Already have an account?{" "}
            <Link
              onClick={() => navigate("/login")}
              sx={{ color: "#3B82F6", cursor: "pointer", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
