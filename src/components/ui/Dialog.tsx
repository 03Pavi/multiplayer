"use client";

import React from "react";
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseIcon from "@mui/icons-material/Close";
import Button from "./Button";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      fullScreen={fullScreen}
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(11, 15, 20, 0.8)",
          backdropFilter: "blur(4px)",
        },
      }}
    >

      {title && (
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <Typography variant="h6" component="div" fontWeight={700}>
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
              "&:hover": { color: "#FFFFFF" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent sx={{ p: 3, mt: title ? 0 : 2 }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            p: 3,
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            gap: 1.5,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </MuiDialog>
  );
};

export default Dialog;
