"use client";
import { useState } from "react";

export type AlertType = "danger" | "success" | "info" | "warning";

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  isBinary: boolean;
  onConfirm: () => void;
}

export function useTytaAlert() {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    isBinary: false,
    onConfirm: () => {},
  });

  const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message,
      // Solo es binario si es peligroso O si pasamos una función de confirmación
      isBinary: type === "danger" || (!!onConfirm && type !== "success"), 
      onConfirm: onConfirm || (() => setAlert((prev) => ({ ...prev, isOpen: false }))),
    });
  };

  const closeAlert = () => setAlert((prev) => ({ ...prev, isOpen: false }));

  return { alert, showAlert, closeAlert };
}