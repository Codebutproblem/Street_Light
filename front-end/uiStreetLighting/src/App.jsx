import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  BadgeHelp,
  LogOut,
  Lightbulb,
  LogIn,
} from "lucide-react";
import Sidebar, { SidebarItem } from "./components/SideBar";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Devices from "./pages/Devices";
import "./App.css";

// Utility to check authentication status (e.g., check JWT token)
const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  return token ? true : false; // Check if token exists
};

// Function to handle logout
const handleLogout = () => {
  localStorage.removeItem("authToken"); // Clear the authentication token
  window.location.href = "/signIn"; // Redirect to the SignIn page
};

// ProtectedRoute component to wrap routes that require authentication
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/signIn" />;
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation(); // Get the current location (route)

  // Hide Sidebar for routes '/signIn' and '/signUp'
  const hideSidebar =
    location.pathname === "/signUp" || location.pathname === "/signIn";

  return (
    <div className="flex flex-row">
      {/* Conditionally render the Sidebar */}
      {!hideSidebar && (
        <Sidebar>
          <SidebarItem
            icon={<LayoutDashboard size={30} />}
            text={"Dashboard"}
            to="/dashboard"
          />
          <SidebarItem
            icon={<Lightbulb size={30} />}
            text={"Devices"}
            to="/devices"
          />
          {/* Show "Sign Up" or "Log In" depending on authentication status */}
          {!isAuthenticated() ? (
            <SidebarItem
              icon={<LogIn size={30} />}
              text={"Sign Up"}
              to="/signUp"
            />
          ) : (
            <SidebarItem
              icon={<LogOut size={30} />}
              text={"Logout"}
              onClick={handleLogout} // Call logout function when clicked
              to="/signIn" // We don't need this 'to' as we are manually redirecting in handleLogout
            />
          )}
          <hr className="my-3" />
          <SidebarItem
            icon={<Settings size={30} />}
            text={"Settings"}
            to="/settings"
          />
          <SidebarItem
            icon={<BadgeHelp size={30} />}
            text={"Help"}
            to="/help"
          />
        </Sidebar>
      )}

      {/* Main content area */}
      <div
        className={`flex-1 h-screen overflow-hidden p-14 ${
          hideSidebar
            ? "bg-[#faebd7]" // Lighter background for no sidebar
            : "bg-[hsl(220deg_25%_14.12%)] text-white" // Darker background for sidebar
        } `}
      >
        <Routes>
          {/* Define protected routes that require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices"
            element={
              <ProtectedRoute>
                <Devices />
              </ProtectedRoute>
            }
          />
          {/* Public routes */}
          <Route
            path="/signIn"
            element={
              isAuthenticated() ? <Navigate to="/dashboard" /> : <SignIn />
            }
          />
          <Route
            path="/signUp"
            element={
              isAuthenticated() ? <Navigate to="/dashboard" /> : <SignUp />
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/help" element={<HelpPage />} />

          {/* Default route */}
          <Route path="*" element={<Navigate to="/signUp" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
