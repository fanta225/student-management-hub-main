import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockEnrollments, mockStudents, mockCourses } from '@/data/mockData';
import { Enrollment, EnrollmentForm } from '@/types';
import { Plus, Trash2, ClipboardList, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(mockEnrollments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEnrollment, setDeletingEnrollment] = useState<Enrollment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<EnrollmentForm>({
    student_id: mockStudents[0]?.id || 1,
    course_id: mockCourses[0]?.id || 1,
    semester: '1',
    academic_year: 2567,
  });

  // Calculate statistics
  const stats = {
    total: enrollments.length,
    semester1: enrollments.filter(e => e.semester === '1').length,
    semester2: enrollments.filter(e => e.semester === '2').length,
    uniqueStudents: [...new Set(enrollments.map(e => e.student_id))].length,
    uniqueCourses: [...new Set(enrollments.map(e => e.course_id))].length,
  };

  const filteredEnrollments = enrollments.filter(e =>
    e.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.student_code?.includes(searchTerm) ||
    e.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddDialog = () => {
    setFormData({
      student_id: mockStudents[0]?.id || 1,
      course_id: mockCourses[0]?.id || 1,
      semester: '1',
      academic_year: 2567,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (enrollment: Enrollment) => {
    setDeletingEnrollment(enrollment);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Check if already enrolled
    const existing = enrollments.find(
      e => e.student_id === formData.student_id && 
           e.course_id === formData.course_id &&
           e.semester === formData.semester &&
           e.academic_year === formData.academic_year
    );
    
    if (existing) {
      toast.error('นักศึกษานี้ลงทะเบียนวิชานี้แล้ว');
      return;
    }
    
    const student = mockStudents.find(s => s.id === formData.student_id);
    const course = mockCourses.find(c => c.id === formData.course_id);
    
    try {
      const res = await fetch(`${API_BASE}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: formData.student_id,
          courseId: formData.course_id,
          semester: formData.semester,
          academicYear: formData.academic_year,
        }),
      });
      
      if (!res.ok) {
        // Fallback: add locally
        const newEnrollment: Enrollment = {
          id: Math.max(...enrollments.map(e => e.id || 0)) + 1,
          ...formData,
          enrolled_at: new Date().toISOString().split('T')[0],
          student_name: student?.fullname,
          student_code: student?.student_code,
          course_name: course?.course_name,
          course_code: course?.course_code,
        };
        setEnrollments([...enrollments, newEnrollment]);
      }
      toast.success('ลงทะเบียนรายวิชาสำเร็จ');
    } catch (err) {
      console.error(err);
      // Fallback: add locally
      const newEnrollment: Enrollment = {
        id: Math.max(...enrollments.map(e => e.id || 0)) + 1,
        ...formData,
        enrolled_at: new Date().toISOString().split('T')[0],
        student_name: student?.fullname,
        student_code: student?.student_code,
        course_name: course?.course_name,
        course_code: course?.course_code,
      };
      setEnrollments([...enrollments, newEnrollment]);
      toast.success('ลงทะเบียนรายวิชาสำเร็จ');
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingEnrollment) return;
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    try {
      const res = await fetch(`${API_BASE}/enrollments/${deletingEnrollment.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        // Fallback: delete locally
        setEnrollments(enrollments.filter(e => e.id !== deletingEnrollment.id));
      }
      toast.success('ยกเลิกการลงทะเบียนสำเร็จ');
    } catch (err) {
      console.error(err);
      // Fallback: delete locally
      setEnrollments(enrollments.filter(e => e.id !== deletingEnrollment.id));
      toast.success('ยกเลิกการลงทะเบียนสำเร็จ');
    }
    
    setIsDeleteDialogOpen(false);
    setDeletingEnrollment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            ลงทะเบียนรายวิชา
          </h1>
          <p className="text-muted-foreground mt-1">จัดการการลงทะเบียนรายวิชาของนักศึกษา</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          ลงทะเบียนใหม่
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมลงทะเบียน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">รายการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">นักศึกษา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.uniqueStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">คน</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รายวิชา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.uniqueCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">วิชา</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">เทอม 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.semester1}</div>
            <p className="text-xs text-muted-foreground mt-1">รายการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">เทอม 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.semester2}</div>
            <p className="text-xs text-muted-foreground mt-1">รายการ</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาโดยชื่อ รหัส หรือวิชา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              พบ {filteredEnrollments.length} รายการ
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสนักศึกษา</TableHead>
                  <TableHead>ชื่อนักศึกษา</TableHead>
                  <TableHead>รหัสวิชา</TableHead>
                  <TableHead>ชื่อวิชา</TableHead>
                  <TableHead>เทอม/ปี</TableHead>
                  <TableHead>วันที่ลงทะเบียน</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">{enrollment.student_code}</TableCell>
                    <TableCell>{enrollment.student_name}</TableCell>
                    <TableCell>{enrollment.course_code}</TableCell>
                    <TableCell>{enrollment.course_name}</TableCell>
                    <TableCell>{enrollment.semester}/{enrollment.academic_year}</TableCell>
                    <TableCell>{enrollment.enrolled_at}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(enrollment)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ลงทะเบียนรายวิชา</DialogTitle>
            <DialogDescription>
              เลือกนักศึกษาและรายวิชาที่ต้องการลงทะเบียน
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="student_id">นักศึกษา</Label>
                <Select
                  value={formData.student_id.toString()}
                  onValueChange={(v) => setFormData({ ...formData, student_id: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.student_code} - {student.fullname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course_id">รายวิชา</Label>
                <Select
                  value={formData.course_id.toString()}
                  onValueChange={(v) => setFormData({ ...formData, course_id: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.course_code} - {course.course_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="semester">เทอม</Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(v) => setFormData({ ...formData, semester: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">ฤดูร้อน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="academic_year">ปีการศึกษา</Label>
                  <Select
                    value={formData.academic_year.toString()}
                    onValueChange={(v) => setFormData({ ...formData, academic_year: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2566">2566</SelectItem>
                      <SelectItem value="2567">2567</SelectItem>
                      <SelectItem value="2568">2568</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">
                ลงทะเบียน
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการยกเลิก</DialogTitle>
            <DialogDescription>
              คุณต้องการยกเลิกการลงทะเบียนวิชา "{deletingEnrollment?.course_name}" 
              ของนักศึกษา "{deletingEnrollment?.student_name}" หรือไม่?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              ยืนยัน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
