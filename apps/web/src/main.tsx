import "@fontsource/plus-jakarta-sans";
import "@fontsource/be-vietnam-pro";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./router";
import { AuthProvider } from "./context/AuthContext";
import { I18nProvider } from "./i18n/I18nContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </I18nProvider>
  </React.StrictMode>
);
