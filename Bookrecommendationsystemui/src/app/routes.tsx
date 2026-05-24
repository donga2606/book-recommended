import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { RequireRole } from "./components/RequireRole";
import { Home } from "./pages/user/Home";
import { Search } from "./pages/user/Search";
import { BookDetail } from "./pages/user/BookDetail";
import { Profile } from "./pages/user/Profile";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { DataScientistDashboard } from "./pages/data-scientist/DataScientistDashboard";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: RequireAuth,
    children: [
      {
        Component: Layout,
        children: [
          { index: true, Component: Home },
          { path: "search", Component: Search },
          { path: "book/:id", Component: BookDetail },
          { path: "profile", Component: Profile },
          {
            Component: () => <RequireRole allowedRoles={["admin"]} />,
            children: [{ path: "admin", Component: AdminDashboard }],
          },
          {
            Component: () => <RequireRole allowedRoles={["data_scientist"]} />,
            children: [{ path: "data-scientist", Component: DataScientistDashboard }],
          },
          { path: "*", Component: NotFound },
        ],
      },
    ],
  },
]);
