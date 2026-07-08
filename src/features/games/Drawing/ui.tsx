"use client";

import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, Stack, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import BrushIcon from "@mui/icons-material/Brush";
import { GameState } from "@/types";
import { Button, Card } from "@/components/ui";

interface DrawingUIProps {
  gameState: GameState;
  onSubmitAnswer: (answer: string) => void;
}

export const DrawingUI: React.FC<DrawingUIProps> = ({
  gameState,
  onSubmitAnswer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSubmitAnswer(dataUrl);
    setSubmitted(true);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: 2, textAlign: "center" }}>
      <Card sx={{ p: 3, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: "#3B82F6", fontWeight: 800, mb: 1 }}>
          DRAW THIS PROMPT:
        </Typography>
        <Typography variant="h6" fontWeight={800} color="#22C55E">
          {gameState.prompt || "Something futuristic!"}
        </Typography>
      </Card>

      <Box
        sx={{
          width: "100%",
          aspectRatio: "4/3",
          backgroundColor: "#0B0F14",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          position: "relative",
          overflow: "hidden",
          touchAction: "none",
          mb: 2,
        }}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ width: "100%", height: "100%", cursor: "crosshair" }}
        />
        
        {submitted && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(11, 15, 20, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h6" color="#22C55E" fontWeight={800}>
              ✓ DRAWING LOCKED IN
            </Typography>
          </Box>
        )}
      </Box>

      {!submitted && (
        <Stack direction="row" spacing={2} justifyContent="center">
          <IconButton onClick={clearCanvas} sx={{ color: "#EF4444", border: "1px solid rgba(255,255,255,0.08)" }}>
            <DeleteIcon />
          </IconButton>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit Canvas
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default DrawingUI;
