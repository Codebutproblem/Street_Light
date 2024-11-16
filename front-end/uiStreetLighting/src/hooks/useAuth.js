import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          // Token has expired, clear the token
          localStorage.removeItem("authToken");
        } else {
          setUser(decodedToken);
        }
      } catch (error) {
        console.error("Invalid or expired JWT token", error);
        localStorage.removeItem("authToken");
      }
    }
  }, []);

  return { user };
}
