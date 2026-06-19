import { useState } from "react";
import api from "../services/api";

export default function SegmentForm({ refresh }) {
  const [segmentId, setSegmentId] = useState("");
  const [month, setMonth] = useState("");

  const [works, setWorks] = useState([]);

  const workOptions = [
    {
      label: "Sand Blasting",
      value: "sandBlasting",
    },
    {
      label: "Grinding",
      value: "grinding",
    },
    {
      label: "Loading",
      value: "loading",
    },
    {
      label: "Steel Bending",
      value: "steelBending",
    },
  ];

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
        alert("Select Month");
        return;
      }

      if (works.length === 0) {
        alert("Select At Least One Work");
        return;
      }

      const payload = {
        segmentId: segmentId.trim(),
        month,
        works,
      };

      console.log(payload);

      await api.post("/segments", payload);

      alert("Saved Successfully");

      setSegmentId("");
      setMonth("");
      setWorks([]);

      refresh();
    } catch (err) {
      console.error(err);
      console.log("ERROR:", err);
console.log("RESPONSE:", err?.response);
console.log("DATA:", err?.response?.data);
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
          placeholder="Segment ID"
          value={segmentId}
          onChange={(e) =>
            setSegmentId(e.target.value)
          }
        />

        <input
          type="month"
          value={month}
          onChange={(e) =>
            setMonth(e.target.value)
          }
        />
      </div>

      <div className="checkbox-grid">
        {workOptions.map((item) => (
          <label key={item.value}>
            <input
              type="checkbox"
              checked={works.includes(
                item.value
              )}
              onChange={() =>
                toggleWork(item.value)
              }
            />
            {item.label}
          </label>
        ))}
      </div>

      <button onClick={saveData}>
        Save
      </button>
    </div>
  );
}