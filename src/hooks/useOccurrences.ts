import { useState } from 'react';
import type { Occurrence } from '../index';

export const useOccurrences = () => {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);

  const createOccurrence = async (occ: Omit<Occurrence, 'id' | 'status'>) => {
    try {
      const res = await fetch("/api/occurrences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(occ),
      });
      const data = await res.json();
      if (res.ok) {
        setOccurrences(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error("Failed to create occurrence", err);
    }
  };

  const updateOccurrence = async (id: string, updates: Partial<Occurrence>) => {
    try {
      const res = await fetch(`/api/occurrences/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) {
        setOccurrences(prev => prev.map(o => o.id === id ? data : o));
      }
    } catch (err) {
      console.error("Failed to update occurrence", err);
    }
  };

  return { occurrences, setOccurrences, createOccurrence, updateOccurrence };
};
