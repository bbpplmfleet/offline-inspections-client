import { ToastOptions, toast } from "react-toastify";

export function toastHelper({
  message,
  type,
}: {
  message: string;
  type?: "info" | "warn" | "error" | "success" | undefined;
}) {
  let params: ToastOptions = {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };
  switch (type) {
    case "info":
      toast.info(message, params);
      break;
    case "warn":
      toast.warn(message, params);
      break;
    case "error":
      toast.error(message, params);
      break;
    case "success":
      toast.success(message, params);
      break;
    default:
      toast(message, params);
      break;
      return;
  }
}
