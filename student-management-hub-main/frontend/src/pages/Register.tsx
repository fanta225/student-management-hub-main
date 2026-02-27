 import { useState } from 'react';
 import { useNavigate, Navigate, Link } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { UserRole } from '@/types';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { GraduationCap, User, BookOpen, Loader2 } from 'lucide-react';
 import { toast } from 'sonner';
 
 export default function Register() {
   const { register, isAuthenticated } = useAuth();
   const navigate = useNavigate();
   const [isLoading, setIsLoading] = useState(false);
   const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
   const [formData, setFormData] = useState({
     name: '',
     email: '',
     password: '',
     confirmPassword: '',
     studentCode: '',
     teacherCode: '',
     phone: '',
     major: '',
     department: '',
   });
 
   if (isAuthenticated) {
     return <Navigate to="/dashboard" replace />;
   }
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (formData.password !== formData.confirmPassword) {
       toast.error('รหัสผ่านไม่ตรงกัน');
       return;
     }
 
     if (formData.password.length < 4) {
       toast.error('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
       return;
     }
 
     setIsLoading(true);
 
     try {
       const success = await register({
         name: formData.name,
         email: formData.email,
         password: formData.password,
         role: activeTab,
         code: activeTab === 'student' ? formData.studentCode : formData.teacherCode,
         phone: formData.phone,
         major: activeTab === 'student' ? formData.major : undefined,
         department: activeTab === 'teacher' ? formData.department : undefined,
       });
       
       if (success) {
         toast.success('สมัครสมาชิกสำเร็จ');
         navigate('/dashboard');
       } else {
         toast.error('อีเมลนี้ถูกใช้งานแล้ว');
       }
     } catch (error) {
       toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
     } finally {
       setIsLoading(false);
     }
   };
 
   const getTabIcon = (role: 'student' | 'teacher') => {
     switch (role) {
       case 'teacher': return <BookOpen className="h-4 w-4" />;
       case 'student': return <User className="h-4 w-4" />;
     }
   };
 
   return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
       <div className="w-full max-w-md animate-fade-in">
         {/* Logo */}
         <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-lg">
             <GraduationCap className="h-8 w-8" />
           </div>
           <h1 className="text-2xl font-bold text-foreground">ระบบเช็คชื่อเข้าเรียน</h1>
           <p className="text-muted-foreground mt-1">Attendance Management System</p>
         </div>
 
         <Card className="shadow-xl border-0">
           <CardHeader className="text-center pb-4">
             <CardTitle>สมัครสมาชิก</CardTitle>
             <CardDescription>กรุณากรอกข้อมูลเพื่อสมัครสมาชิก</CardDescription>
           </CardHeader>
           <CardContent>
             <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'student' | 'teacher')}>
               <TabsList className="grid w-full grid-cols-2 mb-6">
                 <TabsTrigger value="student" className="flex items-center gap-2">
                   {getTabIcon('student')}
                   <span>นักศึกษา</span>
                 </TabsTrigger>
                 <TabsTrigger value="teacher" className="flex items-center gap-2">
                   {getTabIcon('teacher')}
                   <span>อาจารย์</span>
                 </TabsTrigger>
               </TabsList>
 
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                   <Input
                     id="name"
                     type="text"
                     placeholder="กรอกชื่อ-นามสกุล"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     required
                   />
                 </div>
 
                 {activeTab === 'student' ? (
                   <>
                     <div className="space-y-2">
                       <Label htmlFor="studentCode">รหัสนักศึกษา</Label>
                       <Input
                         id="studentCode"
                         type="text"
                         placeholder="เช่น 65010001"
                         value={formData.studentCode}
                         onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                         required
                       />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="major">สาขาวิชา</Label>
                       <Input
                         id="major"
                         type="text"
                         placeholder="เช่น วิทยาการคอมพิวเตอร์"
                         value={formData.major}
                         onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                         required
                       />
                     </div>
                   </>
                 ) : (
                   <>
                     <div className="space-y-2">
                       <Label htmlFor="teacherCode">รหัสอาจารย์</Label>
                       <Input
                         id="teacherCode"
                         type="text"
                         placeholder="เช่น T001"
                         value={formData.teacherCode}
                         onChange={(e) => setFormData({ ...formData, teacherCode: e.target.value })}
                         required
                       />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="department">แผนก/ภาควิชา</Label>
                       <Input
                         id="department"
                         type="text"
                         placeholder="เช่น วิทยาการคอมพิวเตอร์"
                         value={formData.department}
                         onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                         required
                       />
                     </div>
                   </>
                 )}
 
                 <div className="space-y-2">
                   <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                   <Input
                     id="phone"
                     type="tel"
                     placeholder="เช่น 0812345678"
                     value={formData.phone}
                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                     required
                   />
                 </div>
 
                 <div className="space-y-2">
                   <Label htmlFor="email">อีเมล</Label>
                   <Input
                     id="email"
                     type="email"
                     placeholder="example@school.com"
                     value={formData.email}
                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                     required
                   />
                 </div>
 
                 <div className="space-y-2">
                   <Label htmlFor="password">รหัสผ่าน</Label>
                   <Input
                     id="password"
                     type="password"
                     placeholder="••••••••"
                     value={formData.password}
                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                     required
                   />
                 </div>
 
                 <div className="space-y-2">
                   <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                   <Input
                     id="confirmPassword"
                     type="password"
                     placeholder="••••••••"
                     value={formData.confirmPassword}
                     onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                     required
                   />
                 </div>
 
                 <Button type="submit" className="w-full" disabled={isLoading}>
                   {isLoading ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       กำลังสมัครสมาชิก...
                     </>
                   ) : (
                     'สมัครสมาชิก'
                   )}
                 </Button>
               </form>
             </Tabs>
 
             {/* Link to login */}
             <div className="mt-6 text-center">
               <p className="text-sm text-muted-foreground">
                 มีบัญชีอยู่แล้ว?{' '}
                 <Link to="/login" className="text-primary hover:underline font-medium">
                   เข้าสู่ระบบ
                 </Link>
               </p>
             </div>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }