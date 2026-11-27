import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  getMyProfile,
  updateMyProfile,
  updateVisibility,
  togglePublish,
  addLink,
  updateLink,
  deleteLink,
  syncSkills,
  addEducation,
  updateEducation,
  deleteEducation,
  addProject,
  updateProject,
  deleteProject,
  addCertification,
  updateCertification,
  deleteCertification,
  addExperience,
  updateExperience,
  deleteExperience,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  addExtracurricular,
  updateExtracurricular,
  deleteExtracurricular,
  getMyDocuments,
  submitDocument,
  resubmitDocument,
  deleteDocument
} from '../controllers/student.controller.js';
import { parseResumeUpload, importExtractedData } from '../controllers/resumeExtract.controller.js';
import { uploadResume } from '../middleware/upload.middleware.js';

const router = express.Router();

// All student routes require authentication and STUDENT role
router.use(authenticateToken);
router.use(requireRole('STUDENT'));

// Profile core
router.get('/me', getMyProfile);
router.get('/me/summary', getMyProfile);
router.put('/me/profile', updateMyProfile);
router.put('/me/visibility', updateVisibility);
router.put('/me/publish', togglePublish);

// Repeatable sections
router.post('/me/links', addLink);
router.put('/me/links/:id', updateLink);
router.delete('/me/links/:id', deleteLink);

router.put('/me/skills', syncSkills);

router.post('/me/education', addEducation);
router.put('/me/education/:id', updateEducation);
router.delete('/me/education/:id', deleteEducation);

router.post('/me/projects', addProject);
router.put('/me/projects/:id', updateProject);
router.delete('/me/projects/:id', deleteProject);

router.post('/me/certifications', addCertification);
router.put('/me/certifications/:id', updateCertification);
router.delete('/me/certifications/:id', deleteCertification);

router.post('/me/experience', addExperience);
router.put('/me/experience/:id', updateExperience);
router.delete('/me/experience/:id', deleteExperience);

router.post('/me/achievements', addAchievement);
router.put('/me/achievements/:id', updateAchievement);
router.delete('/me/achievements/:id', deleteAchievement);

router.post('/me/extracurriculars', addExtracurricular);
router.put('/me/extracurriculars/:id', updateExtracurricular);
router.delete('/me/extracurriculars/:id', deleteExtracurricular);

// Document Verification
router.get('/me/documents', getMyDocuments);
router.post('/me/documents', submitDocument);
router.put('/me/documents/:id/resubmit', resubmitDocument);
router.delete('/me/documents/:id', deleteDocument);

// Resume Extract & Import
router.post('/me/resume/extract', uploadResume.single('resume'), parseResumeUpload);
router.post('/me/resume/import', importExtractedData);

export default router;
