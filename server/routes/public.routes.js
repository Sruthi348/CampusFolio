import express from 'express';
import {
  getPublicPortfolio,
  searchPortfolios,
  getFeaturedProjects,
  getFeaturedStudents,
  getPublicMeta,
  getDepartmentsList
} from '../controllers/public.controller.js';

const router = express.Router();

router.get('/students/:username', getPublicPortfolio);
router.get('/search', searchPortfolios);
router.get('/featured-projects', getFeaturedProjects);
router.get('/featured-students', getFeaturedStudents);
router.get('/meta', getPublicMeta);
router.get('/departments', getDepartmentsList);

export default router;
