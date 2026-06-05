import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("access_token") || ""
  );

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("access_token", newToken);
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}