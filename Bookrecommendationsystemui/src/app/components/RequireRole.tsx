import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

interface RequireRoleProps {
  allowedRoles: string[];
}

export function RequireRole({ allowedRoles }: RequireRoleProps) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading your permissions...</p>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
