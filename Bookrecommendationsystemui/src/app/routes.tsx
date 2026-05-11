import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/user/Home";
import { Search } from "./pages/user/Search";
import { BookDetail } from "./pages/user/BookDetail";
import { Profile } from "./pages/user/Profile";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { DataScientistDashboard } from "./pages/data-scientist/DataScientistDashboard";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "search", Component: Search },
      { path: "book/:id", Component: BookDetail },
      { path: "profile", Component: Profile },
      { path: "admin", Component: AdminDashboard },
      { path: "data-scientist", Component: DataScientistDashboard },
      { path: "*", Component: NotFound }
    ]
  }
]);
