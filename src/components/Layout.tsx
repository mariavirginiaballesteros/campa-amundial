import { Link, useLocation } from "react-router-dom";
import { Trophy, Users, Activity, LogIn, LogOut } from "lucide-react";
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";

export const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { session, signOut } = useAuth();

  // El ranking lo ven todos. La gestión la ve RRHH logueado.
  const navLinks = [
    { name: "Tablero General", path: "/", icon: Trophy },
    ...(session ? [
      { name: "Equipos", path: "/equipos", icon: Users },
      { name: "Canchas", path: "/actividades", icon: Activity },
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-10 border-b-4 border-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-secondary p-1.5 rounded-full">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-xl tracking-tight hidden sm:block">Campaña Mundial</h1>
            </div>
            <nav className="flex items-center space-x-1">
              <div className="hidden md:flex space-x-1 mr-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${isActive ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
              
              {session ? (
                <Button variant="ghost" size="sm" onClick={signOut} className="text-white hover:bg-white/10 hover:text-white">
                  <LogOut className="w-4 h-4 mr-2" /> Salir
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
                    <LogIn className="w-4 h-4 mr-2" /> Soy RRHH
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden bg-primary shadow flex justify-around p-2 sticky top-16 z-10 border-b-2 border-secondary/50">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center p-2 rounded text-xs font-medium transition-colors
                ${isActive ? "text-secondary font-bold" : "text-white/80"}
              `}
            >
              <Icon className="w-5 h-5 mb-1" />
              {link.name}
            </Link>
          );
        })}
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
};