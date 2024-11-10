import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
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

function App() {
  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation(); // Get the current location (route)

  // Check if the current route is either '/signIn' or '/signUp'
  const hideSidebar =
    location.pathname === "/signUp" || location.pathname === "/signIn";

  return (
    <div className="flex flex-row">
      {!hideSidebar && (
        <Sidebar>
          {/* Sidebar Items with Links for navigation */}
          <SidebarItem
            icon={<LayoutDashboard size={30} />}
            text={"Dashboard"}
            to="/dashboard" // Set the route to navigate to
          />
          <SidebarItem
            icon={<Lightbulb size={30} />}
            text={"Devices"}
            to="/devices" // Set the route to navigate to
          />
          <SidebarItem
            icon={<LogIn size={30} />}
            text={"Sign Up"}
            to="/signUp" // Set the route to navigate to
          />
          <SidebarItem
            icon={<LogOut size={30} />}
            text={"Logout"}
            to="/signIn" // Set the route to navigate to
          />
          <hr className="my-3" />
          <SidebarItem
            icon={<Settings size={30} />}
            text={"Settings"}
            to="/settings" // Set the route to navigate to
          />
          <SidebarItem
            icon={<BadgeHelp size={30} />}
            text={"Help"}
            to="/help" // Set the route to navigate to
          />
        </Sidebar>
      )}

      {/* Main content area */}
      <div
        className={`flex-1 h-screen overflow-hidden p-14 ${
          hideSidebar
            ? "bg-[#faebd7]"
            : "bg-[hsl(220deg_25%_14.12%)] text-white"
        } `}
      >
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          {/* Default route */}
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
