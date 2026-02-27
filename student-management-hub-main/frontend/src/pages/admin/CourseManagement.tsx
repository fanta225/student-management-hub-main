import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { mockCourses, mockTeachers, mockEnrollments } from '@/data/mockData';
import { Course, CourseForm } from '@/types';
import { Plus, Pencil, Trash2, Search, BookOpen, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseForm>({
    course_code: '',
    course_name: '',
    credit: 3,
    teacher_id: 1,
    semester: '1',
    academic_year: 2567,
  });

  const filteredCourses = courses.filter(
    (course) =>
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    total: courses.length,
    active: courses.filter(c => c.status === 'active').length,
    semester1: courses.filter(c => c.semester === '1').length,
    semester2: courses.filter(c => c.semester === '2').length,
    totalEnrollments: mockEnrollments.length,
  };

  const openAddDialog = () => {
    setEditingCourse(null);
    setFormData({
      course_code: '',
      course_name: '',
      credit: 3,
      teacher_id: mockTeachers[0]?.id || 1,
      semester: '1',
      academic_year: 2567,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      course_code: course.course_code,
      course_name: course.course_name,
      credit: course.credit,
      teacher_id: course.teacher_id,
      semester: course.semester,
      academic_year: course.academic_year,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (course: Course) => {
    setDeletingCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const teacher = mockTeachers.find(t => t.id === formData.teacher_id);
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    try {
      if (editingCourse) {
        // Update course
        const res = await fetch(`${API_BASE}/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          // Fallback: update locally
          setCourses(courses.map(c => 
            c.id === editingCourse.id 
              ? { ...c, ...formData, teacher_name: teacher?.fullname }
              : c
          ));
        }
        toast.success('แก้ไขข้อมูลรายวิชาสำเร็จ');
      } else {
        // Create course
        const payload = {
          ...formData,
          status: 'active',
        };
        const res = await fetch(`${API_BASE}/courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          // Fallback: add locally
          const newCourse: Course = {
            id: Math.max(...courses.map(c => c.id || 0)) + 1,
            ...formData,
            teacher_name: teacher?.fullname,
            status: 'active',
          };
          setCourses([...courses, newCourse]);
        }
        toast.success('เพิ่มรายวิชาสำเร็จ');
      }
    } catch (err) {
      console.error(err);
      // Fallback: update locally
      if (editingCourse) {
        setCourses(courses.map(c => 
          c.id === editingCourse.id 
            ? { ...c, ...formData, teacher_name: teacher?.fullname }
            : c
        ));
        toast.success('แก้ไขข้อมูลรายวิชาสำเร็จ');
      } else {
        const newCourse: Course = {
          id: Math.max(...courses.map(c => c.id || 0)) + 1,
          ...formData,
          teacher_name: teacher?.fullname,
          status: 'active',
        };
        setCourses([...courses, newCourse]);
        toast.success('เพิ่มรายวิชาสำเร็จ');
      }
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    try {
      const res = await fetch(`${API_BASE}/courses/${deletingCourse.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        // Fallback: delete locally
        setCourses(courses.filter(c => c.id !== deletingCourse.id));
      }
      toast.success('ลบรายวิชาสำเร็จ');
    } catch (err) {
      console.error(err);
      // Fallback: delete locally
      setCourses(courses.filter(c => c.id !== deletingCourse.id));
      toast.success('ลบรายวิชาสำเร็จ');
    }
    
    setIsDeleteDialogOpen(false);
    setDeletingCourse(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            จัดการรายวิชา
          </h1>
          <p className="text-muted-foreground mt-1">เพิ่ม แก้ไข ลบ ข้อมูลรายวิชา</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มรายวิชา
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมรายวิชา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">วิชา</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">เปิดสอน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">วิชา</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">เทอม 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.semester1}</div>
            <p className="text-xs text-muted-foreground mt-1">วิชา</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">เทอม 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.semester2}</div>
            <p className="text-xs text-muted-foreground mt-1">วิชา</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ลงทะเบียน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground mt-1">นักศึกษา</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหารายวิชา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              พบ {filteredCourses.length} รายการ
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสวิชา</TableHead>
                  <TableHead>ชื่อวิชา</TableHead>
                  <TableHead>หน่วยกิต</TableHead>
                  <TableHead>อาจารย์ผู้สอน</TableHead>
                  <TableHead>เทอม/ปี</TableHead>
                  <TableHead>ลงทะเบียน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => {
                  const enrollmentCount = mockEnrollments.filter(e => e.course_id === course.id).length;
                  return (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.course_code}</TableCell>
                      <TableCell>{course.course_name}</TableCell>
                      <TableCell>{course.credit}</TableCell>
                      <TableCell>{course.teacher_name}</TableCell>
                      <TableCell>{course.semester}/{course.academic_year}</TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {enrollmentCount} คน
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {course.status === 'active' ? 'เปิดสอน' : 'ปิด'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(course)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(course)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'แก้ไขข้อมูลรายวิชา' : 'เพิ่มรายวิชา'}</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลรายวิชาให้ครบถ้วน
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="course_code">รหัสวิชา</Label>
                <Input
                  id="course_code"
                  value={formData.course_code}
                  onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                  placeholder="เช่น WEB101"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course_name">ชื่อวิชา</Label>
                <Input
                  id="course_name"
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="credit">หน่วยกิต</Label>
                  <Select
                    value={formData.credit.toString()}
                    onValueChange={(v) => setFormData({ ...formData, credit: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher_id">อาจารย์ผู้สอน</Label>
                <Select
                  value={formData.teacher_id.toString()}
                  onValueChange={(v) => setFormData({ ...formData, teacher_id: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.fullname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="academic_year">ปีการศึกษา</Label>
                <Input
                  id="academic_year"
                  type="number"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {editingCourse ? 'บันทึก' : 'เพิ่ม'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              คุณต้องการลบรายวิชา "{deletingCourse?.course_name}" หรือไม่?
              การดำเนินการนี้ไม่สามารถยกเลิกได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              ลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
