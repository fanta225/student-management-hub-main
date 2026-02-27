import { Student, Teacher, Course, Enrollment, Attendance } from '@/types';

export const mockStudents: Student[] = [
  {
    id: 1,
    student_code: '65001',
    fullname: 'นายสมชาย ใจดี',
    email: 'somchai@student.school.com',
    phone: '0812345678',
    major: 'เทคโนโลยีสารสนเทศ',
    year: 2,
    gender: 'male',
    status: 'active',
    created_at: '2024-01-15',
  },
  {
    id: 2,
    student_code: '65002',
    fullname: 'นางสาวสมหญิง รักเรียน',
    email: 'somying@student.school.com',
    phone: '0823456789',
    major: 'เทคโนโลยีสารสนเทศ',
    year: 2,
    gender: 'female',
    status: 'active',
    created_at: '2024-01-15',
  },
  {
    id: 3,
    student_code: '65003',
    fullname: 'นายวิชัย เก่งมาก',
    email: 'wichai@student.school.com',
    phone: '0834567890',
    major: 'วิศวกรรมคอมพิวเตอร์',
    year: 3,
    gender: 'male',
    status: 'active',
    created_at: '2024-01-16',
  },
  {
    id: 4,
    student_code: '65004',
    fullname: 'นางสาวนภา สดใส',
    email: 'napa@student.school.com',
    phone: '0845678901',
    major: 'เทคโนโลยีสารสนเทศ',
    year: 1,
    gender: 'female',
    status: 'active',
    created_at: '2024-02-01',
  },
  {
    id: 5,
    student_code: '65005',
    fullname: 'นายปรีชา มั่นคง',
    email: 'preecha@student.school.com',
    phone: '0856789012',
    major: 'วิศวกรรมซอฟต์แวร์',
    year: 2,
    gender: 'male',
    status: 'active',
    created_at: '2024-02-10',
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: 1,
    teacher_code: 'T001',
    fullname: 'อ.ดร.สมศักดิ์ ปราชญ์เปรื่อง',
    email: 'somsak@school.com',
    phone: '0891234567',
    department: 'เทคโนโลยีสารสนเทศ',
    status: 'active',
    created_at: '2020-08-01',
  },
  {
    id: 2,
    teacher_code: 'T002',
    fullname: 'อ.วิชาญ ฉลาดดี',
    email: 'wichan@school.com',
    phone: '0892345678',
    department: 'วิศวกรรมคอมพิวเตอร์',
    status: 'active',
    created_at: '2019-06-15',
  },
  {
    id: 3,
    teacher_code: 'T003',
    fullname: 'อ.นภัสสร สวยงาม',
    email: 'napatsorn@school.com',
    phone: '0893456789',
    department: 'เทคโนโลยีสารสนเทศ',
    status: 'active',
    created_at: '2021-01-10',
  },
];

export const mockCourses: Course[] = [
  {
    id: 1,
    course_code: 'WEB101',
    course_name: 'Web Application Development',
    credit: 3,
    teacher_id: 1,
    teacher_name: 'อ.ดร.สมศักดิ์ ปราชญ์เปรื่อง',
    semester: '1',
    academic_year: 2567,
    status: 'active',
  },
  {
    id: 2,
    course_code: 'DB202',
    course_name: 'Database Systems',
    credit: 3,
    teacher_id: 2,
    teacher_name: 'อ.วิชาญ ฉลาดดี',
    semester: '1',
    academic_year: 2567,
    status: 'active',
  },
  {
    id: 3,
    course_code: 'PROG101',
    course_name: 'Programming Fundamentals',
    credit: 3,
    teacher_id: 1,
    teacher_name: 'อ.ดร.สมศักดิ์ ปราชญ์เปรื่อง',
    semester: '1',
    academic_year: 2567,
    status: 'active',
  },
  {
    id: 4,
    course_code: 'NET301',
    course_name: 'Computer Networks',
    credit: 3,
    teacher_id: 3,
    teacher_name: 'อ.นภัสสร สวยงาม',
    semester: '2',
    academic_year: 2567,
    status: 'active',
  },
];

