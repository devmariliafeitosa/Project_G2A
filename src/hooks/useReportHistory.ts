import { useState } from 'react';
import type { ReportHistory } from '../index';

export const useReportHistory = () => {
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);

  const addReportToHistory = async (reportName: string) => {
    try {
      const res = await fetch("/api/reports/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ name: reportName }),
      });
      const data = await res.json();
      if (res.ok) {
        setReportHistory(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error("Failed to add report history", err);
    }
  };

  return { reportHistory, setReportHistory, addReportToHistory };
};
