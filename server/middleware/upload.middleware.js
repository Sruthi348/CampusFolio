import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const baseUploadDir = path.resolve('uploads');

// Ensure base upload directories exist
['images', 'documents', 'csv'].forEach(subDir => {
  const dirPath = path.join(baseUploadDir, subDir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, path.join(baseUploadDir, 'images'));
    } else if (file.mimetype === 'application/pdf') {
      cb(null, path.join(baseUploadDir, 'documents'));
    } else if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, path.join(baseUploadDir, 'csv'));
    } else {
      cb(null, baseUploadDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Image upload filter (Max 2MB, JPG, PNG, WebP)
export const uploadImage = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPG, PNG, and WebP images up to 2MB are permitted.'), false);
    }
  }
});

// Document / Certificate upload filter (Max 5MB, PDF, JPG, PNG, WebP)
export const uploadDocument = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF, JPG, PNG, and WebP files up to 5MB are permitted.'), false);
    }
  }
});

// CSV file upload filter (Max 5MB)
export const uploadCSV = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isCsvMime = ['text/csv', 'application/vnd.ms-excel', 'text/plain'].includes(file.mimetype);
    const isCsvExt = path.extname(file.originalname).toLowerCase() === '.csv';

    if (isCsvMime || isCsvExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Please upload a valid .csv file.'), false);
    }
  }
});

// Resume file upload filter (Max 10MB, PDF, DOCX in memory)
const memoryStorage = multer.memoryStorage();
export const uploadResume = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const allowedExts = ['.pdf', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid resume format. Only PDF (.pdf) and Word (.docx) files up to 10MB are permitted.'), false);
    }
  }
});
