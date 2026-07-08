"use client";

import React, { useState } from "react";
import { Box, Typography, TextField, Stack, Link } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { Button, Card } from "@/components/ui";
import { useAppNavigation } from "@/hooks/use-app-navigation";

const resetSchema = zod.object({
  password: zod.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: zod.string().min(6, "Passwords must match"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetForm = zod.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const { navigate } = useAppNavigation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
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
            RESET PASSWORD
          </Typography>
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
            Establish your new secure coordinates
          </Typography>
        </Stack>

        {!success ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField
                label="New Password"
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

              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                variant="outlined"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                {...register("confirmPassword")}
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
                Reset Coordinates
              </Button>
            </Stack>
          </form>
        ) : (
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="body1" color="#22C55E" fontWeight={700}>
              ✓ Password Reset Completed Successfully!
            </Typography>
            <Button variant="contained" color="primary" fullWidth onClick={() => navigate("/login")}>
              Go to Sign In
            </Button>
          </Stack>
        )}

        <Box mt={3} textAlign="center">
          <Link
            onClick={() => navigate("/login")}
            sx={{ color: "#9CA3AF", cursor: "pointer", fontSize: "0.85rem", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            Cancel and Return
          </Link>
        </Box>
      </Card>
    </Box>
  );
}
