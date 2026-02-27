import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { UserCircle, Save, Mail, Phone, Building, GraduationCap, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '0812345678',
    department: 'เทคโนโลยีสารสนเทศ',
    studentCode: '65001',
    year: 2,
  });

  // Load saved profile image from localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem(`profileImage_${user?.id}`);
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, [user?.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem(`profileImage_${user?.id}`, base64String);
        toast.success('อัปโหลดรูปภาพสำเร็จ');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = () => {
    toast.success('บันทึกข้อมูลสำเร็จ');
    setIsEditing(false);
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'teacher': return 'อาจารย์';
      case 'student': return 'นักศึกษา';
      default: return '';
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-primary" />
          โปรไฟล์
        </h1>
        <p className="text-muted-foreground mt-1">จัดการข้อมูลส่วนตัวของคุณ</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 cursor-pointer" onClick={handleImageClick}>
                <AvatarImage src={profileImage || undefined} alt={formData.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {formData.name ? getInitials(formData.name) : <UserCircle className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleImageClick}
              >
                <Camera className="h-8 w-8 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{formData.name}</h2>
              <p className="text-muted-foreground">{formData.email}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                  {getRoleLabel()}
                </span>
              </div>
            </div>
            <Button 
              variant={isEditing ? "outline" : "default"}
              onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
            >
              {isEditing ? 'ยกเลิก' : 'แก้ไข'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">คลิกที่รูปโปรไฟล์เพื่อเปลี่ยนรูป</p>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
          <CardDescription>ข้อมูลพื้นฐานของคุณในระบบ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ-นามสกุล</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">
                {user?.role === 'student' ? 'สาขา' : 'ภาควิชา'}
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {user?.role === 'student' && (
            <>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="studentCode">รหัสนักศึกษา</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="studentCode"
                      value={formData.studentCode}
                      disabled
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">ชั้นปี</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </>
          )}

          {isEditing && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>ตั้งค่าบัญชี</CardTitle>
          <CardDescription>จัดการความปลอดภัยและการเข้าถึง</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">เปลี่ยนรหัสผ่าน</p>
                <p className="text-sm text-muted-foreground">อัปเดตรหัสผ่านของคุณ</p>
              </div>
              <Button variant="outline">เปลี่ยนรหัสผ่าน</Button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">การแจ้งเตือน</p>
                <p className="text-sm text-muted-foreground">ตั้งค่าการแจ้งเตือนทางอีเมล</p>
              </div>
              <Button variant="outline">ตั้งค่า</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
