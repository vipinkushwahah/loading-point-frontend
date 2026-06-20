import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import api from "../services/api";
import SegmentForm from "../components/SegmentForm";
import SegmentTable from "../components/SegmentTable";
import ExportButtons from "../components/ExportButtons";

export default function Dashboard() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await api.get("/segments");
      setSegments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <SegmentForm refresh={fetchData} />

      {loading ? (
        <>
          {/* Export buttons skeleton */}
          <div style={{ margin: "16px 0" }}>
            <Skeleton height={40} width={150} />
          </div>

          {/* Table skeleton */}
          <div style={{ marginTop: "16px" }}>
            <Skeleton height={50} />
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} style={{ marginTop: "8px" }}>
                <Skeleton height={45} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <ExportButtons data={segments} />
          <SegmentTable data={segments} />
        </>
      )}
    </div>
  );
}