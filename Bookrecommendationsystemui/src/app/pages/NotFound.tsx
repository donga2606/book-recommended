import { Link } from "react-router";
import { Home } from "lucide-react";
import { Button } from "../components/ui/button";
import React from "react";

export function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-semibold text-slate-800 mb-4">404</h1>
        <p className="text-xl text-slate-600 mb-8">Page not found</p>
        <Link to="/">
          <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
