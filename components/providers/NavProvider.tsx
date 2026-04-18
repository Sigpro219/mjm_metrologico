"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

interface NavContextType {
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  closeMobile: () => void;
  toggleMobile: () => void;
}

const NavContext = createContext<NavContextType | undefined>(undefined);

export function NavProvider({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on parameter or path change in mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <NavContext.Provider
      value={{
        isMobileOpen,
        setIsMobileOpen,
        closeMobile: () => setIsMobileOpen(false),
        toggleMobile: () => setIsMobileOpen((prev) => !prev),
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const context = useContext(NavContext);
  if (context === undefined) {
    throw new Error("useNav must be used within a NavProvider");
  }
  return context;
}
