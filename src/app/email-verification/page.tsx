"use client";

import React, { useState } from "react";
import { Box, Typography, TextField, Stack, Link } from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { Button, Card } from "@/components/ui";
import { useAppNavigation } from "@/hooks/use-app-navigation";

export default function EmailVerificationPage() {
  const { navigate } = useAppNavigation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      setError("Please enter a valid 4-digit code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
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
            VERIFY EMAIL
          </Typography>
          <Typography variant="body2" sx={{ color: "#9CA3AF", textAlign: "center" }}>
            A 4-digit verification code was sent to your inbox.
          </Typography>
        </Stack>

        <form onSubmit={handleVerify}>
          <Stack spacing={3}>
            <TextField
              label="Verification Code (4 digits)"
              variant="outlined"
              fullWidth
              value={code}
              onChange={(e) => {
                setError("");
                setCode(e.target.value.replace(/\D/g, "").slice(0, 4));
              }}
              error={!!error}
              helperText={error}
              InputLabelProps={{ style: { color: "#9CA3AF" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  letterSpacing: "0.5em",
                  textAlign: "center",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                  "&:hover fieldset": { borderColor: "#3B82F6" },
                },
              }}
            />

            <Button variant="contained" color="primary" fullWidth type="submit" loading={loading} disabled={code.length < 4}>
              Activate Account
            </Button>
          </Stack>
        </form>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
            Didn't receive the code?{" "}
            <Link
              onClick={() => alert("Code resent!")}
              sx={{ color: "#3B82F6", cursor: "pointer", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              Resend Code
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
