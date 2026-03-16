import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api/user.api";

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [form, setForm] = useState({
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    goal: "",
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getProfile();
      setProfileData(data);
      const p = data?.profile || {};
      setForm({
        age: p.age ?? "",
        gender: p.gender ?? "",
        height_cm: p.height_cm ?? "",
        weight_kg: p.weight_kg ?? "",
        goal: p.goal ?? "",
      });
    })();
  }, []);

  if (!profileData) return <p>Loading...</p>;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      await updateProfile({
        age: form.age === "" ? null : Number(form.age),
        gender: form.gender || null,
        height_cm: form.height_cm === "" ? null : Number(form.height_cm),
        weight_kg: form.weight_kg === "" ? null : Number(form.weight_kg),
        goal: form.goal || null,
      });
      setNotice("Profile saved.");
    } catch {
      setNotice("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Profile</h2>
      <p className="text-sm text-gray-600 mb-4">
        Name: {profileData.name} | Email: {profileData.email}
      </p>

      <form onSubmit={onSave} className="max-w-xl space-y-3 bg-white rounded-xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">
            Age
            <input
              name="age"
              type="number"
              className="mt-1 w-full border rounded px-2 py-1"
              value={form.age}
              onChange={onChange}
            />
          </label>

          <label className="text-sm">
            Gender
            <input
              name="gender"
              type="text"
              className="mt-1 w-full border rounded px-2 py-1"
              value={form.gender}
              onChange={onChange}
            />
          </label>

          <label className="text-sm">
            Height (cm)
            <input
              name="height_cm"
              type="number"
              step="0.1"
              className="mt-1 w-full border rounded px-2 py-1"
              value={form.height_cm}
              onChange={onChange}
            />
          </label>

          <label className="text-sm">
            Weight (kg)
            <input
              name="weight_kg"
              type="number"
              step="0.1"
              className="mt-1 w-full border rounded px-2 py-1"
              value={form.weight_kg}
              onChange={onChange}
            />
          </label>
        </div>

        <label className="text-sm block">
          Goal
          <input
            name="goal"
            type="text"
            className="mt-1 w-full border rounded px-2 py-1"
            value={form.goal}
            onChange={onChange}
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {notice && <span className="text-sm text-gray-600">{notice}</span>}
        </div>
      </form>
    </div>
  );
}
