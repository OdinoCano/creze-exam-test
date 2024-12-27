import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const TimedAlertDialog = ({ 
  open, 
  onClose, 
  countdownTime, 
  title = "Alert", 
  content = "This dialog will close automatically.", 
  type = "info", // Accepts 'info', 'warning', 'error', etc.
  button
}) => {
  const [timeLeft, setTimeLeft] = useState(countdownTime);

  useEffect(() => {
    if (open && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      onClose();
    }
  }, [timeLeft, onClose]);

  const getTypeColor = () => {
    switch (type) {
      case "warning":
        return "orange";
      case "error":
        return "red";
      case "success":
        return "green";
      default:
        return "blue";
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={{ color: getTypeColor() }}>{title}</DialogTitle>
      <DialogContent>
        {content} {timeLeft > 0 && <strong>{timeLeft} seconds</strong>}.
      </DialogContent>
      {button?
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close Now
        </Button>
      </DialogActions>:
      ''}
    </Dialog>
  );
};

export default TimedAlertDialog;