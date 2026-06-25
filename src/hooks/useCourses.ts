import { useState } from 'react';
import type { Course } from '../index';
import { Level, CourseType } from '../index';
import { INITIAL_COURSES } from '../mockData';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);

  const addCourse = (name: string, level: Level, type: CourseType, durationType: 'Semestral' | 'Anual', coordinatorId?: string) => {
    setCourses(prev => [...prev, { id: Date.now().toString(), name, campus: 'Tauá', level, type, durationType, coordinatorId }]);
  };

  const updateCourse = (course: Course) => {
    setCourses(prev => prev.map(c => c.id === course.id ? course : c));
  };

  return { courses, setCourses, addCourse, updateCourse };
};
