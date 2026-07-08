"use client";

import React from "react";
import { Card as MuiCard, CardProps as MuiCardProps } from "@mui/material";
import { motion } from "framer-motion";

export interface CardProps extends MuiCardProps {
  hoverEffect?: boolean;
}

const MotionMuiCard = motion(MuiCard);

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = true,
  sx,
  ...props
}) => {
  if (!hoverEffect) {
    return (
      <MuiCard
        sx={{
          backgroundColor: "#1A202C",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiCard>
    );
  }

  return (
    // @ts-ignore
    <MotionMuiCard
      whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0, 0, 0, 0.4)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      sx={{
        backgroundColor: "#1A202C",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        cursor: "pointer",
        overflow: "visible",
        ...sx,
      }}
      {...props}
    >
      {children}
    </MotionMuiCard>
  );
};

export default Card;
