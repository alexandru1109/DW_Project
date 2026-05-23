import { Request, Response } from 'express';
import User from '../models/userModel';
import bcrypt from 'bcryptjs';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); 
  },
});

const upload = multer({ storage });

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, strategy, profilePicture } = req.body;

    const user = await User.findById((req as any).user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.strategy = strategy || user.strategy;
    user.profilePicture = profilePicture || user.profilePicture;

    if (password) {
      user.passHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile', error });
  }
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    console.log("Uploaded file:", req.file); 
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById((req as any).user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = `/uploads/${req.file.filename}`; 
    await user.save();

    res.json({ message: 'Profile picture updated', profilePicture: user.profilePicture });
  } catch (error) {
    console.error("Error in uploadProfilePicture:", error); 
    res.status(500).json({ message: 'Error uploading profile picture', error });
  }
};

export const profilePictureUpload = (req: Request, res: Response, next: Function) => {
  upload.single('profilePicture')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Multer Error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ message: `Upload Error: ${err.message}` });
    }
    next();
  });
};

export const getUserProfilePicture = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ profilePicture: user.profilePicture });
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    res.status(500).json({ message: 'Error fetching profile picture', error });
  }
};
