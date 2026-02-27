import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyCourses from "./pages/MyCourses";
import AttendanceHistory from "./pages/AttendanceHistory";
import NotFound from "./pages/NotFound";

// Admin Pages
import StudentManagement from "./pages/admin/StudentManagement";
import TeacherManagement from "./pages/admin/TeacherManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import EnrollmentManagement from "./pages/admin/EnrollmentManagement";

// Student Pages
import StudentAttendance from "./pages/student/StudentAttendance";

// Teacher Pages
import TeacherAttendance from "./pages/teacher/TeacherAttendance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
            <Route path="/my-courses" element={<MainLayout><MyCourses /></MainLayout>} />
            <Route path="/attendance-history" element={<MainLayout><AttendanceHistory /></MainLayout>} />
            
            {/* Admin Routes */}
            <Route path="/students" element={<MainLayout><StudentManagement /></MainLayout>} />
            <Route path="/teachers" element={<MainLayout><TeacherManagement /></MainLayout>} />
            <Route path="/courses" element={<MainLayout><CourseManagement /></MainLayout>} />
            <Route path="/enrollments" element={<MainLayout><EnrollmentManagement /></MainLayout>} />
            
            {/* Student Routes */}
            <Route path="/attendance" element={<MainLayout><StudentAttendance /></MainLayout>} />
            
            {/* Teacher Routes */}
            <Route path="/teacher-attendance" element={<MainLayout><TeacherAttendance /></MainLayout>} />
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
