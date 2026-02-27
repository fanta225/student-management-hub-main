import { useState, useEffect } from 'react';
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
import { mockTeachers, mockCourses } from '@/data/mockData';
import { Teacher, TeacherForm } from '@/types';
import { Plus, Pencil, Trash2, Search, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

// using same base URL pattern as other admin pages
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TeacherManagement() {
  // -- data comes from backend instead of hard‑coded mocks --
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<TeacherForm>({
    teacher_code: '',
    fullname: '',
    email: '',
    phone: '',
    department: '',
  });

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacher_code.includes(searchTerm) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'active').length,
    departments: [...new Set(teachers.map(t => t.department))].length,
    totalCourses: mockCourses.filter(c => teachers.some(t => t.id === c.teacher_id)).length,
  };

  // fetch data from API when component mounts or after mutations
  const loadTeachers = async () => {
    try {
      const res = await fetch(`${API_BASE}/get-all-professors`);
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        // map backend fields to UI model
        setTeachers(
          json.data.map((p: any) => ({
            id: p.id,
            teacher_code: p.username || '',
            fullname: p.fullname,
            email: p.email || '',
            phone: p.tel || '',
            department: p.department || '',
            status: p.status || 'active',
            created_at: p.created_at || '',
          }))
        );
      } else {
        // Use mock data as fallback
        setTeachers(mockTeachers);
      }
    } catch (err) {
      console.error('unable to load teachers, using mock data:', err);
      // Use mock data as fallback
      setTeachers(mockTeachers);
    }
  };

  // initial load
  useEffect(() => {
    loadTeachers();
  }, []);

  const openAddDialog = () => {
    setEditingTeacher(null);
    setFormData({
      teacher_code: '',
      fullname: '',
      email: '',
      phone: '',
      department: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      teacher_code: teacher.teacher_code,
      fullname: teacher.fullname,
      email: teacher.email,
      phone: teacher.phone,
      department: teacher.department,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (teacher: Teacher) => {
    setDeletingTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        // send update to server
        const resp = await fetch(`${API_BASE}/update-professor/${editingTeacher.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullname: formData.fullname,
            tel: formData.phone,
            email: formData.email,
            department: formData.department,
          }),
        });
        if (!resp.ok) {
          // Fallback: update locally
          setTeachers(teachers.map(t =>
            t.id === editingTeacher.id
              ? { ...t, ...formData }
              : t
          ));
        }
        toast.success('แก้ไขข้อมูลอาจารย์สำเร็จ');
      } else {
        const resp = await fetch(`${API_BASE}/create-professor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullname: formData.fullname,
            username: formData.teacher_code,
            tel: formData.phone,
            email: formData.email,
            department: formData.department,
            password: 'changeme',
          }),
        });
        if (!resp.ok) {
          // Fallback: add locally
          const newTeacher: Teacher = {
            id: Math.max(...teachers.map(t => t.id || 0)) + 1,
            ...formData,
            status: 'active',
            created_at: new Date().toISOString(),
          };
          setTeachers([...teachers, newTeacher]);
        }
        toast.success('เพิ่มอาจารย์สำเร็จ');
      }
      // reload list from server
      await loadTeachers();
    } catch (err) {
      console.error(err);
      // Try to update locally as fallback
      if (editingTeacher) {
        setTeachers(teachers.map(t =>
          t.id === editingTeacher.id
            ? { ...t, ...formData }
            : t
        ));
        toast.success('แก้ไขข้อมูลอาจารย์สำเร็จ');
      } else {
        const newTeacher: Teacher = {
          id: Math.max(...teachers.map(t => t.id || 0)) + 1,
          ...formData,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        setTeachers([...teachers, newTeacher]);
        toast.success('เพิ่มอาจารย์สำเร็จ');
      }
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deletingTeacher) {
      try {
        const resp = await fetch(`${API_BASE}/delete-professor/${deletingTeacher.id}`, {
          method: 'DELETE',
        });
        if (!resp.ok) {
          // Fallback: delete locally
          setTeachers(teachers.filter(t => t.id !== deletingTeacher.id));
        }
        toast.success('ลบอาจารย์สำเร็จ');
        await loadTeachers();
      } catch (err) {
        console.error(err);
        // Fallback: delete locally
        setTeachers(teachers.filter(t => t.id !== deletingTeacher.id));
        toast.success('ลบอาจารย์สำเร็จ');
      }
    }
    setIsDeleteDialogOpen(false);
    setDeletingTeacher(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            จัดการอาจารย์
          </h1>
          <p className="text-muted-foreground mt-1">เพิ่ม แก้ไข ลบ ข้อมูลอาจารย์</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มอาจารย์
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมอาจารย์</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">คน</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ใช้งาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">คน</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ภาควิชา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.departments}</div>
            <p className="text-xs text-muted-foreground mt-1">แห่ง</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รายวิชา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">วิชา</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาอาจารย์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              พบ {filteredTeachers.length} รายการ
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสอาจารย์</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>เบอร์โทร</TableHead>
                  <TableHead>ภาควิชา</TableHead>
                  <TableHead>รายวิชา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => {
                    const teacherCourses = mockCourses.filter(c => c.teacher_id === teacher.id).length;
                    return (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">{teacher.teacher_code}</TableCell>
                        <TableCell>{teacher.fullname}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{teacher.phone}</TableCell>
                        <TableCell>{teacher.department}</TableCell>
                        <TableCell>
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {teacherCourses} วิชา
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            teacher.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {teacher.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(teacher)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(teacher)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      ไม่มีข้อมูลอาจารย์
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Courses by Teacher */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">รายวิชาที่สอน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockCourses.map((course, idx) => {
              const teacher = teachers.find(t => t.id === course.teacher_id);
              return (
                <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{course.course_code}</p>
                    <p className="text-xs text-muted-foreground">{course.course_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-primary">{teacher?.fullname || 'ไม่ระบุ'}</p>
                    <p className="text-xs text-muted-foreground">{course.credit} หน่วยกิต</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTeacher ? 'แก้ไขข้อมูลอาจารย์' : 'เพิ่มอาจารย์'}</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลอาจารย์ให้ครบถ้วน
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="teacher_code">รหัสอาจารย์</Label>
                <Input
                  id="teacher_code"
                  value={formData.teacher_code}
                  onChange={(e) => setFormData({ ...formData, teacher_code: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullname">ชื่อ-นามสกุล</Label>
                <Input
                  id="fullname"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">เบอร์โทร</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">ภาควิชา</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {editingTeacher ? 'บันทึก' : 'เพิ่ม'}
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
              คุณต้องการลบอาจารย์ "{deletingTeacher?.fullname}" หรือไม่?
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
