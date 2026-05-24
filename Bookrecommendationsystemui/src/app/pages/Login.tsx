import React, { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { Book } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

function getDefaultPathByRole(role: string): string {
  if (role === "admin") {
    return "/admin";
  }
  if (role === "data_scientist") {
    return "/data-scientist";
  }
  return "/";
}

export function Login() {
  const location = useLocation();
  const { login, user, isAuthenticated, isInitializing } = useAuth();

  const [email, setEmail] = useState("alex.johnson@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isInitializing && isAuthenticated && user) {
    const state = location.state as LocationState | null;
    const fromPath = state?.from?.pathname;
    const fallbackPath = getDefaultPathByRole(user.role);
    return <Navigate to={fromPath ?? fallbackPath} replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <Book className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold text-slate-800">BookRec Login</CardTitle>
          </div>
          <CardDescription>Sign in to access your recommendations dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-xs text-slate-500 space-y-1">
            <p>Sample accounts:</p>
            <p>- alex.johnson@example.com (user)</p>
            <p>- admin@example.com (admin)</p>
            <p>- datasci@example.com (data scientist)</p>
            <p>Password: password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
