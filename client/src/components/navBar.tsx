import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // --- Styling for active and inactive links ---
  const activeClass =
    "text-white bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 rounded-lg shadow transition-all duration-200";
  const inactiveClass =
    "text-gray-700 hover:text-gray-500  font-bold hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-200";

  return (
    <nav className="bg-gradient-to-br from-indigo-100 via-purple-100  to-blue-200 ">
      <div className="  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className=" flex justify-between h-16 items-center">
          {/* --- LEFT SECTION --- */}
          <div className="flex items-center space-x-20 ">
            <Link
              to="/"
              className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 tracking-tight"
            >
              SlotSwapper
            </Link>

            {/* --- Desktop NavLinks --- */}
            <div className="hidden md:flex space-x-20 text-gray-900">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive ? activeClass : inactiveClass
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/marketplace"
                className={({ isActive }) =>
                  isActive ? activeClass : inactiveClass
                }
              >
                Marketplace
              </NavLink>
              <NavLink
                to="/requests"
                className={({ isActive }) =>
                  isActive ? activeClass : inactiveClass
                }
              >
                My Requests
              </NavLink>
            </div>
          </div>

          {/* --- RIGHT SECTION --- */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <span className="text-gray-700 text-sm font-medium">
                Hi,{" "}
                <span className="text-gray-700 font-semibold">{user.name}</span>
              </span>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-medium rounded-lg shadow hover:shadow-md transition-all duration-200"
            >
              Logout
            </button>
          </div>

          {/* --- MOBILE MENU BUTTON --- */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-200  hover:text-white transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile Menu Drawer --- */}
      {isOpen && (
        <div className="md:hidden bg-gray-900/80 backdrop-blur-xl border-t border-white/10 px-4 py-4 space-y-3">
          <NavLink
            to="/"
            end
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/marketplace"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
          >
            Marketplace
          </NavLink>
          <NavLink
            to="/requests"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
          >
            My Requests
          </NavLink>

          <div className="border-t border-white/10 pt-3">
            {user && (
              <p className="text-gray-300 mb-3">
                Hi,{" "}
                <span className="text-white font-semibold">{user.name}</span>
              </p>
            )}
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium rounded-md shadow hover:shadow-md transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
