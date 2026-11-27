import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Departments } from './pages/Departments';
import { Projects } from './pages/Projects';
import { StudentPortfolio } from './pages/StudentPortfolio';
import { Login } from './pages/Login';
import { VisitorLogin } from './pages/VisitorLogin';
import { ForgotPassword } from './pages/ForgotPassword';
import { Privacy } from './pages/Privacy';

// Student Layout & Pages
import { StudentLayout } from './components/layout/StudentLayout';
import { Dashboard } from './pages/student/Dashboard';
import { ProfileEdit } from './pages/student/ProfileEdit';
import { EducationEdit } from './pages/student/EducationEdit';
import { SkillsEdit } from './pages/student/SkillsEdit';
import { ProjectsEdit } from './pages/student/ProjectsEdit';
import { CertificationsEdit } from './pages/student/CertificationsEdit';
import { ResumeExtract } from './pages/student/ResumeExtract';
import { ExperienceEdit } from './pages/student/ExperienceEdit';
import { AchievementsEdit } from './pages/student/AchievementsEdit';
import { ExtracurricularsEdit } from './pages/student/ExtracurricularsEdit';
import { LinksEdit } from './pages/student/LinksEdit';
import { Settings } from './pages/student/Settings';
import { DocumentVerification } from './pages/student/DocumentVerification';

// Staff Layout & Pages
import { StaffLayout } from './components/layout/StaffLayout';
import { StaffOverview } from './pages/staff/StaffOverview';
import { StaffStudents } from './pages/staff/StaffStudents';
import { StaffStudentView } from './pages/staff/StaffStudentView';
import { StaffVerifications } from './pages/staff/StaffVerifications';
import { StaffHistory } from './pages/staff/StaffHistory';
import { StaffSettings } from './pages/staff/StaffSettings';

// Admin Layout & Pages
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminAddStudent } from './pages/admin/AdminAddStudent';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminCredentials } from './pages/admin/AdminCredentials';
import { AdminVerificationLogs } from './pages/admin/AdminVerificationLogs';
import { AdminModeration } from './pages/admin/AdminModeration';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAuditLog } from './pages/admin/AdminAuditLog';
import { AdminSettings } from './pages/admin/AdminSettings';

export function App() {
  const location = useLocation();
  const isPortalOrAuth = 
    location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/staff') || 
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/visitor-login') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password');

  const isHome = location.pathname === '/';
  const showNavAndFooter = !isPortalOrAuth && !isHome;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] text-[#0F172A]">
      {showNavAndFooter && <Navbar />}

      <div className="flex-1 flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/student/:username" element={<StudentPortfolio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/visitor-login" element={<VisitorLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Student Dashboard Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<ProfileEdit />} />
            <Route path="education" element={<EducationEdit />} />
            <Route path="skills" element={<SkillsEdit />} />
            <Route path="projects" element={<ProjectsEdit />} />
            <Route path="certifications" element={<CertificationsEdit />} />
            <Route path="resume-extract" element={<ResumeExtract />} />
            <Route path="verification" element={<DocumentVerification />} />
            <Route path="experience" element={<ExperienceEdit />} />
            <Route path="achievements" element={<AchievementsEdit />} />
            <Route path="extracurriculars" element={<ExtracurricularsEdit />} />
            <Route path="links" element={<LinksEdit />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Staff Protected Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['STAFF']}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffOverview />} />
            <Route path="students" element={<StaffStudents />} />
            <Route path="students/:id" element={<StaffStudentView />} />
            <Route path="verifications/pending" element={<StaffVerifications defaultStatus="PENDING" />} />
            <Route path="verifications/verified" element={<StaffVerifications defaultStatus="VERIFIED" />} />
            <Route path="verifications/rejected" element={<StaffVerifications defaultStatus="REJECTED" />} />
            <Route path="verifications" element={<StaffVerifications defaultStatus="all" />} />
            <Route path="history" element={<StaffHistory />} />
            <Route path="settings" element={<StaffSettings />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="add-student" element={<AdminAddStudent />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="credentials" element={<AdminCredentials />} />
            <Route path="verification-logs" element={<AdminVerificationLogs />} />
            <Route path="moderation" element={<AdminModeration />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="audit-logs" element={<AdminAuditLog />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {showNavAndFooter && <Footer />}
    </div>
  );
}
