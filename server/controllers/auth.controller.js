import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../prisma/prismaClient.js';

const loginSchema = z.object({
  email: z.string().email('Please provide a valid college email address.'),
  password: z.string().min(1, 'Password is required.')
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long.')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid college email address.')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long.')
});

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        studentProfile: {
          include: {
            department: true,
            batch: true
          }
        },
        staffProfile: {
          include: {
            department: true,
            batch: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.role === 'STUDENT' && user.studentProfile) {
      if (user.studentProfile.status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact the administrator.'
        });
      }
      if (!user.studentProfile.isApproved) {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending institutional approval.'
        });
      }
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secret,
      { expiresIn }
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isInitialPassword: user.isInitialPassword,
        studentProfile: user.studentProfile ? {
          id: user.studentProfile.id,
          fullName: user.studentProfile.fullName,
          slug: user.studentProfile.slug,
          rollNumber: user.studentProfile.rollNumber,
          department: user.studentProfile.department,
          batch: user.studentProfile.batch,
          photoUrl: user.studentProfile.photoUrl,
          status: user.studentProfile.status
        } : null,
        staffProfile: user.staffProfile ? {
          id: user.staffProfile.id,
          staffId: user.staffProfile.staffId,
          fullName: user.staffProfile.fullName,
          designation: user.staffProfile.designation,
          phone: user.staffProfile.phone,
          department: user.staffProfile.department,
          batch: user.staffProfile.batch
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isInitialPassword: true,
        studentProfile: {
          include: {
            department: true,
            batch: true
          }
        },
        staffProfile: {
          include: {
            department: true,
            batch: true
          }
        }
      }
    });

    return res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        isInitialPassword: false
      }
    });

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      // Return success to prevent email enumeration
      return res.json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been generated.'
      });
    }

    // Invalidate existing tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true }
    });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    console.log(`🔑 [Password Reset] Link for ${user.email}: ${clientUrl}/reset-password?token=${rawToken}`);

    return res.json({
      success: true,
      message: 'Password reset instructions generated.',
      // In development, return the reset token so it can be tested easily in UI
      devResetToken: rawToken
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        used: false,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset link.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: {
          passwordHash: newHash,
          isInitialPassword: false
        }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { used: true }
      })
    ]);

    return res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
}
