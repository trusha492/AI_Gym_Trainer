import { useEffect, useState } from "react";
import { getInputHistory, upsertInputHistory } from "../api/user.api";

const toInputDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const emptyEntry = () => ({
  log_date: toInputDate(new Date()),
  weight_kg: "",
  calories_consumed: "",
  calories_target: "",
});

export default function NutritionHistory() {
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState(emptyEntry());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getInputHistory(120);
      const normalized = (Array.isArray(data) ? data : []).map((item) => ({
        log_date: toInputDate(item.log_date),
        weight_kg: item.weight_kg ?? "",
        calories_consumed: item.calories_consumed ?? "",
        calories_target: item.calories_target ?? "",
      }));
      setRows(normalized);
    } catch (err) {
      console.error("Failed to load input history", err);
      setError("Unable to load input history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const saveEntry = async (entry, resetDraft = false) => {
    if (!entry.log_date) {
      setError("Date is required.");
      return;
    }
    if (
      entry.weight_kg === "" &&
      entry.calories_consumed === "" &&
      entry.calories_target === ""
    ) {
      setError("Add at least one value (weight or calories).");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      await upsertInputHistory({
        log_date: entry.log_date,
        weight_kg: entry.weight_kg === "" ? null : Number(entry.weight_kg),
        calories_consumed:
          entry.calories_consumed === "" ? null : Number(entry.calories_consumed),
        calories_target:
          entry.calories_target === "" ? null : Number(entry.calories_target),
      });
      setNotice("History updated.");
      if (resetDraft) setDraft(emptyEntry());
      await loadHistory();
    } catch (err) {
      console.error("Failed to save input history", err);
      setError("Failed to save entry.");
    } finally {
      setSaving(false);
    }
  };

  const updateRow = (idx, key, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-5">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Weight & Calories Input History</h1>
            <p className="text-sm text-gray-500">
              Review past entries and add/edit any date.
            </p>
          </div>
          <button
            type="button"
            onClick={loadHistory}
            className="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50"
          >
            Refresh
          </button>
        </header>

        {error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
            {notice}
          </div>
        )}

        <section className="mb-5 border rounded-lg p-3 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Add New Entry</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <input
              type="date"
              value={draft.log_date}
              onChange={(e) => setDraft((p) => ({ ...p, log_date: e.target.value }))}
              className="border rounded px-2 py-1 text-sm bg-white"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Weight (kg)"
              value={draft.weight_kg}
              onChange={(e) => setDraft((p) => ({ ...p, weight_kg: e.target.value }))}
              className="border rounded px-2 py-1 text-sm bg-white"
            />
            <input
              type="number"
              step="1"
              placeholder="Calories consumed"
              value={draft.calories_consumed}
              onChange={(e) => setDraft((p) => ({ ...p, calories_consumed: e.target.value }))}
              className="border rounded px-2 py-1 text-sm bg-white"
            />
            <input
              type="number"
              step="1"
              placeholder="Calories target"
              value={draft.calories_target}
              onChange={(e) => setDraft((p) => ({ ...p, calories_target: e.target.value }))}
              className="border rounded px-2 py-1 text-sm bg-white"
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => saveEntry(draft, true)}
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add / Update"}
            </button>
          </div>
        </section>

        {loading ? (
          <div className="text-sm text-gray-500">Loading history...</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-gray-500">No history yet. Add your first entry above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 pr-2">Weight (kg)</th>
                  <th className="py-2 pr-2">Calories</th>
                  <th className="py-2 pr-2">Calorie Goal</th>
                  <th className="py-2 pr-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={`${row.log_date}-${idx}`} className="border-b">
                    <td className="py-2 pr-2">
                      <input
                        type="date"
                        value={row.log_date}
                        onChange={(e) => updateRow(idx, "log_date", e.target.value)}
                        className="border rounded px-2 py-1 bg-white"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="0.1"
                        value={row.weight_kg}
                        onChange={(e) => updateRow(idx, "weight_kg", e.target.value)}
                        className="border rounded px-2 py-1 bg-white w-28"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="1"
                        value={row.calories_consumed}
                        onChange={(e) => updateRow(idx, "calories_consumed", e.target.value)}
                        className="border rounded px-2 py-1 bg-white w-32"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="1"
                        value={row.calories_target}
                        onChange={(e) => updateRow(idx, "calories_target", e.target.value)}
                        className="border rounded px-2 py-1 bg-white w-32"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => saveEntry(row)}
                        className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
