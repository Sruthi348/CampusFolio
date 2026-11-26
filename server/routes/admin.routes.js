import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { uploadCSV } from '../middleware/upload.middleware.js';
import {
  getStudents,
  addStudent,
  importStudentsFromCSV,
  updateStudentStatus,
  batchStatusUpdate,
  getModerationQueue,
  moderateCertification,
  moderateAchievement,
  getAdminProjects,
  toggleProjectFeatured,
  getAdminDepartments,
  addDepartment,
  addBatch,
  getAdminReports,
  getAuditLogs,
  exportStudentsCSV,
  getStaffList,
  addStaff,
  updateStaff,
  assignStudentsToStaff,
  removeStaffAssignment,
  getAccountsAndCredentials,
  resetUserCredential,
  getVerificationLogs
} from '../controllers/admin.controller.js';

const router = express.Router();

// Strict authorization: all admin routes require authentication and ADMIN role
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// Students
router.get('/students', getStudents);
router.post('/students', addStudent);
router.post('/students/import', uploadCSV.single('file'), importStudentsFromCSV);
router.get('/students/export', exportStudentsCSV);
router.patch('/students/:id/status', updateStudentStatus);

// Batches & Departments
router.post('/batches/:id/archive-or-graduate', batchStatusUpdate);
router.get('/departments', getAdminDepartments);
router.post('/departments', addDepartment);
router.post('/batches', addBatch);

// Staff Management
router.get('/staff', getStaffList);
router.post('/staff', addStaff);
router.patch('/staff/:id', updateStaff);
router.post('/staff/:id/assign', assignStudentsToStaff);
router.delete('/staff/:id/assign/:studentId', removeStaffAssignment);

// Accounts & Credentials Management
router.get('/credentials', getAccountsAndCredentials);
router.post('/credentials/reset', resetUserCredential);

// Centralized Verification Logs
router.get('/verification-logs', getVerificationLogs);

// Moderation
router.get('/moderation', getModerationQueue);
router.patch('/moderation/certification/:id', moderateCertification);
router.patch('/moderation/achievement/:id', moderateAchievement);

// Projects
router.get('/projects', getAdminProjects);
router.patch('/projects/:id/feature', toggleProjectFeatured);

// Reports & Audit Logs
router.get('/reports', getAdminReports);
router.get('/audit-log', getAuditLogs);

export default router;
