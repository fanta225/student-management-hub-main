import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, ClipboardList, UserCheck, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { mockStudents, mockTeachers, mockCourses, mockEnrollments, mockAttendance } from '@/data/mockData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsRes = await fetch(`${API_BASE}/get-dashboard-stats`);
        const subjectsRes = await fetch(`${API_BASE}/get-all-subjects`);
        
        let statsData = null;
        let subjectsData = [];
        
        if (statsRes.ok) {
          statsData = await statsRes.json();
        }
        
        if (subjectsRes.ok) {
          subjectsData = await subjectsRes.json();
        }
        
        // Use mock data if API data is not available
        if (!statsData) {
          const recentAttendance = mockAttendance.slice(-5).reverse();
          statsData = {
            data: {
              totalStudents: mockStudents.length,
              totalProfessors: mockTeachers.length,
              totalCourses: mockCourses.length,
              totalEnrollments: mockEnrollments.length,
              attendanceToday: recentAttendance.length,
              presentRate: Math.round(
                (recentAttendance.filter(a => a.status === 'present' || a.status === 'late').length / 
                recentAttendance.length) * 100
              ) || 0,
            },
            attendance: recentAttendance,
          };
        }
        
        if (!Array.isArray(subjectsData) && !subjectsData.data) {
          subjectsData = mockCourses;
        }
        
        setDashboardStats(statsData);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : subjectsData.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set fallback mock data
        const recentAttendance = mockAttendance.slice(-5).reverse();
        setDashboardStats({
          data: {
            totalStudents: mockStudents.length,
            totalProfessors: mockTeachers.length,
            totalCourses: mockCourses.length,
            totalEnrollments: mockEnrollments.length,
            attendanceToday: recentAttendance.length,
            presentRate: Math.round(
              (recentAttendance.filter(a => a.status === 'present' || a.status === 'late').length / 
              recentAttendance.length) * 100
            ) || 0,
          },
          attendance: recentAttendance,
        });
        setSubjects(mockCourses);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = (dashboardStats && dashboardStats.data) ? dashboardStats.data : {
    totalStudents: mockStudents.length,
    totalProfessors: mockTeachers.length,
    totalCourses: mockCourses.length,
    totalEnrollments: mockEnrollments.length,
    attendanceToday: mockAttendance.filter(a => a.check_date === new Date().toISOString().split('T')[0]).length || 0,
    presentRate: 85,
  };

  const adminStats = [
    { title: 'นักศึกษาทั้งหมด', value: stats.totalStudents || 0, icon: Users, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'อาจารย์ทั้งหมด', value: stats.totalProfessors || 0, icon: GraduationCap, color: 'text-success', bgColor: 'bg-success/10' },
    { title: 'รายวิชาทั้งหมด', value: stats.totalCourses || 0, icon: BookOpen, color: 'text-warning', bgColor: 'bg-warning/10' },
    { title: 'การลงทะเบียน', value: stats.totalEnrollments || 0, icon: ClipboardList, color: 'text-info', bgColor: 'bg-info/10' },
  ];

  const teacherStats = [
    { title: 'รายวิชาที่สอน', value: mockCourses.filter((c: any) => c.teacher_id === 1).length || 0, icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'นักศึกษาทั้งหมด', value: mockEnrollments.length || 0, icon: Users, color: 'text-success', bgColor: 'bg-success/10' },
    { title: 'เช็คชื่อวันนี้', value: stats.attendanceToday || 0, icon: UserCheck, color: 'text-warning', bgColor: 'bg-warning/10' },
    { title: 'อัตราเข้าเรียน', value: `${stats.presentRate || 0}%`, icon: TrendingUp, color: 'text-info', bgColor: 'bg-info/10' },
  ];

  const studentStats = [
    { title: 'รายวิชาที่ลงทะเบียน', value: mockEnrollments.filter(e => e.student_id === 1).length, icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'เช็คชื่อแล้ว', value: mockAttendance.filter(a => a.student_code === '65001').length, icon: UserCheck, color: 'text-success', bgColor: 'bg-success/10' },
    { title: 'มาสาย', value: mockAttendance.filter(a => a.student_code === '65001' && a.status === 'late').length, icon: TrendingUp, color: 'text-warning', bgColor: 'bg-warning/10' },
    { title: 'อัตราเข้าเรียน', value: '93%', icon: TrendingUp, color: 'text-info', bgColor: 'bg-info/10' },
  ];

  const getStats = () => {
    switch (user?.role) {
      case 'admin': return adminStats;
      case 'teacher': return teacherStats;
      case 'student': return studentStats;
      default: return [];
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 12) greeting = 'สวัสดีตอนเช้า';
    else if (hour < 17) greeting = 'สวัสดีตอนบ่าย';
    else greeting = 'สวัสดีตอนเย็น';
    return greeting;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{getWelcomeMessage()}, {user?.name}</h1>
        <p className="text-muted-foreground">
          {user?.role === 'admin' && 'ยินดีต้อนรับสู่ระบบจัดการข้อมูล'}
          {user?.role === 'teacher' && 'ภาพรวมการสอนและการเช็คชื่อของคุณ'}
          {user?.role === 'student' && 'ภาพรวมการเรียนและการเข้าชั้นเรียนของคุณ'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {getStats().map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              การเช็คชื่อล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {((dashboardStats?.attendance || []).length > 0 ? 
                (dashboardStats.attendance.slice(0, 5)) : 
                mockAttendance.slice(-5).reverse()
              ).map((att: any, idx: number) => (
                <div key={att.id || idx} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{att.student_name}</p>
                    <p className="text-sm text-muted-foreground">{att.course_name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium 
                      ${att.status === 'present' ? 'bg-green-100 text-green-800' : ''}
                      ${att.status === 'late' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${att.status === 'sick' ? 'bg-blue-100 text-blue-800' : ''}
                      ${att.status === 'absent' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {att.status === 'present' && '✅ มาเรียน'}
                      {att.status === 'late' && '🟡 มาสาย'}
                      {att.status === 'sick' && '🔵 ลาป่วย'}
                      {att.status === 'absent' && '🔴 ขาดเรียน'}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{att.check_date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              รายวิชา
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {((Array.isArray(subjects) && subjects.length > 0) ? subjects : mockCourses)
                .slice(0, 5)
                .map((course: any, idx: number) => (
                  <div key={course.id || idx} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{course.course_code}</p>
                      <p className="text-sm text-muted-foreground">{course.course_name}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {course.credit ?? '-'} หน่วยกิต
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{course.teacher_name}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Section */}
      {user?.role === 'admin' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Courses by Enrollment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                รายวิชายอดนิยม
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCourses.map((course, idx) => {
                  const enrollCount = mockEnrollments.filter(e => e.course_id === course.id).length;
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{course.course_code}</p>
                        <p className="text-xs text-muted-foreground">{course.course_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(enrollCount / Math.max(...mockCourses.map(c => mockEnrollments.filter(e => e.course_id === c.id).length)) || 1) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium min-w-fit">{enrollCount} นักศึกษา</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                สรุปกิจกรรม
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">✅ เช็คชื่อมาเรียน</span>
                  <span className="font-bold text-lg text-green-600">
                    {mockAttendance.filter(a => a.status === 'present').length}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-muted-foreground">🟡 เช็คชื่อมาสาย</span>
                  <span className="font-bold text-lg text-yellow-600">
                    {mockAttendance.filter(a => a.status === 'late').length}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-muted-foreground">🔵 เช็คชื่อลาป่วย</span>
                  <span className="font-bold text-lg text-blue-600">
                    {mockAttendance.filter(a => a.status === 'sick').length}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-muted-foreground">🔴 เช็คชื่อขาด</span>
                  <span className="font-bold text-lg text-red-600">
                    {mockAttendance.filter(a => a.status === 'absent').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Teacher Section */}
      {user?.role === 'teacher' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Student List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                นักศึกษาในชั้นเรียน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStudents.slice(0, 5).map((student, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{student.student_code}</p>
                      <p className="text-xs text-muted-foreground">{student.fullname}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {student.year} ปี
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                สรุปการเช็คชื่อ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">มาเรียน</span>
                  <span className="font-bold text-lg text-green-600">
                    {mockAttendance.filter(a => a.status === 'present').length}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-muted-foreground text-sm">มาสาย</span>
                  <span className="font-bold text-lg text-yellow-600">
                    {mockAttendance.filter(a => a.status === 'late').length}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-muted-foreground text-sm">ลาป่วย</span>
                  <span className="font-bold text-lg text-blue-600">
                    {mockAttendance.filter(a => a.status === 'sick').length}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-muted-foreground text-sm">ขาด</span>
                  <span className="font-bold text-lg text-red-600">
                    {mockAttendance.filter(a => a.status === 'absent').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Section */}
      {user?.role === 'student' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Enrolled Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                รายวิชาที่ลงทะเบียน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockEnrollments.filter(e => e.student_id === 1).map((enrollment, idx) => {
                  const course = mockCourses.find(c => c.id === enrollment.course_id);
                  return (
                    <div key={idx} className="border-b pb-3 last:border-0">
                      <p className="font-medium text-sm">{course?.course_code}</p>
                      <p className="text-xs text-muted-foreground">{course?.course_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">อ. {course?.teacher_name}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Record */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                สรุปการเข้าเรียน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">เข้าเรียนรวม</span>
                  <span className="font-bold text-lg">
                    {mockAttendance.filter(a => a.student_code === '65001').length}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-muted-foreground text-sm">มาเรียน</span>
                  <span className="font-bold text-lg text-green-600">
                    {mockAttendance.filter(a => a.student_code === '65001' && a.status === 'present').length}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-muted-foreground text-sm">มาสาย</span>
                  <span className="font-bold text-lg text-yellow-600">
                    {mockAttendance.filter(a => a.student_code === '65001' && a.status === 'late').length}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-muted-foreground text-sm">ลาป่วย</span>
                  <span className="font-bold text-lg text-blue-600">
                    {mockAttendance.filter(a => a.student_code === '65001' && a.status === 'sick').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
