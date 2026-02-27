import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockCourses, mockEnrollments, mockAttendance } from '@/data/mockData';
import { Attendance, AttendanceStatus } from '@/types';
import { UserCheck, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>(mockAttendance);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [attendanceStatus, setAttendanceStatus] = useState<Record<number, AttendanceStatus>>({});
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>('');

  // Get teacher's courses (simulating teacher_id = 1)
  const teacherCourses = mockCourses.filter(c => c.teacher_id === 1);

  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0];

  // Get students enrolled in selected course
  const courseEnrollments = selectedCourseId 
    ? mockEnrollments.filter(e => e.course_id === parseInt(selectedCourseId))
    : [];

  // Calculate statistics for selected course
  const calculateCourseStats = () => {
    if (!selectedCourseId) return { present: 0, late: 0, sick: 0, absent: 0, total: courseEnrollments.length };
    
    const todayRecords = attendanceRecords.filter(
      a => a.check_date === currentDate && 
           courseEnrollments.some(e => e.id === a.enrollment_id)
    );
    
    return {
      present: todayRecords.filter(a => a.status === 'present').length,
      late: todayRecords.filter(a => a.status === 'late').length,
      sick: todayRecords.filter(a => a.status === 'sick').length,
      absent: todayRecords.filter(a => a.status === 'absent').length,
      total: courseEnrollments.length,
    };
  };

  const stats = calculateCourseStats();

  const handleStatusChange = (enrollmentId: number, status: AttendanceStatus) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [enrollmentId]: status,
    }));
  };

  const saveAttendance = () => {
    const newRecords: Attendance[] = [];

    courseEnrollments.forEach(enrollment => {
      const status = attendanceStatus[enrollment.id];
      if (status) {
        // Check if already recorded
        const existing = attendanceRecords.find(
          a => a.enrollment_id === enrollment.id && a.check_date === currentDate
        );

        if (!existing) {
          newRecords.push({
            id: Math.max(...attendanceRecords.map(a => a.id), 0) + newRecords.length + 1,
            enrollment_id: enrollment.id,
            check_date: currentDate,
            check_time: currentTime,
            status,
            student_name: enrollment.student_name,
            student_code: enrollment.student_code,
            course_name: enrollment.course_name,
          });
        }
      }
    });

    if (newRecords.length === 0) {
      toast.error('กรุณาเลือกสถานะให้นักศึกษาอย่างน้อย 1 คน');
      return;
    }

    setAttendanceRecords([...attendanceRecords, ...newRecords]);
    toast.success(`บันทึกการเช็คชื่อสำเร็จ (${newRecords.length} คน)`);
    setAttendanceStatus({});
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const styles = {
      present: 'status-present',
      late: 'status-late',
      sick: 'status-sick',
      absent: 'status-absent',
    };
    const labels = {
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
          <UserCheck className="h-8 w-8 text-primary" />
          เช็คชื่อนักศึกษา
        </h1>
        <p className="text-muted-foreground mt-1">จัดการการเช็คชื่อและดูประวัติการเข้าเรียน</p>
      </div>

      {/* Course Selection and Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            เลือกรายวิชา
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="เลือกรายวิชา..." />
              </SelectTrigger>
              <SelectContent>
                {teacherCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.course_code} - {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCourseId && (
              <div className="text-sm text-muted-foreground">
                <span>📅 วันที่: {currentDate}</span>
                <span className="mx-2">|</span>
                <span>👥 รวมนักศึกษา: {courseEnrollments.length} คน</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {selectedCourseId && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">รวมนักศึกษา</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">คน</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">มาเรียน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <p className="text-xs text-muted-foreground mt-1">คน</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">มาสาย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
              <p className="text-xs text-muted-foreground mt-1">คน</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ลาป่วย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.sick}</div>
              <p className="text-xs text-muted-foreground mt-1">คน</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ขาด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <p className="text-xs text-muted-foreground mt-1">คน</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for Today and History */}
      {selectedCourseId && (
        <Tabs defaultValue="today" className="w-full">
          <TabsList>
            <TabsTrigger value="today">เช็คชื่อวันนี้</TabsTrigger>
            <TabsTrigger value="history">ประวัติการเช็คชื่อ</TabsTrigger>
          </TabsList>

          {/* Today's Attendance Tab */}
          <TabsContent value="today" className="space-y-4">
            {courseEnrollments.length > 0 ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">รายชื่อนักศึกษา</CardTitle>
                  <Button onClick={saveAttendance} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    บันทึกการเช็คชื่อ
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>รหัสนักศึกษา</TableHead>
                          <TableHead>ชื่อ-นามสกุล</TableHead>
                          <TableHead>สถานะวันนี้</TableHead>
                          <TableHead>เช็คชื่อ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courseEnrollments.map((enrollment) => {
                          const todayRecord = attendanceRecords.find(
                            a => a.enrollment_id === enrollment.id && a.check_date === currentDate
                          );
                          const currentStatus = attendanceStatus[enrollment.id];

                          return (
                            <TableRow key={enrollment.id}>
                              <TableCell className="font-medium">{enrollment.student_code}</TableCell>
                              <TableCell>{enrollment.student_name}</TableCell>
                              <TableCell>
                                {todayRecord ? (
                                  getStatusBadge(todayRecord.status)
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {!todayRecord && (
                                  <Select
                                    value={currentStatus || ''}
                                    onValueChange={(v) => handleStatusChange(enrollment.id, v as AttendanceStatus)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="เลือก..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="present">✅ มาเรียน</SelectItem>
                                      <SelectItem value="late">🟡 มาสาย</SelectItem>
                                      <SelectItem value="sick">🔵 ลาป่วย</SelectItem>
                                      <SelectItem value="absent">🔴 ขาด</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="py-12">
                <CardContent className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">ไม่มีนักศึกษาลงทะเบียนในรายวิชานี้</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ประวัติการเช็คชื่อ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">ค้นหาตามวันที่</label>
                  <input
                    type="date"
                    value={selectedHistoryDate}
                    onChange={(e) => setSelectedHistoryDate(e.target.value)}
                    className="mt-1 px-3 py-2 border rounded-md w-full max-w-sm"
                  />
                </div>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>รหัสนักศึกษา</TableHead>
                        <TableHead>ชื่อ-นามสกุล</TableHead>
                        <TableHead>วันที่</TableHead>
                        <TableHead>เวลา</TableHead>
                        <TableHead>สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords
                        .filter(a => courseEnrollments.some(e => e.id === a.enrollment_id))
                        .filter(a => !selectedHistoryDate || a.check_date === selectedHistoryDate)
                        .sort((a, b) => new Date(b.check_date).getTime() - new Date(a.check_date).getTime())
                        .map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.student_code}</TableCell>
                            <TableCell>{record.student_name}</TableCell>
                            <TableCell>{record.check_date}</TableCell>
                            <TableCell>{record.check_time}</TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
                {attendanceRecords.filter(a => courseEnrollments.some(e => e.id === a.enrollment_id)).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">ไม่มีประวัติการเช็คชื่อ</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
