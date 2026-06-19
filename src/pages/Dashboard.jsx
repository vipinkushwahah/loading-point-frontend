import { useEffect, useState } from "react";
import api from "../services/api";
import SegmentForm from "../components/SegmentForm";
import SegmentTable from "../components/SegmentTable";
import ExportButtons from "../components/ExportButtons";

export default function Dashboard() {
  const [segments, setSegments] =
    useState([]);

  const fetchData = async () => {
    try {
      const res =
        await api.get("/segments");

      setSegments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <SegmentForm
        refresh={fetchData}
      />

      <ExportButtons
        data={segments}
      />

      <SegmentTable
        data={segments}
      />
    </div>
  );
}