import { useState } from 'react';
import { getWorkloadLimit } from '../workload';
import type { User, UserRole } from '../index';
import { INITIAL_TEACHERS } from '../mockData';

export const useTeachers = (currentUserRole?: UserRole) => {
  const [teachers, setTeachers] = useState<User[]>(INITIAL_TEACHERS);

  const addTeacher = async (data: any) => {
    if (currentUserRole !== 'Admin') {
      setTeachers(prev => [...prev, {
        ...data,
        id: Date.now().toString(),
        campus: 'Tauá',
        cargaHoraria: getWorkloadLimit(data.role),
        disciplinasMinistradas: [],
        status: 'Ativo'
      }]);
      return;
    }
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ ...data, campus: 'Tauá' }),
      });
      const newUser = await res.json();
      if (res.ok) {
        setTeachers(prev => [...prev, { ...newUser, disciplinasMinistradas: [], cargaHoraria: getWorkloadLimit(newUser.role) }]);
      } else {
        throw new Error(newUser.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateTeacher = async (data: any) => {
    if (currentUserRole !== 'Admin') {
      setTeachers(prev => prev.map(t => t.id === data.id ? { ...t, ...data } : t));
      return;
    }
    try {
      const res = await fetch(`/api/users/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(data),
      });
      const updatedUser = await res.json();
      if (res.ok) {
        setTeachers(prev => prev.map(t => t.id === data.id ? { ...t, ...updatedUser } : t));
      } else {
        throw new Error(updatedUser.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteTeacher = async (id: string, currentUserRole?: UserRole) => {
    if (currentUserRole !== 'Admin') {
      setTeachers(prev => prev.filter(t => t.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
      });
      if (res.ok) {
        setTeachers(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  return { teachers, setTeachers, addTeacher, updateTeacher, deleteTeacher };
};
