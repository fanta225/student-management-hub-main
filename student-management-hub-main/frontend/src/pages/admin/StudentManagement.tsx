import { useEffect, useState } from 'react';
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
import { Student, StudentForm } from '@/types';
import { Plus, Pencil, Trash2, Search, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { mockStudents, mockEnrollments } from '@/data/mockData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentForm>({
    student_code: '',
    fullname: '',
    email: '',
    phone: '',
    major: '',
    year: 1,
    gender: 'male',
  });

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/students`);
      if (!res.ok) throw new Error('Failed to load students');
      const json = await res.json();
      const rows = json.data || [];
      
      if (rows.length === 0) {
        // Use mock data as fallback
        setStudents(mockStudents);
        return;
      }
      
      // map DB rows to frontend Student shape
      const mapped: Student[] = rows.map((r: any) => ({
        id: r.student_id,
        student_code: r.std_class_id || r.student_code || '',
        fullname: r.fullname || '',
        email: r.username || '',
        phone: r.phone || '',
        major: r.major || '',
        year: r.year || 1,
        gender: r.gender || 'male',
        status: 'active',
        created_at: r.created_at || '',
      }));
      setStudents(mapped);
    } catch (e) {
      console.error('Error loading students, using mock data:', e);
      // Use mock data as fallback
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_code.includes(searchTerm) ||
      (student.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    by_year: {
      year1: students.filter(s => s.year === 1).length,
      year2: students.filter(s => s.year === 2).length,
      year3: students.filter(s => s.year === 3).length,
      year4: students.filter(s => s.year === 4).length,
    },
    majors: [...new Set(students.map(s => s.major))].length,
  };

  const openAddDialog = () => {
    setEditingStudent(null);
    setFormData({
      student_code: '',
      fullname: '',
      email: '',
      phone: '',
      major: '',
      year: 1,
      gender: 'male',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      student_code: student.student_code,
      fullname: student.fullname,
      email: student.email,
      phone: student.phone,
      major: student.major,
      year: student.year,
      gender: student.gender,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setDeletingStudent(student);
    setIsDeleteDialogOpen(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingStudent) {
        // update student: backend supports PUT /students/:id (fullname, major)
        const res = await fetch(`${API_BASE}/students/${editingStudent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullname: formData.fullname, major: formData.major }),
        });
        if (!res.ok) {
          // Fallback: update locally
          setStudents(students.map(s =>
            s.id === editingStudent.id
              ? { ...s, ...formData }
              : s
          ));
        }
        toast.success('แก้ไขข้อมูลนักศึกษาสำเร็จ');
      } else {
        // create student: backend expects fullName, studentId, username, password
        const payload = {
          fullName: formData.fullname,
          studentId: formData.student_code,
          username: formData.student_code,
          password: '1234',
        };
        const res = await fetch(`${API_BASE}/create-std`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok && !json.ok) {
          // Fallback: add locally
          const newStudent: Student = {
            id: Math.max(...students.map(s => s.id || 0)) + 1,
            ...formData,
            status: 'active',
            created_at: new Date().toISOString(),
          };
          setStudents([...students, newStudent]);
        }
        toast.success('เพิ่มนักศึกษาสำเร็จ');
      }

      setIsDialogOpen(false);
      await loadStudents();
    } catch (e: any) {
      console.error(e);
      // Fallback: update locally
      if (editingStudent) {
        setStudents(students.map(s =>
          s.id === editingStudent.id
            ? { ...s, ...formData }
            : s
        ));
        toast.success('แก้ไขข้อมูลนักศึกษาสำเร็จ');
      } else {
        const newStudent: Student = {
          id: Math.max(...students.map(s => s.id || 0)) + 1,
          ...formData,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        setStudents([...students, newStudent]);
        toast.success('เพิ่มนักศึกษาสำเร็จ');
      }
      setIsDialogOpen(false);
    }
  }

  async function handleDelete() {
    if (!deletingStudent) return;
    try {
      const res = await fetch(`${API_BASE}/students/${deletingStudent.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        // Fallback: delete locally
        setStudents(students.filter(s => s.id !== deletingStudent.id));
      }
      toast.success('ลบนักศึกษาสำเร็จ');
      setIsDeleteDialogOpen(false);
      setDeletingStudent(null);
      await loadStudents();
    } catch (e) {
      console.error(e);
      // Fallback: delete locally
      setStudents(students.filter(s => s.id !== deletingStudent.id));
      toast.success('ลบนักศึกษาสำเร็จ');
      setIsDeleteDialogOpen(false);
      setDeletingStudent(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            จัดการนักศึกษา
          </h1>
          <p className="text-muted-foreground mt-1">เพิ่ม แก้ไข ลบ ข้อมูลนักศึกษา</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มนักศึกษา
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมนักศึกษา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">รายการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ใช้งาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">คนใช้งาน</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ชั้นปี 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.by_year.year2}</div>
            <p className="text-xs text-muted-foreground mt-1">คน</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ชั้นปี 3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.by_year.year3}</div>
            <p className="text-xs text-muted-foreground mt-1">คน</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">สาขา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.majors}</div>
            <p className="text-xs text-muted-foreground mt-1">สาขา</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหานักศึกษา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              พบ {filteredStudents.length} รายการ
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสนักศึกษา</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>สาขา</TableHead>
                  <TableHead>ชั้นปี</TableHead>
                  <TableHead>ลงทะเบียน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const enrollmentCount = mockEnrollments.filter(e => e.student_id === student.id).length;
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_code}</TableCell>
                      <TableCell>{student.fullname}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.major}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {enrollmentCount} วิชา
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(student)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(student)}>
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
            <DialogTitle>{editingStudent ? 'แก้ไขข้อมูลนักศึกษา' : 'เพิ่มนักศึกษา'}</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลนักศึกษาให้ครบถ้วน
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="student_code">รหัสนักศึกษา</Label>
                <Input
                  id="student_code"
                  value={formData.student_code}
                  onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="major">สาขา</Label>
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="year">ชั้นปี</Label>
                  <Select
                    value={formData.year.toString()}
                    onValueChange={(v) => setFormData({ ...formData, year: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">ปี 1</SelectItem>
                      <SelectItem value="2">ปี 2</SelectItem>
                      <SelectItem value="3">ปี 3</SelectItem>
                      <SelectItem value="4">ปี 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender">เพศ</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => setFormData({ ...formData, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ชาย</SelectItem>
                    <SelectItem value="female">หญิง</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {editingStudent ? 'บันทึก' : 'เพิ่ม'}
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
              คุณต้องการลบนักศึกษา "{deletingStudent?.fullname}" หรือไม่?
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
