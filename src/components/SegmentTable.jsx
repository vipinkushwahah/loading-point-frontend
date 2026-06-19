import { useState, useEffect } from "react";
import api from "../services/api";

export default function SegmentTable({ data }) {
  const [tableData, setTableData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTableData(data);
  }, [data]);

  const getStatus = (work) =>
    work?.completed ? `✔ (${work.month})` : "✘ Pending";

  const getProgress = (item) => {
    const completed = [
      item.works?.sandBlasting?.completed,
      item.works?.grinding?.completed,
      item.works?.loading?.completed,
      item.works?.steelBending?.completed,
    ].filter(Boolean).length;

    return (completed / 4) * 100;
  };

  const deleteSegment = async (item) => {
    const id = item._id;

    const prevData = tableData;
    setTableData((prev) => prev.filter((x) => x._id !== id));

    setLoadingId(id);

    try {
      const res = await api.delete(`/segments/${id}`);
      if (!res?.data?.success) throw new Error();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
      setTableData(prevData);
    } finally {
      setLoadingId(null);
    }
  };

  // ================= OPEN EDIT =================
  const openEdit = (item) => {
    setEditItem(JSON.parse(JSON.stringify(item)));
  };

  // ================= UPDATE WORK =================
  const updateWork = (key, field, value) => {
    setEditItem((prev) => ({
      ...prev,
      works: {
        ...prev.works,
        [key]: {
          ...prev.works[key],
          [field]: value,
        },
      },
    }));
  };

  // ================= SAVE EDIT =================
  const saveEdit = async () => {
    const id = editItem._id;

    const prevData = tableData;

    setTableData((prev) =>
      prev.map((item) =>
        item._id === id ? editItem : item
      )
    );

    setEditItem(null);

    try {
      const res = await api.put(`/segments/${id}`, {
        segmentId: editItem.segmentId,
        works: editItem.works,
      });

      if (!res?.data?.success) throw new Error();
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
      setTableData(prevData);
    }
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Segment ID</th>
            <th>Sand Blasting</th>
            <th>Grinding</th>
            <th>Loading</th>
            <th>Steel Bending</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tableData.map((item) => (
            <tr key={item._id}>
              <td>{item.segmentId}</td>

              <td>{getStatus(item.works?.sandBlasting)}</td>
              <td>{getStatus(item.works?.grinding)}</td>
              <td>{getStatus(item.works?.loading)}</td>
              <td>{getStatus(item.works?.steelBending)}</td>

              <td>{getProgress(item)}%</td>

              <td>
                <button onClick={() => openEdit(item)}>
                  ✏️ Edit
                </button>

                <button
                  onClick={() => deleteSegment(item)}
                  disabled={loadingId === item._id}
                  style={{ color: "red", marginLeft: "8px" }}
                >
                  {loadingId === item._id
                    ? "Deleting..."
                    : "🗑 Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= EDIT MODAL ================= */}
      {editItem && (
        <div className="modal">
          <div className="modal-box">
            <h3>Edit Segment</h3>

            {/* ================= SEGMENT ID EDIT ================= */}
            <input
              value={editItem.segmentId}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  segmentId: e.target.value,
                })
              }
              placeholder="Segment ID"
            />

            <hr style={{ margin: "10px 0" }} />

            {/* ================= WORKS EDIT ================= */}
            {Object.keys(editItem.works).map((key) => (
              <div key={key} style={{ marginBottom: "10px" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={editItem.works[key]?.completed || false}
                    onChange={(e) =>
                      updateWork(key, "completed", e.target.checked)
                    }
                  />
                  {key}
                </label>

                {editItem.works[key]?.completed && (
                  <input
                    type="month"
                    value={editItem.works[key]?.month || ""}
                    onChange={(e) =>
                      updateWork(key, "month", e.target.value)
                    }
                  />
                )}
              </div>
            ))}

            <div style={{ marginTop: "10px" }}>
              <button onClick={saveEdit}>Save</button>
              <button onClick={() => setEditItem(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}