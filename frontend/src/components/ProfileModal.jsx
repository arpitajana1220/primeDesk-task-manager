import { X, User, Mail, LogOut } from "lucide-react";
import { useEffect, useState, useContext } from "react";

import api from "../api/axios";
import { AuthContext } from "../auth/AuthContext";

export default function ProfileModal({ isOpen, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const { logout } = useContext(AuthContext);

  /* Load profile */
  const loadProfile = async () => {
    try {
      setLoading(true);

      const res = await api.get("users/profile/");
      setProfile(res.data);

    } catch (err) {
      console.error(err);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">

          <h2 className="text-xl font-semibold">
            Profile
          </h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {loading ? (
            <p className="text-center text-gray-500">
              Loading...
            </p>
          ) : profile ? (
            <>
              <div className="flex items-center gap-3">
                <User className="text-gray-400" />
                <span className="font-medium">
                  {profile.username}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" />
                <span>
                  {profile.email}
                </span>
              </div>
            </>
          ) : null}

        </div>

        {/* Footer */}
        <div className="p-4 border-t">

          <button
            onClick={() => {
              logout();
              onClose();
              window.location.href = "/";
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </div>
    </div>
  );
}
