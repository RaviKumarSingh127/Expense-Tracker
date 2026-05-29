import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#13131A",
            color: "#F1F0FF",
            border: "1px solid #1E1E2E",
            borderRadius: "12px",
          },
          success: { iconTheme: { primary: "#06D6A0", secondary: "#0A0A0F" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "#0A0A0F" } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
