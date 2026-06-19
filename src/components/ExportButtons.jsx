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

    return "✘ Pending";
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

    // Border
    doc.rect(5, 5, 287, 200);

    // Company Name
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(
      "RUD INFRA BUILDERS PVT LTD",
      148,
      18,
      { align: "center" }
    );

    // Location
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Ayodhya, Uttar Pradesh",
      148,
      26,
      { align: "center" }
    );

    // Divider
    doc.line(10, 32, 287, 32);

    // Report Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");

    doc.text(
      "MONTHLY SEGMENT WORK COMPLETION REPORT",
      148,
      42,
      { align: "center" }
    );

    doc.setFontSize(11);

    doc.text(
      `Report Month : ${formatMonth(month)}`,
      14,
      54
    );

    doc.text(
      `Generated On : ${new Date().toLocaleDateString(
        "en-IN"
      )}`,
      220,
      54
    );

    autoTable(doc, {
      startY: 62,

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
          cellWidth: 35,
          halign: "left",
        },
        1: {
          cellWidth: 55,
        },
        2: {
          cellWidth: 55,
        },
        3: {
          cellWidth: 55,
        },
        4: {
          cellWidth: 55,
        },
      },
    });

    const pageHeight =
      doc.internal.pageSize.height;

    doc.setFontSize(10);

    doc.text(
      "RUD Infra Builders Pvt Ltd | Internal Progress Report",
      14,
      pageHeight - 10
    );

    doc.text(
      "Page 1",
      270,
      pageHeight - 10
    );

    doc.save(
      `RUD_INFRA_REPORT_${month}.pdf`
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