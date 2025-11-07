import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// --- 1. Define the data types ---
interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

// --- 2. Create the Context ---
// The '!' tells TypeScript we know this will be provided,
// even though the default is undefined.
const AuthContext = createContext<AuthContextType>(null!);

// --- 3. Create a helper hook (optional but good practice) ---
export const useAuth = () => {
  return useContext(AuthContext);
};

// --- 4. Create the Provider Component ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // --- 5. Check localStorage on initial app load ---
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- 6. Define Login/Logout Functions ---
  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // --- 7. Define the value to be passed to consumers ---
  const value = {
    user,
    token,
    isAuthenticated: !!token, // True if token is not null
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
