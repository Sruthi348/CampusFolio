import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { uploadImage, uploadDocument } from '../middleware/upload.middleware.js';
import { uploadSingleImage, uploadSingleDocument } from '../controllers/upload.controller.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/image', uploadImage.single('image'), uploadSingleImage);
router.post('/document', uploadDocument.single('document'), uploadSingleDocument);

export default router;
