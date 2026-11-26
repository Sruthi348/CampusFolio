import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  getStaffOverview,
  getAssignedStudents,
  getStudentDetails,
  getVerificationQueue,
  getVerificationItem,
  recordVerificationDecision,
  getVerificationHistory,
  updateStaffSettings
} from '../controllers/staff.controller.js';

const router = express.Router();

// Strict authorization: all staff routes require authentication and STAFF role
router.use(authenticateToken);
router.use(requireRole('STAFF'));

// Dashboard & Students
router.get('/overview', getStaffOverview);
router.get('/students', getAssignedStudents);
router.get('/students/:id', getStudentDetails);

// Document Verification Queue & History
router.get('/verifications', getVerificationQueue);
router.get('/verifications/:id', getVerificationItem);
router.post('/verifications/:id/decision', recordVerificationDecision);
router.get('/history', getVerificationHistory);

// Account Settings
router.put('/settings', updateStaffSettings);

export default router;
