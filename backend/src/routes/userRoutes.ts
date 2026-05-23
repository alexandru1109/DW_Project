import { Router } from 'express';
import { getUserProfile, updateUserProfile, uploadProfilePicture, profilePictureUpload, getUserProfilePicture } from '../controllers/userController';
import authMiddleware from '../auth/authMiddleware';

const router = Router();

router.get('/profile', authMiddleware, getUserProfile);

router.put('/update', authMiddleware, updateUserProfile);

router.post(
    '/profile/upload-picture',
    authMiddleware,
    profilePictureUpload,
    uploadProfilePicture
);

router.get('/profile-picture', authMiddleware, getUserProfilePicture);
  
export default router;
