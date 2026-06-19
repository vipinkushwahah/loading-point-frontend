import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/dashboard.scss";

export default function ExportButtons({ data }) {
  const formatMonth = (month) => {
    if (!month) return "";

    const [year, mon] = month.split("-");

    return new Date(
      Number(year),
      Number(mon) - 1
    ).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getMonths = () => {
    const months = new Set();

    data.forEach((segment) => {
      Object.values(segment.works || {}).forEach(
        (work) => {
          if (work?.month) {
            months.add(work.month);
          }
        }
      );
    });

    return [...months].sort().reverse();
  };

  const exportExcel = (month) => {
    const filtered = data.filter((segment) =>
      Object.values(segment.works || {}).some(
        (work) => work.month === month
      )
    );

    const excelData = filtered.map((item) => ({
      SegmentID: item.segmentId,

      SandBlasting:
        item.works?.sandBlasting?.completed
          ? `Completed (${formatMonth(
              item.works.sandBlasting.month
            )})`
          : "Pending",

      Grinding:
        item.works?.grinding?.completed
          ? `Completed (${formatMonth(
              item.works.grinding.month
            )})`
          : "Pending",

      Loading:
        item.works?.loading?.completed
          ? `Completed (${formatMonth(
              item.works.loading.month
            )})`
          : "Pending",

      SteelBending:
        item.works?.steelBending?.completed
          ? `Completed (${formatMonth(
              item.works.steelBending.month
            )})`
          : "Pending",
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(excelData);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      month
    );

    XLSX.writeFile(
      workbook,
      `Segments_${month}.xlsx`
    );
  };

  const exportPDF = (month) => {
    const filtered = data.filter((segment) =>
      Object.values(segment.works || {}).some(
        (work) => work.month === month
      )
    );

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      `Segment Completion Report`,
      14,
      15
    );

    doc.setFontSize(11);

    doc.text(
      `Month: ${formatMonth(month)}`,
      14,
      23
    );

    autoTable(doc, {
      startY: 30,

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

        item.works?.sandBlasting?.completed
          ? `✓ ${formatMonth(
              item.works.sandBlasting.month
            )}`
          : "-",

        item.works?.grinding?.completed
          ? `✓ ${formatMonth(
              item.works.grinding.month
            )}`
          : "-",

        item.works?.loading?.completed
          ? `✓ ${formatMonth(
              item.works.loading.month
            )}`
          : "-",

        item.works?.steelBending?.completed
          ? `✓ ${formatMonth(
              item.works.steelBending.month
            )}`
          : "-",
      ]),
    });

    doc.save(
      `Segment_Report_${month}.pdf`
    );
  };

  const months = getMonths();

  if (months.length === 0) {
    return null;
  }

  return (
    <div className="export-section">
      <h2>Download Reports</h2>

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