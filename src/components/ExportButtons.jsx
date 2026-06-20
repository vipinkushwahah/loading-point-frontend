import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/dashboard.scss";

export default function ExportButtons({ data }) {
  const formatMonth = (month) => {
    if (!month) return "";

    const parts = month.split("-");
    const year = Number(parts[0]);
    const mon = Number(parts[1]);

    return new Date(year, mon - 1).toLocaleString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );
  };

  const getMonthKey = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.slice(0, 7);
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const getMonths = () => {
    const months = new Set();

    data.forEach((segment) => {
      Object.values(segment.works || {}).forEach(
        (work) => {
          if (work?.month) {
            months.add(getMonthKey(work.month));
          }
        }
      );
    });

    return [...months].sort().reverse();
  };

  const getWorkStatus = (work, month) => {
    if (
      work?.completed &&
      getMonthKey(work.month) === month
    ) {
      return `done (${formatDate(
        work.month
      )})`;
    }

    return " Pending";
  };

  const exportExcel = (month) => {
    const filtered = data.filter((segment) =>
      Object.values(segment.works || {}).some(
        (work) =>
          getMonthKey(work?.month) === month
      )
    );

    const excelData = filtered.map((item) => ({
      SegmentID: item.segmentId,

      SandBlasting: getWorkStatus(
        item.works?.sandBlasting,
        month
      ),

      Grinding: getWorkStatus(
        item.works?.grinding,
        month
      ),

      Loading: getWorkStatus(
        item.works?.loading,
        month
      ),

      SteelBending: getWorkStatus(
        item.works?.steelBending,
        month
      ),
    }));

    const ws =
      XLSX.utils.json_to_sheet(excelData);

    const wb =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      month
    );

    XLSX.writeFile(
      wb,
      `RUD_INFRA_REPORT_${month}.xlsx`
    );
  };

  const exportPDF = (month) => {
    const filtered = data.filter((segment) =>
      Object.values(segment.works || {}).some(
        (work) =>
          getMonthKey(work?.month) === month
      )
    );
  
    const doc = new jsPDF("landscape");
  
    const pageWidth =
      doc.internal.pageSize.width;
  
    const pageHeight =
      doc.internal.pageSize.height;
  
    // ================= BORDER =================
  
    doc.setDrawColor(0);
    doc.rect(
      5,
      5,
      pageWidth - 10,
      pageHeight - 10
    );
  
    // ================= HEADER =================
  
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
  
    // ================= REPORT TITLE =================
  
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
  
    doc.text(
      "SEGMENT WORK PROGRESS REPORT",
      pageWidth / 2,
      42,
      { align: "center" }
    );
  
    // ================= INFO =================
  
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
  
    doc.text(
      `Report Month : ${formatMonth(month)}`,
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
  
    doc.text(
      `Total Segments : ${filtered.length}`,
      14,
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
        ],
      ],
  
      body: filtered.map((item) => [
        item.segmentId,
  
        getWorkStatus(
          item.works?.sandBlasting,
          month
        ),
  
        getWorkStatus(
          item.works?.grinding,
          month
        ),
  
        getWorkStatus(
          item.works?.loading,
          month
        ),
  
        getWorkStatus(
          item.works?.steelBending,
          month
        ),
      ]),
  
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: "center",
        valign: "middle",
        overflow: "linebreak",
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
          cellWidth: 45,
          halign: "left",
        },
      },
  
      didDrawPage: () => {
        doc.setFontSize(9);
  
        doc.text(
          "RUD Infra Builders Pvt Ltd | Internal Progress Report",
          14,
          pageHeight - 10
        );
  
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber}`,
          pageWidth - 25,
          pageHeight - 10
        );
      },
    });
  
    // ================= SIGNATURES =================
  
    const finalY =
      doc.lastAutoTable.finalY + 20;
  
    doc.setFontSize(10);
  
    // Site Engineer
    doc.line(
      30,
      finalY,
      90,
      finalY
    );
  
    doc.text(
      "Site Engineer",
      60,
      finalY + 8,
      {
        align: "center",
      }
    );
  
    // Checked By
    doc.line(
      120,
      finalY,
      180,
      finalY
    );
  
    doc.text(
      "Checked By",
      150,
      finalY + 8,
      {
        align: "center",
      }
    );
  
    // Approved By
    doc.line(
      210,
      finalY,
      270,
      finalY
    );
  
    doc.text(
      "Approved By",
      240,
      finalY + 8,
      {
        align: "center",
      }
    );
  
    // ================= SAVE =================
  
    doc.save(
      `RUD_SEGMENT_PROGRESS_REPORT_${month}.pdf`
    );
  };

  const months = getMonths();

  if (!months.length) return null;

  return (
    <div className="export-section">
      <h2>
        Download Monthly Reports
      </h2>

      {months.map((month) => (
        <div
          className="download-row"
          key={month}
        >
          <span>
            {formatMonth(month)}
          </span>

          <div>
            <button
              onClick={() =>
                exportExcel(month)
              }
            >
              Excel
            </button>

            <button
              onClick={() =>
                exportPDF(month)
              }
            >
              PDF
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}