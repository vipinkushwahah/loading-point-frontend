import { useState, useEffect } from "react";
import api from "../services/api";

export default function SegmentForm({ refresh }) {
  const [segmentId, setSegmentId] = useState("");
  const [month, setMonth] = useState("");
  const [works, setWorks] = useState([]);

  const workOptions = [
    { label: "Sand Blasting", value: "sandBlasting" },
    { label: "Grinding", value: "grinding" },
    { label: "Loading", value: "loading" },
    { label: "Steel Bending", value: "steelBending" },
  ];

  const normalizeSegmentId = (id) => {
    return id.replace(/\s+/g, "").toUpperCase();
  };

  // 🧠 auto-fill today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMonth(today);
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const toggleWork = (value) => {
    setWorks((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const saveData = async () => {
    try {
      if (!segmentId.trim()) {
        alert("Enter Segment ID");
        return;
      }

      if (!month) {
        alert("Select Date");
        return;
      }

      if (works.length === 0) {
        alert("Select At Least One Work");
        return;
      }

      const payload = {
        segmentId: normalizeSegmentId(segmentId),
        displaySegmentId: segmentId.trim(),
        month, // single date only
        works,
      };

      console.log("Payload:", payload);

      await api.post("/segments", payload);

      alert("Saved Successfully");

      setSegmentId("");
      setWorks([]);

      // reset to today
      setMonth(today);

      refresh();
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          JSON.stringify(err?.response?.data) ||
          err.message ||
          "Save Failed"
      );
    }
  };

  return (
    <div className="form-card">
      <div className="row">
        <input
          type="text"
          placeholder="Segment ID (e.g. S10 P (9-10) RHS)"
          value={segmentId}
          onChange={(e) => setSegmentId(e.target.value)}
        />

        {/* 📅 SINGLE DATE */}
        <input
          type="date"
          value={month}
          max={today}   // 🎯 restrict future dates
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {segmentId && (
        <div style={{ fontSize: "12px", color: "#555" }}>
          Normalized ID: <b>{normalizeSegmentId(segmentId)}</b>
        </div>
      )}

      <div className="checkbox-grid">
        {workOptions.map((item) => (
          <label key={item.value}>
            <input
              type="checkbox"
              checked={works.includes(item.value)}
              onChange={() => toggleWork(item.value)}
            />
            {item.label}
          </label>
        ))}
      </div>

      <button onClick={saveData}>Save</button>
    </div>
  );
}