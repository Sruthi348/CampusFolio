export async function uploadSingleImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const fileUrl = `/uploads/images/${req.file.filename}`;
    return res.json({
      success: true,
      message: 'Image uploaded successfully.',
      fileUrl,
      fileName: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadSingleDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document file uploaded.' });
    }

    const subDir = req.file.mimetype === 'application/pdf' ? 'documents' : 'images';
    const fileUrl = `/uploads/${subDir}/${req.file.filename}`;

    return res.json({
      success: true,
      message: 'Document uploaded successfully.',
      fileUrl,
      fileName: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    next(error);
  }
}
