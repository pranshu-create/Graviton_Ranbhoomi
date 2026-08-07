"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { name: "HOME", path: "/" },
  { name: "EVENTS", path: "/events" },
  { name: "LIVE", path: "/live" },
  { name: "GALLERY", path: "/gallery" },
  { name: "RESOURCES", path: "/resources" },
  { name: "SPONSORS", path: "/sponsors" },
  { name: "TEAM", path: "/team" },
  { name: "WAR ROOM", path: "/war-room" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isLockdown, setIsLockdown] = useState(false);

  // Fetch system config for lockdown status
  useEffect(() => {
    fetch("/api/system")
      .then(r => r.json())
      .then(data => {
        if (data.success && data.config) {
          setIsLockdown(data.config.isLockdown);
        }
      })
      .catch(console.error);
  }, []);

  // Check login status on mount and when pathname changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const status = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(status);
    };
    checkLoginStatus();
    
    // Also listen for a custom event we can dispatch on login/logout
    window.addEventListener("auth-change", checkLoginStatus);
    return () => window.removeEventListener("auth-change", checkLoginStatus);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const cutCorners = { clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" };

  return (
    <div className="fixed w-full z-50 flex flex-col">
      <AnimatePresence>
        {isLockdown && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500 text-white w-full text-center py-2 px-4 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" /> 
            <span>Registrations towards Ranbhoomi are closed now. If you still want to continue, contact admin.</span>
          </motion.div>
        )}
      </AnimatePresence>
      <nav className="w-full bg-black/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 md:gap-4">
              <img src="/logo.png" alt="Graviton Robotics Logo" className="h-16 w-auto object-contain" />
              <span className="font-display font-bold text-2xl md:text-3xl text-white tracking-widest hidden sm:block">
                RAN<span className="text-neon-cyan text-glow-cyan">BHOOMI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`px-3 py-2 text-xs uppercase tracking-[0.2em] font-mono transition-all duration-300 hover:text-neon-cyan ${
                      isActive ? "text-neon-cyan text-glow-cyan border-b border-neon-cyan" : "text-gray-400"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CTA & Auth Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  style={cutCorners}
                  className="font-mono text-xs text-neon-cyan border border-neon-cyan px-4 py-2 hover:bg-neon-cyan/10 transition-colors tracking-widest"
                >
                  DASHBOARD
                </Link>
                <button
                  onClick={handleLogout}
                  style={cutCorners}
                  className="font-mono text-xs bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-white transition-all duration-300 tracking-widest"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={cutCorners}
                  className="font-mono text-xs text-neon-cyan border border-neon-cyan px-4 py-2 hover:bg-neon-cyan/10 transition-colors tracking-widest"
                >
                  LOGIN
                </Link>
                <Link
                  href="/register"
                  style={cutCorners}
                  className="font-mono text-xs bg-neon-cyan/20 border border-neon-cyan text-neon-cyan px-4 py-2 hover:bg-neon-cyan hover:text-black transition-all duration-300 tracking-widest"
                >
                  INITIATE
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neon-cyan hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: "auto" }}
             exit={{ opacity: 0, height: 0 }}
             className="md:hidden bg-black/85 backdrop-blur-lg border-b border-t border-neon-cyan/25 absolute w-full left-0 overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(77,184,255,0.08)] z-50"
           >
            <div className="px-4 pt-2 pb-6 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-300 hover:text-neon-cyan block py-2 font-mono text-sm tracking-widest uppercase border-b border-white/5"
                >
                  &gt; {link.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col space-y-4">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      style={cutCorners}
                      className="text-center bg-neon-cyan/10 border border-neon-cyan text-neon-cyan py-3 font-mono text-sm tracking-widest"
                    >
                      DASHBOARD
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      style={cutCorners}
                      className="text-center bg-red-500/10 border border-red-500 text-red-500 py-3 font-mono text-sm tracking-widest"
                    >
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      style={cutCorners}
                      className="bg-transparent border border-neon-cyan text-neon-cyan py-3 font-mono text-center tracking-widest"
                    >
                      LOGIN
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      style={cutCorners}
                      className="bg-neon-cyan/20 border border-neon-cyan text-neon-cyan py-3 font-mono text-center tracking-widest"
                    >
                      INITIATE SEQUENCE
                    </Link>
                  </>
                )}
              </div>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent shadow-[0_0_8px_var(--theme-cyan)]"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </nav>
    </div>
  );
}
