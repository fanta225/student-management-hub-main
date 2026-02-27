import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { mockEnrollments, mockCourses } from '@/data/mockData';
import { BookOpen } from 'lucide-react';

export default function MyCourses() {
  const { user } = useAuth();

  // Get courses based on role
  const courses = user?.role === 'teacher'
    ? mockCourses.filter(c => c.teacher_id === 1)
    : mockEnrollments.filter(e => e.student_id === 1).map(e => ({
        id: e.course_id,
        course_code: e.course_code,
        course_name: e.course_name,
        semester: e.semester,
        academic_year: e.academic_year,
      }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          {user?.role === 'teacher' ? 'รายวิชาที่สอน' : 'รายวิชาที่ลงทะเบียน'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'teacher' 
            ? 'รายวิชาทั้งหมดที่คุณเป็นผู้สอน'
            : 'รายวิชาที่คุณได้ลงทะเบียนเรียน'
          }
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {'credit' in course ? `${course.credit} หน่วยกิต` : `เทอม ${course.semester}`}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">{course.course_code}</CardTitle>
              <p className="text-muted-foreground text-sm mb-3">{course.course_name}</p>
              {'teacher_name' in course && (course as { teacher_name?: string }).teacher_name && (
                <p className="text-sm text-muted-foreground">
                  ผู้สอน: {(course as { teacher_name: string }).teacher_name}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                ปีการศึกษา {course.academic_year}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {user?.role === 'teacher' ? 'ยังไม่มีรายวิชาที่สอน' : 'ยังไม่ได้ลงทะเบียนรายวิชา'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
