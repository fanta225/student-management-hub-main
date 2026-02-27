import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  UserCheck,
  UserCircle,
  LogOut,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: ('admin' | 'teacher' | 'student')[];
}

const navItems: NavItem[] = [
  {
    label: 'แดชบอร์ด',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ['admin', 'teacher', 'student'],
  },
  {
    label: 'จัดการนักศึกษา',
    href: '/students',
    icon: <Users className="h-5 w-5" />,
    roles: ['admin'],
  },
  {
    label: 'จัดการอาจารย์',
    href: '/teachers',
    icon: <GraduationCap className="h-5 w-5" />,
    roles: ['admin'],
  },
  {
    label: 'จัดการรายวิชา',
    href: '/courses',
    icon: <BookOpen className="h-5 w-5" />,
    roles: ['admin'],
  },
  {
    label: 'ลงทะเบียนรายวิชา',
    href: '/enrollments',
    icon: <ClipboardList className="h-5 w-5" />,
    roles: ['admin'],
  },
  {
    label: 'รายวิชาของฉัน',
    href: '/my-courses',
    icon: <BookOpen className="h-5 w-5" />,
    roles: ['teacher', 'student'],
  },
  {
    label: 'เช็คชื่อเข้าเรียน',
    href: '/attendance',
    icon: <UserCheck className="h-5 w-5" />,
    roles: ['student'],
  },
  {
    label: 'เช็คชื่อนักศึกษา',
    href: '/teacher-attendance',
    icon: <UserCheck className="h-5 w-5" />,
    roles: ['teacher'],
  },
  {
    label: 'ประวัติการเข้าเรียน',
    href: '/attendance-history',
    icon: <Calendar className="h-5 w-5" />,
    roles: ['student', 'teacher'],
  },
  {
    label: 'โปรไฟล์',
    href: '/profile',
    icon: <UserCircle className="h-5 w-5" />,
    roles: ['admin', 'teacher', 'student'],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const getRoleLabel = () => {
    switch (user.role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'teacher': return 'อาจารย์';
      case 'student': return 'นักศึกษา';
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground shadow-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">ระบบเช็คชื่อ</h1>
            <p className="text-xs text-sidebar-foreground/60">Attendance System</p>
          </div>
        </div>

        {/* User info */}
        <div className="border-b border-sidebar-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent">
              <UserCircle className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'nav-link',
                location.pathname === item.href && 'active'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={logout}
            className="nav-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
