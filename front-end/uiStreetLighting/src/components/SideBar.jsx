import { MoreVertical, ChevronLast, ChevronFirst } from "lucide-react";
import { useContext, createContext, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Corrected import for jwt-decode

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser(decodedToken); // Assuming token has user data like name, email
      } catch (error) {
        console.error("Invalid JWT token", error);
      }
    }
  }, []);

  return (
    <aside
      className={`h-screen ${expanded ? "max-w-[300px] w-full" : "w-fit"}`}
    >
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div
          className={`flex items-center ${
            expanded ? "p-4 justify-between" : "p-4 mt-5 justify-center"
          }`}
        >
          <img
            src="https://img.freepik.com/premium-vector/street-light-logo-lightning-lantern-vector-template-icon-retro-classic-vintage-design_638875-4801.jpg"
            className={`overflow-hidden transition-all ${
              expanded ? "w-32" : "w-0"
            }`}
            alt=""
          />
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-300 flex items-center justify-center"
          >
            {expanded ? <ChevronFirst size={30} /> : <ChevronLast size={30} />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        {/* User info section */}
        {user ? (
          <div className="border-t flex items-center justify-center p-3">
            <img
              src="https://www.svgrepo.com/show/81103/avatar.svg"
              alt=""
              className="w-10 h-10 rounded-md"
            />
            <div
              className={`
                flex justify-between items-center
                overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
            `}
            >
              <div className="leading-4">
                <h4 className="font-semibold">{user.name}</h4>
                <span className="text-xs text-gray-600">{user.email}</span>
              </div>
              <MoreVertical size={20} />
            </div>
          </div>
        ) : (
          <div className="border-t flex items-center justify-center p-3">
            <NavLink
              to="/signUp"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Sign Up
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
}

export function SidebarItem({ icon, text, alert, to }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <li
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
      `}
    >
      <NavLink
        to={to}
        className={({ isActive }) =>
          isActive
            ? "p-3 rounded-lg bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800 w-full"
            : "p-3 rounded-lg hover:bg-indigo-50 text-gray-600 w-full"
        }
      >
        <span className="flex items-center w-full">
          {icon && <span className="text-xl">{icon}</span>}
          <span
            className={`
            overflow-hidden transition-all 
            ${expanded ? "w-auto ml-3 opacity-100" : "w-0 opacity-0"}
            ${!expanded ? "max-w-0" : "max-w-full"}
          `}
          >
            {text}
          </span>
        </span>
      </NavLink>

      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {!expanded && (
        <div
          className={`
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-indigo-100 text-indigo-800 text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
          `}
        >
          {text}
        </div>
      )}
    </li>
  );
}
