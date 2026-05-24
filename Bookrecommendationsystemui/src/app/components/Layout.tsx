import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Book, LayoutDashboard, BarChart3, Search, User, Home, LogOut } from "lucide-react";
import { cn } from "./ui/utils";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role = user?.role;
  const canAccessAdmin = role === "admin";
  const canAccessDataScientist = role === "data_scientist";

  const isActive = (path: string) => location.pathname === path;
  const isAdminActive = location.pathname === "/admin";
  const isDataScientistActive = location.pathname === "/data-scientist";

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <Book className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800">BookRec</h1>
          </div>
        </div>
        
        {/* Role Switcher */}
        <div className="p-4 border-b border-slate-200">
          <p className="text-xs text-slate-500 mb-2">Workspaces</p>
          <div className="space-y-1">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                !isAdminActive && !isDataScientistActive
                  ? "bg-purple-50 text-purple-700"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <User className="w-4 h-4" />
              User Dashboard
            </Link>
            {canAccessAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  isAdminActive
                    ? "bg-purple-50 text-purple-700"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            )}
            {canAccessDataScientist && (
              <Link
                to="/data-scientist"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  isDataScientistActive
                    ? "bg-purple-50 text-purple-700"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <BarChart3 className="w-4 h-4" />
                Data Scientist
              </Link>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          {!isAdminActive && !isDataScientistActive && (
            <>
              <p className="text-xs text-slate-500 mb-2">User Menu</p>
              <div className="space-y-1">
                <Link
                  to="/"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive("/")
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link
                  to="/search"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive("/search")
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Search className="w-4 h-4" />
                  Search Books
                </Link>
                <Link
                  to="/profile"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive("/profile")
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
              </div>
            </>
          )}
        </nav>
        
        {/* User Info */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full" />
            <div className="min-w-0">
              <p className="text-sm text-slate-800 truncate">{user?.name ?? "Unknown user"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email ?? "No email"}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-3 justify-start" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