export const mockEnrollments: Enrollment[] = [
  { id: 1, student_id: 1, course_id: 1, semester: '1', academic_year: 2567, enrolled_at: '2024-06-15', student_name: 'นายสมชาย ใจดี', student_code: '65001', course_name: 'Web Application Development', course_code: 'WEB101' },
  { id: 2, student_id: 1, course_id: 2, semester: '1', academic_year: 2567, enrolled_at: '2024-06-15', student_name: 'นายสมชาย ใจดี', student_code: '65001', course_name: 'Database Systems', course_code: 'DB202' },
  { id: 3, student_id: 2, course_id: 1, semester: '1', academic_year: 2567, enrolled_at: '2024-06-15', student_name: 'นางสาวสมหญิง รักเรียน', student_code: '65002', course_name: 'Web Application Development', course_code: 'WEB101' },
  { id: 4, student_id: 2, course_id: 3, semester: '1', academic_year: 2567, enrolled_at: '2024-06-16', student_name: 'นางสาวสมหญิง รักเรียน', student_code: '65002', course_name: 'Programming Fundamentals', course_code: 'PROG101' },
  { id: 5, student_id: 3, course_id: 2, semester: '1', academic_year: 2567, enrolled_at: '2024-06-16', student_name: 'นายวิชัย เก่งมาก', student_code: '65003', course_name: 'Database Systems', course_code: 'DB202' },
  { id: 6, student_id: 4, course_id: 1, semester: '1', academic_year: 2567, enrolled_at: '2024-06-17', student_name: 'นางสาวนภา สดใส', student_code: '65004', course_name: 'Web Application Development', course_code: 'WEB101' },
  { id: 7, student_id: 5, course_id: 4, semester: '2', academic_year: 2567, enrolled_at: '2024-06-18', student_name: 'นายปรีชา มั่นคง', student_code: '65005', course_name: 'Computer Networks', course_code: 'NET301' },
];

export const mockAttendance: Attendance[] = [
  { id: 1, enrollment_id: 1, check_date: '2025-01-10', check_time: '09:00:00', status: 'present', student_name: 'นายสมชาย ใจดี', student_code: '65001', course_name: 'Web Application Development' },
  { id: 2, enrollment_id: 2, check_date: '2025-01-10', check_time: '13:05:00', status: 'late', student_name: 'นายสมชาย ใจดี', student_code: '65001', course_name: 'Database Systems' },
  { id: 3, enrollment_id: 3, check_date: '2025-01-10', check_time: '08:55:00', status: 'present', student_name: 'นางสาวสมหญิง รักเรียน', student_code: '65002', course_name: 'Web Application Development' },
  { id: 4, enrollment_id: 5, check_date: '2025-01-10', check_time: '00:00:00', status: 'absent', student_name: 'นายวิชัย เก่งมาก', student_code: '65003', course_name: 'Database Systems' },
  { id: 5, enrollment_id: 1, check_date: '2025-01-17', check_time: '09:02:00', status: 'present', student_name: 'นายสมชาย ใจดี', student_code: '65001', course_name: 'Web Application Development' },
  { id: 6, enrollment_id: 3, check_date: '2025-01-17', check_time: '09:00:00', status: 'present', student_name: 'นางสาวสมหญิง รักเรียน', student_code: '65002', course_name: 'Web Application Development' },
  { id: 7, enrollment_id: 4, check_date: '2025-01-17', check_time: '00:00:00', status: 'sick', student_name: 'นางสาวสมหญิง รักเรียน', student_code: '65002', course_name: 'Programming Fundamentals' },
  { id: 8, enrollment_id: 1, check_date: '2025-01-24', check_time: '09:10:00', status: 'late', student_name: 'นายสมชาย ใจดี', student_code: '65001', course_name: 'Web Application Development' },
  { id: 9, enrollment_id: 2, check_date: '2025-01-24', check_time: '13:00:00', status: 'present', student_name: 'นายสมชาย ใจดี', student_code: '65001', course_name: 'Database Systems' },
  { id: 10, enrollment_id: 3, check_date: '2025-01-24', check_time: '08:50:00', status: 'present', student_name: 'นางสาวสมหญิง รักเรียน', student_code: '65002', course_name: 'Web Application Development' },
  { id: 11, enrollment_id: 4, check_date: '2025-01-24', check_time: '14:30:00', status: 'present', student_name: 'นางสาวสมหญิง รักเรียน', student_code: '65002', course_name: 'Programming Fundamentals' },
  { id: 12, enrollment_id: 6, check_date: '2025-01-24', check_time: '09:05:00', status: 'present', student_name: 'นางสาวนภา สดใส', student_code: '65004', course_name: 'Web Application Development' },
  { id: 13, enrollment_id: 1, check_date: '2025-01-31', check_time: '09:00:00', status: 'present', student_name: 'นายสมชาย ใจดี', student_code: '65001', course_name: 'Web Application Development' },
  { id: 14, enrollment_id: 2, check_date: '2025-01-31', check_time: '13:12:00', status: 'late', student_name: 'นายสมชาย ใจดี', student_code: '65001', course_name: 'Database Systems' },
  { id: 15, enrollment_id: 3, check_date: '2025-01-31', check_time: '00:00:00', status: 'absent', student_name: 'นางสาวสมหญิง รักเรียน', student_code: '65002', course_name: 'Web Application Development' },
];

// Helper functions
export const getStudentById = (id: number) => mockStudents.find(s => s.id === id);
export const getTeacherById = (id: number) => mockTeachers.find(t => t.id === id);
export const getCourseById = (id: number) => mockCourses.find(c => c.id === id);
export const getEnrollmentsByStudentId = (studentId: number) => mockEnrollments.filter(e => e.student_id === studentId);
export const getEnrollmentsByCourseId = (courseId: number) => mockEnrollments.filter(e => e.course_id === courseId);
export const getCoursesByTeacherId = (teacherId: number) => mockCourses.filter(c => c.teacher_id === teacherId);
