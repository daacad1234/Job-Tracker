import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("almunim_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("almunim_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("almunim_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
