import { User, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext ,useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import ProfileModal from "./ProfileModal";
// , useLocation
export default function Navbar() {
  const navigate = useNavigate();
//   const location = useLocation();

  const { logout } = useContext(AuthContext);

  const token = localStorage.getItem("token");
  const [openProfile, setOpenProfile] = useState(false);  

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">

        <div className="flex items-center justify-between">

          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>

            <span className="font-semibold text-xl">
              TaskManager
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">

            {token ? (
              <>
                {/* Profile */}
                <button
                  onClick={() => setOpenProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <User size={20} />
                  <span>Profile</span>
                </button>

                {/* Logout */}
                {/* <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button> */}
              </>
            ) : (
              <>
                {/* Login */}
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <LogIn size={20} />
                  <span>Login</span>
                </button>
              </>
            )}

          </div>
        </div>
      </div>
      <ProfileModal
        isOpen={openProfile}
        onClose={() => setOpenProfile(false)}
      />
    </nav>
  );
}
