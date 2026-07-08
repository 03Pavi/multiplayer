"use client";

import React from "react";
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";

export interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  animate?: boolean;
}

const MotionMuiButton = motion(MuiButton);

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  animate = true,
  disabled,
  sx,
  ...props
}) => {
  const buttonContent = loading ? (
    <CircularProgress size={24} color="inherit" />
  ) : (
    children
  );

  if (!animate) {
    return (
      <MuiButton
        disabled={disabled || loading}
        sx={{
          minHeight: "48px",
          borderRadius: "8px",
          px: 4,
          ...sx,
        }}
        {...props}
      >
        {buttonContent}
      </MuiButton>
    );
  }

  return (
    // @ts-ignore
    <MotionMuiButton
      whileHover={{ scale: disabled || loading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      sx={{
        minHeight: "48px",
        borderRadius: "8px",
        px: 4,
        ...sx,
      }}
      {...props}
    >
      {buttonContent}
    </MotionMuiButton>
  );
};

export default Button;
