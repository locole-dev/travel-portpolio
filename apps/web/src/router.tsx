import { createBrowserRouter, Navigate } from "react-router-dom";

import { AdminLayout } from "./components/admin/AdminLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { HomePage } from "./pages/HomePage";
import { HomestayDetailPage } from "./pages/HomestayDetailPage";
import { ClosingPage } from "./pages/admin/ClosingPage";
import { ContactsPage } from "./pages/admin/ContactsPage";
import { HomestayPage } from "./pages/admin/HomestayPage";
import { LoginPage } from "./pages/admin/LoginPage";
import { MediaPage } from "./pages/admin/MediaPage";
import { ProfilePage } from "./pages/admin/ProfilePage";
import { ServicesPage } from "./pages/admin/ServicesPage";
import { SettingsPage } from "./pages/admin/SettingsPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />
      },
      {
        path: "/homestay",
        element: <HomestayDetailPage />
      }
    ]
  },
  {
    path: "/admin/login",
    element: <LoginPage />
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="profile" replace />
      },
      {
        path: "profile",
        element: <ProfilePage />
      },
      {
        path: "contacts",
        element: <ContactsPage />
      },
      {
        path: "homestay",
        element: <HomestayPage />
      },
      {
        path: "services",
        element: <ServicesPage />
      },
      {
        path: "closing",
        element: <ClosingPage />
      },
      {
        path: "media",
        element: <MediaPage />
      },
      {
        path: "settings",
        element: <SettingsPage />
      }
    ]
  }
]);
