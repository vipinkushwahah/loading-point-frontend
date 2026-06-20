import { useState, useEffect } from "react";
import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SegmentTable({ data, }) {
  const [tableData, setTableData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTableData(data);
  }, [data]);

  const getStatus = (work) =>
    work?.completed
      ? `✔ (${work.month})`
      : "✘ Pending";

  const getProgress = (item) => {
    const completed = [
      item.works?.sandBlasting?.completed,
      item.works?.grinding?.completed,
      item.works?.loading?.completed,
      item.works?.steelBending?.completed,
    ].filter(Boolean).length;

    return (completed / 4) * 100;
  };

  // ================= SEARCH =================

  const filteredData = tableData.filter(
    (item) => {
      const searchText = search
        .toLowerCase()
        .replace(/[\s()-]/g, "");

      const segmentText = item.segmentId
        ?.toLowerCase()
        .replace(/[\s()-]/g, "");

      return segmentText.includes(
        searchText
      );
    }
  );

  // ================= PDF =================

  const downloadSearchPDF = () => {
    const doc = new jsPDF("landscape");
  
    const pageWidth =
      doc.internal.pageSize.width;
  
    const pageHeight =
      doc.internal.pageSize.height;
  
    // ================= HEADER =================
  
    doc.setDrawColor(0);
    doc.rect(
      5,
      5,
      pageWidth - 10,
      pageHeight - 10
    );
  
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
  
    doc.text(
      "RUD INFRA BUILDERS PVT LTD",
      pageWidth / 2,
      18,
      { align: "center" }
    );
  
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
  
    doc.text(
      "Ayodhya, Uttar Pradesh",
      pageWidth / 2,
      26,
      { align: "center" }
    );
  
    doc.line(
      10,
      32,
      pageWidth - 10,
      32
    );
  
    // ================= TITLE =================
  
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
  
    doc.text(
      "SEGMENT WORK PROGRESS REPORT",
      pageWidth / 2,
      42,
      { align: "center" }
    );
  
    // ================= REPORT INFO =================
  
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
  
    doc.text(
      `Search Filter : ${
        search || "All Segments"
      }`,
      14,
      54
    );
  
    doc.text(
      `Generated On : ${new Date().toLocaleDateString(
        "en-IN"
      )}`,
      210,
      54
    );
  
    doc.text(
      `Generated Time : ${new Date().toLocaleTimeString(
        "en-IN"
      )}`,
      210,
      60
    );
  
    // ================= TABLE =================
  
    autoTable(doc, {
      startY: 68,
  
      head: [
        [
          "Segment ID",
          "Sand Blasting",
          "Grinding",
          "Loading",
          "Steel Bending",
          "Progress",
        ],
      ],
  
      body: filteredData.map((item) => [
        item.segmentId,
  
        item.works?.sandBlasting
          ?.completed
          ? `Done (${item.works.sandBlasting.month})`
          : "Pending",
  
        item.works?.grinding
          ?.completed
          ? `Done (${item.works.grinding.month})`
          : "Pending",
  
        item.works?.loading
          ?.completed
          ? `Done (${item.works.loading.month})`
          : "Pending",
  
        item.works?.steelBending
          ?.completed
          ? `Done (${item.works.steelBending.month})`
          : "Pending",
  
        `${getProgress(item)}%`,
      ]),
  
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: "center",
        valign: "middle",
      },
  
      headStyles: {
        fillColor: [31, 78, 121],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
      },
  
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
  
      columnStyles: {
        0: {
          halign: "left",
        },
      },
    });
  
    // ================= SUMMARY =================
  
    const finalY =
      doc.lastAutoTable.finalY + 15;
  
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
  
    doc.text(
      `Total Segments : ${filteredData.length}`,
      14,
      finalY
    );
  
    // ================= SIGNATURE =================
  
    doc.line(
      pageWidth - 90,
      finalY + 10,
      pageWidth - 20,
      finalY + 10
    );
  
    doc.setFontSize(10);
  
    doc.text(
      "Site Engineer",
      pageWidth - 55,
      finalY + 18,
      {
        align: "center",
      }
    );
  
    // ================= FOOTER =================
  
    doc.setFontSize(9);
  
    doc.text(
      "RUD Infra Builders Pvt Ltd | Internal Progress Report",
      14,
      pageHeight - 10
    );
  
    doc.text(
      `Page 1`,
      pageWidth - 25,
      pageHeight - 10
    );
  
    doc.save(
      `RUD_SEGMENT_PROGRESS_REPORT.pdf`
    );
  };

  // ================= DELETE =================

  const deleteSegment = async (item) => {
    const id = item._id;

    if (
      !window.confirm(
        "Delete this segment?"
      )
    )
      return;

    const prevData = tableData;

    setTableData((prev) =>
      prev.filter((x) => x._id !== id)
    );

    setLoadingId(id);

    try {
      const res = await api.delete(
        `/segments/${id}`
      );

      if (!res?.data?.success) {
        throw new Error();
      }
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Delete failed"
      );

      setTableData(prevData);
    } finally {
      setLoadingId(null);
    }
  };

  // ================= EDIT =================

  const openEdit = (item) => {
    setEditItem(
      JSON.parse(JSON.stringify(item))
    );
  };

  const updateWork = (
    key,
    field,
    value
  ) => {
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

  const saveEdit = async () => {
    const id = editItem._id;

    const prevData = tableData;

    setTableData((prev) =>
      prev.map((item) =>
        item._id === id
          ? editItem
          : item
      )
    );

    setEditItem(null);

    try {
      const res = await api.put(
        `/segments/${id}`,
        {
          segmentId:
            editItem.segmentId,
          works: editItem.works,
        }
      );

      if (!res?.data?.success) {
        throw new Error();
      }
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Update failed"
      );

      setTableData(prevData);
    }
  };

  return (
    <div className="table-wrapper">
      {/* SEARCH + PDF */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
        }}
      >
        <input
          type="text"
          placeholder="Search S10, 66-67, RHS, LHS..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={{
            flex: 1,
            padding: "10px",
          }}
        />

        <button
          onClick={
            downloadSearchPDF
          }
        >
          📄 Download PDF
        </button>
      </div>

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
          {filteredData.map(
            (item) => (
              <tr key={item._id}>
                <td>
                  {item.segmentId}
                </td>

                <td>
                  {getStatus(
                    item.works?.sandBlasting
                  )}
                </td>

                <td>
                  {getStatus(
                    item.works?.grinding
                  )}
                </td>

                <td>
                  {getStatus(
                    item.works?.loading
                  )}
                </td>

                <td>
                  {getStatus(
                    item.works
                      ?.steelBending
                  )}
                </td>

                <td>
                  {getProgress(
                    item
                  )}
                  %
                </td>

                <td>
                  <button
                    onClick={() =>
                      openEdit(item)
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteSegment(
                        item
                      )
                    }
                    disabled={
                      loadingId ===
                      item._id
                    }
                    style={{
                      color: "red",
                      marginLeft:
                        "8px",
                    }}
                  >
                    {loadingId ===
                    item._id
                      ? "Deleting..."
                      : "🗑 Delete"}
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      {/* EDIT MODAL */}

      {editItem && (
        <div className="modal">
          <div className="modal-box">
            <h3>
              Edit Segment
            </h3>

            <input
              value={
                editItem.segmentId
              }
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  segmentId:
                    e.target.value,
                })
              }
              placeholder="Segment ID"
            />

            <hr
              style={{
                margin:
                  "15px 0",
              }}
            />

            {Object.keys(
              editItem.works
            ).map((key) => (
              <div
                key={key}
                style={{
                  marginBottom:
                    "15px",
                }}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={
                      editItem
                        .works[
                        key
                      ]
                        ?.completed ||
                      false
                    }
                    onChange={(
                      e
                    ) =>
                      updateWork(
                        key,
                        "completed",
                        e.target
                          .checked
                      )
                    }
                  />

                  {" "}
                  {key}
                </label>

                {editItem.works[
                  key
                ]?.completed && (
                  <input
                    type="month"
                    value={
                      editItem
                        .works[
                        key
                      ]?.month ||
                      ""
                    }
                    onChange={(
                      e
                    ) =>
                      updateWork(
                        key,
                        "month",
                        e.target
                          .value
                      )
                    }
                    style={{
                      marginLeft:
                        "10px",
                    }}
                  />
                )}
              </div>
            ))}

            <div
              style={{
                marginTop:
                  "20px",
              }}
            >
              <button
                onClick={
                  saveEdit
                }
              >
                Save
              </button>

              <button
                onClick={() =>
                  setEditItem(
                    null
                  )
                }
                style={{
                  marginLeft:
                    "10px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}