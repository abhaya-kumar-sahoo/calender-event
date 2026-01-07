export const isTesting = false;

// Use Vite's environment variable system
// Reads VITE_NODE_ENV from .env file to determine which backend to use
export const baseUrl =
  import.meta.env.MODE === "production"
    ? "https://appointmentbackend.equartistech.com"
    : "http://localhost:5001";
