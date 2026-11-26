import { ZodError } from 'zod';
import multer from 'multer';

export function errorHandler(err, req, res, next) {
  console.error('Error encountered:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: formattedErrors
    });
  }

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size limit exceeded. Images must be under 2MB, documents under 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  // Custom upload filter errors
  if (err.message && (err.message.includes('Invalid image format') || err.message.includes('Invalid file format'))) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Prisma unique constraint errors (P2002)
  if (err.code === 'P2002') {
    const fields = err.meta?.target || 'unique field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${Array.isArray(fields) ? fields.join(', ') : fields} already exists.`
    });
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'The requested resource was not found.'
    });
  }

  // Default internal server error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
}
