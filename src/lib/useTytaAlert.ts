"use client";
import { useState } from "react";

export type AlertType = "danger" | "success" | "info" | "warning";

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  isBinary: boolean; // <-- Nueva propiedad
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
      isBinary: type === "danger", // Si es danger, automáticamente es binario (SÍ/NO)
      onConfirm: onConfirm || (() => setAlert((prev) => ({ ...prev, isOpen: false }))),
    });
  };

  const closeAlert = () => setAlert((prev) => ({ ...prev, isOpen: false }));

  return { alert, showAlert, closeAlert };
}