import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { mockAttendance, mockEnrollments, mockCourses } from '@/data/mockData';
import { Calendar, TrendingUp } from 'lucide-react';

export default function AttendanceHistory() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Get relevant data based on role
  const enrollments = user?.role === 'student'
    ? mockEnrollments.filter(e => e.student_id === 1)
    : mockEnrollments;

  const courses = user?.role === 'teacher'
    ? mockCourses.filter(c => c.teacher_id === 1)
    : enrollments.map(e => ({ id: e.course_id, course_name: e.course_name, course_code: e.course_code }));

  const uniqueCourses = [...new Map(courses.map(c => [c.id, c])).values()];

  // Filter attendance records
  const relevantEnrollmentIds = enrollments.map(e => e.id);
  let records = mockAttendance.filter(a => relevantEnrollmentIds.includes(a.enrollment_id));

  if (selectedCourse !== 'all') {
    const courseEnrollments = enrollments.filter(e => e.course_id === parseInt(selectedCourse));
    const courseEnrollmentIds = courseEnrollments.map(e => e.id);
    records = records.filter(a => courseEnrollmentIds.includes(a.enrollment_id));
  }

  // Calculate statistics
  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    late: records.filter(r => r.status === 'late').length,
    sick: records.filter(r => r.status === 'sick').length,
    absent: records.filter(r => r.status === 'absent').length,
  };
  const attendanceRate = stats.total > 0 
    ? Math.round(((stats.present + stats.late) / stats.total) * 100) 
    : 0;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      present: 'status-present',
      late: 'status-late',
      sick: 'status-sick',
      absent: 'status-absent',
    };
    const labels: Record<string, string> = {
      present: '✅ มาเรียน',
      late: '🟡 มาสาย',
      sick: '🔵 ลาป่วย',
      absent: '🔴 ขาด',
    };
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          ประวัติการเข้าเรียน
        </h1>
        <p className="text-muted-foreground mt-1">ดูสถิติและประวัติการเช็คชื่อ</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">ทั้งหมด</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-green-600">มาเรียน</p>
              <p className="text-3xl font-bold text-green-600">{stats.present}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-yellow-600">มาสาย</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-blue-600">ลาป่วย</p>
              <p className="text-3xl font-bold text-blue-600">{stats.sick}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-red-600">ขาด</p>
              <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Rate */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">อัตราการเข้าเรียน</p>
              <p className="text-3xl font-bold">{attendanceRate}%</p>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter & Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>รายละเอียดการเข้าเรียน</CardTitle>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกรายวิชา</SelectItem>
              {uniqueCourses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.course_code} - {course.course_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>เวลา</TableHead>
                  {user?.role === 'teacher' && <TableHead>นักศึกษา</TableHead>}
                  <TableHead>รายวิชา</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={user?.role === 'teacher' ? 5 : 4} className="text-center py-8 text-muted-foreground">
                      ไม่มีข้อมูลการเข้าเรียน
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.check_date}</TableCell>
                      <TableCell>{record.check_time}</TableCell>
                      {user?.role === 'teacher' && (
                        <TableCell>
                          {record.student_code} - {record.student_name}
                        </TableCell>
                      )}
                      <TableCell>{record.course_name}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
