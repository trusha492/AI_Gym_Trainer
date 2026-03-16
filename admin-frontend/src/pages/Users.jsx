<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { deleteUser, getUsers, updateUser } from "../api/admin.api";

const getCurrentAdminEmail = () => {
  const token = localStorage.getItem("adminAccessToken");
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return String(payload?.sub || "").toLowerCase();
  } catch {
    return "";
  }
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", is_admin: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const currentAdminEmail = useMemo(() => getCurrentAdminEmail(), []);

  const fetchUsers = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError(err?.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setNotice({ type: "", text: "" });
    setEditingUser(user.id);
    setEditData({
      name: user.name || "",
      email: user.email || "",
      is_admin: Boolean(user.is_admin),
    });
  };

  const handleSave = async () => {
    try {
      await updateUser(editingUser, editData);
      setEditingUser(null);
      setNotice({ type: "success", text: "User updated successfully." });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user", err);
      setNotice({
        type: "error",
        text: err?.response?.data?.detail || "Failed to update user.",
      });
    }
  };

  const handleDelete = async (user) => {
    const isSelf = user.email?.toLowerCase() === currentAdminEmail;
    if (isSelf) {
      setNotice({ type: "error", text: "You cannot delete your own admin account." });
      return;
    }
    if (!window.confirm(`Delete user ${user.email}?`)) return;
    try {
      await deleteUser(user.id);
      setNotice({ type: "success", text: "User deleted successfully." });
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
      setNotice({
        type: "error",
        text: err?.response?.data?.detail || "Failed to delete user.",
      });
    }
  };

  const admins = users.filter((u) => Boolean(u.is_admin));
  const frontendUsers = users.filter((u) => !u.is_admin);

  const renderList = (list, title) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
      {list.length === 0 && <p className="text-sm text-gray-500">No users in this section.</p>}
      {list.map((u) => {
        const isSelf = u.email?.toLowerCase() === currentAdminEmail;
        return (
          <div
            key={u.id}
            className="flex items-center justify-between bg-gray-50 rounded-xl p-4 shadow-sm"
          >
            {editingUser === u.id ? (
              <div className="flex-1 space-y-2">
                <input
                  className="border p-2 w-full rounded"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Name"
                />
                <input
                  className="border p-2 w-full rounded"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  placeholder="Email"
                />
                <label className="text-xs text-gray-600 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.is_admin}
                    onChange={(e) => setEditData({ ...editData, is_admin: e.target.checked })}
                    disabled={isSelf}
                  />
                  Admin
                </label>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="text-sm bg-green-600 text-white px-3 py-1 rounded">
                    Save
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="text-sm bg-gray-600 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-500">
                    {u.email} {u.is_admin ? "- admin" : "- frontend user"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(u)} className="text-sm text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    className={`text-sm hover:underline ${isSelf ? "text-gray-400 cursor-not-allowed" : "text-red-600"}`}
                    disabled={isSelf}
                    title={isSelf ? "Cannot delete your own admin account" : "Delete user"}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">Users</h2>

      {notice.text && (
        <p className={`mb-3 text-sm ${notice.type === "error" ? "text-red-600" : "text-green-700"}`}>
          {notice.text}
        </p>
      )}

      <div className="space-y-6">
        {loading && <p className="text-sm text-gray-500">Loading users...</p>}
        {!loading && error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && users.length === 0 && <p className="text-sm text-gray-500">No users found.</p>}
        {!loading && !error && users.length > 0 && (
          <>
            {renderList(admins, "Admins")}
            {renderList(frontendUsers, "Frontend Users")}
          </>
        )}
      </div>
    </div>
  );
}
=======
import { useEffect, useMemo, useState } from "react";
import { deleteUser, getUsers, updateUser } from "../api/admin.api";

const getCurrentAdminEmail = () => {
  const token = localStorage.getItem("adminAccessToken");
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return String(payload?.sub || "").toLowerCase();
  } catch {
    return "";
  }
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", is_admin: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const currentAdminEmail = useMemo(() => getCurrentAdminEmail(), []);

  const fetchUsers = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError(err?.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setNotice({ type: "", text: "" });
    setEditingUser(user.id);
    setEditData({
      name: user.name || "",
      email: user.email || "",
      is_admin: Boolean(user.is_admin),
    });
  };

  const handleSave = async () => {
    try {
      await updateUser(editingUser, editData);
      setEditingUser(null);
      setNotice({ type: "success", text: "User updated successfully." });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user", err);
      setNotice({
        type: "error",
        text: err?.response?.data?.detail || "Failed to update user.",
      });
    }
  };

  const handleDelete = async (user) => {
    const isSelf = user.email?.toLowerCase() === currentAdminEmail;
    if (isSelf) {
      setNotice({ type: "error", text: "You cannot delete your own admin account." });
      return;
    }
    if (!window.confirm(`Delete user ${user.email}?`)) return;
    try {
      await deleteUser(user.id);
      setNotice({ type: "success", text: "User deleted successfully." });
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
      setNotice({
        type: "error",
        text: err?.response?.data?.detail || "Failed to delete user.",
      });
    }
  };

  const admins = users.filter((u) => Boolean(u.is_admin));
  const frontendUsers = users.filter((u) => !u.is_admin);

  const renderList = (list, title) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
      {list.length === 0 && <p className="text-sm text-gray-500">No users in this section.</p>}
      {list.map((u) => {
        const isSelf = u.email?.toLowerCase() === currentAdminEmail;
        return (
          <div
            key={u.id}
            className="flex items-center justify-between bg-gray-50 rounded-xl p-4 shadow-sm"
          >
            {editingUser === u.id ? (
              <div className="flex-1 space-y-2">
                <input
                  className="border p-2 w-full rounded"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Name"
                />
                <input
                  className="border p-2 w-full rounded"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  placeholder="Email"
                />
                <label className="text-xs text-gray-600 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.is_admin}
                    onChange={(e) => setEditData({ ...editData, is_admin: e.target.checked })}
                    disabled={isSelf}
                  />
                  Admin
                </label>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="text-sm bg-green-600 text-white px-3 py-1 rounded">
                    Save
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="text-sm bg-gray-600 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-500">
                    {u.email} {u.is_admin ? "- admin" : "- frontend user"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(u)} className="text-sm text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    className={`text-sm hover:underline ${isSelf ? "text-gray-400 cursor-not-allowed" : "text-red-600"}`}
                    disabled={isSelf}
                    title={isSelf ? "Cannot delete your own admin account" : "Delete user"}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">Users</h2>

      {notice.text && (
        <p className={`mb-3 text-sm ${notice.type === "error" ? "text-red-600" : "text-green-700"}`}>
          {notice.text}
        </p>
      )}

      <div className="space-y-6">
        {loading && <p className="text-sm text-gray-500">Loading users...</p>}
        {!loading && error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && users.length === 0 && <p className="text-sm text-gray-500">No users found.</p>}
        {!loading && !error && users.length > 0 && (
          <>
            {renderList(admins, "Admins")}
            {renderList(frontendUsers, "Frontend Users")}
          </>
        )}
      </div>
    </div>
  );
}
>>>>>>> e5dfb0c (Removed venv and updated gitignore)
