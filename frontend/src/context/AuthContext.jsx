import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {

    const savedUser = localStorage.getItem("insuresync_user");

    return savedUser ? JSON.parse(savedUser) : null;

  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (user) {

      localStorage.setItem(
        "insuresync_user",
        JSON.stringify(user)
      );

    } else {

      localStorage.removeItem("insuresync_user");

    }

  }, [user]);

  // ================= LOGIN =================

  async function login(email, password) {

    setLoading(true);

    try {

      const { data } = await api.post("/auth/login", {

        email,

        password,

      });

      const sessionUser = {

        id: data.user_id,

        full_name: data.full_name,

        email,

        role: data.role,

      };

      localStorage.setItem(
        "insuresync_token",
        data.access_token
      );

      localStorage.setItem(
        "insuresync_user",
        JSON.stringify(sessionUser)
      );

      setUser(sessionUser);

      return sessionUser;

    } catch (err) {

      throw err;

    } finally {

      setLoading(false);

    }

  }

  // ================= REGISTER =================

  async function register(
    full_name,
    email,
    password,
    role
  ) {

    setLoading(true);

    try {

      // Frontend restriction
      if (role === "admin") {

        throw new Error(
          "Administrator registration is not allowed."
        );

      }

      const { data } = await api.post("/auth/register", {

        full_name,

        email,

        password,

        role,

      });

      const sessionUser = {

        id: data.user_id,

        full_name: data.full_name,

        email,

        role: data.role,

      };

      localStorage.setItem(
        "insuresync_token",
        data.access_token
      );

      localStorage.setItem(
        "insuresync_user",
        JSON.stringify(sessionUser)
      );

      setUser(sessionUser);

      return sessionUser;

    } catch (err) {

      throw err;

    } finally {

      setLoading(false);

    }

  }

  // ================= LOGOUT =================

  function logout() {

    localStorage.removeItem("insuresync_token");

    localStorage.removeItem("insuresync_user");

    setUser(null);

  }

  // ================= ROLE HELPERS =================

  const isAuthenticated = !!user;

  const isAdmin =
    user?.role?.toLowerCase() === "admin";

  const isProvider =
    user?.role?.toLowerCase() === "provider";

  const isCustomer =
    user?.role?.toLowerCase() === "customer";

  // ================= AUTO LOGOUT =================

  useEffect(() => {

    const interceptor = api.interceptors.response.use(

      (response) => response,

      (error) => {

        if (error.response?.status === 401) {

          logout();

        }

        return Promise.reject(error);

      }

    );

    return () => {

      api.interceptors.response.eject(interceptor);

    };

  }, []);

  return (

    <AuthContext.Provider

      value={{

        user,

        loading,

        login,

        register,

        logout,

        isAuthenticated,

        isAdmin,

        isProvider,

        isCustomer,

      }}

    >

      {children}

    </AuthContext.Provider>

  );

}

export function useAuth() {

  return useContext(AuthContext);

}