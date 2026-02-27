// User types
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

// Student types
export interface Student {
  id: number;
  student_code: string;
  fullname: string;
  email: string;
  phone: string;
  major: string;
  year: number;
  gender: string;
  status: 'active' | 'inactive';
  created_at: string;
}

// Teacher types
export interface Teacher {
  id: number;
  teacher_code: string;
  fullname: string;
  email: string;
  phone: string;
  department: string;
  status: 'active' | 'inactive';
  created_at: string;
}

// Course types
export interface Course {
  id: number;
  course_code: string;
  course_name: string;
  credit: number;
  teacher_id: number;
  teacher_name?: string;
  semester: string;
  academic_year: number;
  status: 'active' | 'inactive';
}

// Enrollment types
export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  semester: string;
  academic_year: number;
  enrolled_at: string;
  // Joined data
  student_name?: string;
  student_code?: string;
  course_name?: string;
  course_code?: string;
}

// Attendance types
export type AttendanceStatus = 'present' | 'late' | 'sick' | 'absent';

export interface Attendance {
  id: number;
  enrollment_id: number;
  check_date: string;
  check_time: string;
  status: AttendanceStatus;
  // Joined data
  student_name?: string;
  student_code?: string;
  course_name?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  role: UserRole;
}

export interface StudentForm {
  student_code: string;
  fullname: string;
  email: string;
  phone: string;
  major: string;
  year: number;
  gender: string;
}

export interface TeacherForm {
  teacher_code: string;
  fullname: string;
  email: string;
  phone: string;
  department: string;
}

export interface CourseForm {
  course_code: string;
  course_name: string;
  credit: number;
  teacher_id: number;
  semester: string;
  academic_year: number;
}

export interface EnrollmentForm {
  student_id: number;
  course_id: number;
  semester: string;
  academic_year: number;
}

// Dashboard stats
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalEnrollments: number;
  attendanceToday: number;
  presentRate: number;
}
