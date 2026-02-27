import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockEnrollments, mockAttendance } from '@/data/mockData';
import { Attendance, AttendanceStatus } from '@/types';
import { UserCheck, Clock, CheckCircle, AlertCircle, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>(mockAttendance);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [checkingCourse, setCheckingCourse] = useState<{ id: number; name: string } | null>(null);

  // Get student's enrolled courses (simulating student_id = 1)
  const studentEnrollments = mockEnrollments.filter(e => e.student_id === 1);

  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0];

  // Check if already checked in today for this course
  const hasCheckedToday = (enrollmentId: number) => {
    return attendanceRecords.some(
      a => a.enrollment_id === enrollmentId && a.check_date === currentDate
    );
  };

  // Calculate statistics for each enrollment
  const calculateStats = (enrollmentId: number) => {
    const records = attendanceRecords.filter(a => a.enrollment_id === enrollmentId);
    return {
      total: records.length,
      present: records.filter(a => a.status === 'present').length,
      late: records.filter(a => a.status === 'late').length,
      sick: records.filter(a => a.status === 'sick').length,
      absent: records.filter(a => a.status === 'absent').length,
    };
  };

  // Calculate overall statistics
  const studentRecords = attendanceRecords.filter(a => 
    studentEnrollments.some(e => e.id === a.enrollment_id)
  );
  const totalAttendance = studentRecords.length;
  const presentCount = studentRecords.filter(a => a.status === 'present').length;
  const lateCount = studentRecords.filter(a => a.status === 'late').length;
  const attendanceRate = totalAttendance > 0 ? Math.round(((presentCount + lateCount) / totalAttendance) * 100) : 0;

  const openCheckDialog = (enrollment: typeof studentEnrollments[0]) => {
    if (hasCheckedToday(enrollment.id)) {
      toast.error('คุณได้เช็คชื่อวิชานี้วันนี้แล้ว');
      return;
    }
    setCheckingCourse({ id: enrollment.id, name: enrollment.course_name || '' });
    setIsDialogOpen(true);
  };

  const handleCheckIn = () => {
    if (!checkingCourse) return;

    const enrollment = studentEnrollments.find(e => e.id === checkingCourse.id);
    
    // Determine status based on time (mock logic)
    const hour = now.getHours();
    let status: AttendanceStatus = 'present';
    if (hour >= 9 && hour < 10) {
      status = 'late';
    }

    const newAttendance: Attendance = {
      id: Math.max(...attendanceRecords.map(a => a.id)) + 1,
      enrollment_id: checkingCourse.id,
      check_date: currentDate,
      check_time: currentTime,
      status,
      student_name: enrollment?.student_name,
      student_code: enrollment?.student_code,
      course_name: enrollment?.course_name,
    };

    setAttendanceRecords([...attendanceRecords, newAttendance]);
    toast.success(`เช็คชื่อสำเร็จ - ${status === 'present' ? 'มาเรียน' : 'มาสาย'}`);
    setIsDialogOpen(false);
    setCheckingCourse(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-primary" />
          เช็คชื่อเข้าเรียน
        </h1>
        <p className="text-muted-foreground mt-1">จัดการการเช็คชื่อและดูประวัติการเข้าเรียน</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมการเช็คชื่อ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendance}</div>
            <p className="text-xs text-muted-foreground mt-1">ครั้งทั้งหมด</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">มาเรียน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">ครั้ง</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">มาสาย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
            <p className="text-xs text-muted-foreground mt-1">ครั้ง</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">อัตราการเข้าเรียน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">โดยรวม</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Time */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Clock className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">เวลาปัจจุบัน</p>
              <p className="text-2xl font-bold">
                {now.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-lg">{currentTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Quick Check and History */}
      <Tabs defaultValue="quick-check" className="w-full">
        <TabsList>
          <TabsTrigger value="quick-check">เช็คชื่อรายวิชา</TabsTrigger>
          <TabsTrigger value="history">ประวัติการเช็คชื่อ</TabsTrigger>
        </TabsList>

        {/* Quick Check Tab */}
        <TabsContent value="quick-check" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {studentEnrollments.map((enrollment) => {
              const isChecked = hasCheckedToday(enrollment.id);
              const todayRecord = attendanceRecords.find(
                a => a.enrollment_id === enrollment.id && a.check_date === currentDate
              );
              const stats = calculateStats(enrollment.id);

              return (
                <Card key={enrollment.id} className={isChecked ? 'border-green-500/50 bg-green-50/50' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{enrollment.course_code}</CardTitle>
                        <p className="text-sm text-muted-foreground">{enrollment.course_name}</p>
                      </div>
                      {isChecked && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">เทอม</span>
                        <p className="font-medium">{enrollment.semester}/{enrollment.academic_year}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">รวมเช็คชื่อ</span>
                        <p className="font-medium">{stats.total} ครั้ง</p>
                      </div>
                    </div>
                    
                    {isChecked ? (
                      <div className="text-left pt-2 border-t">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                          ${todayRecord?.status === 'present' ? 'status-present' : ''}
                          ${todayRecord?.status === 'late' ? 'status-late' : ''}
                        `}>
                          {todayRecord?.status === 'present' && '✅ มาเรียน'}
                          {todayRecord?.status === 'late' && '🟡 มาสาย'}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          เช็คชื่อเวลา {todayRecord?.check_time}
                        </p>
                      </div>
                    ) : (
                      <Button onClick={() => openCheckDialog(enrollment)} className="w-full">
                        เช็คชื่อ
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {studentEnrollments.length === 0 && (
            <Card className="py-12">
              <CardContent className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">ไม่พบรายวิชาที่ลงทะเบียน</p>
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
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสวิชา</TableHead>
                      <TableHead>ชื่อวิชา</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead>เวลา</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords
                      .filter(a => studentEnrollments.some(e => e.id === a.enrollment_id))
                      .sort((a, b) => new Date(b.check_date).getTime() - new Date(a.check_date).getTime())
                      .map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {studentEnrollments.find(e => e.id === record.enrollment_id)?.course_code}
                          </TableCell>
                          <TableCell>{record.course_name}</TableCell>
                          <TableCell>{record.check_date}</TableCell>
                          <TableCell>{record.check_time}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                              ${record.status === 'present' ? 'status-present' : ''}
                              ${record.status === 'late' ? 'status-late' : ''}
                              ${record.status === 'sick' ? 'status-sick' : ''}
                              ${record.status === 'absent' ? 'status-absent' : ''}
                            `}>
                              {record.status === 'present' && '✅ มาเรียน'}
                              {record.status === 'late' && '🟡 มาสาย'}
                              {record.status === 'sick' && '🔵 ลาป่วย'}
                              {record.status === 'absent' && '🔴 ขาด'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              {studentRecords.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">ไม่มีประวัติการเช็คชื่อ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Check-in Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการเช็คชื่อ</DialogTitle>
            <DialogDescription>
              คุณต้องการเช็คชื่อเข้าเรียนวิชา "{checkingCourse?.name}" หรือไม่?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">วันที่</span>
                <span className="font-medium">{currentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">เวลา</span>
                <span className="font-medium">{currentTime}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleCheckIn}>
              ยืนยันเช็คชื่อ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
