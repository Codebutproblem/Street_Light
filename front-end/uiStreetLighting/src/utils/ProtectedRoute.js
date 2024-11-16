import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute({ children }) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    // If no token, redirect to the login or signup page
    return <Navigate to="/signUp" />;
  }

  // If token exists, render the children (protected content)
  return children ? children : <Outlet />;
}
