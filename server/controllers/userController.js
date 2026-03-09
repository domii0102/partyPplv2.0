import prisma from '../db.js';
import * as z from 'zod';
import { profileSchema } from '../schemas/profileSchema.js';
import { intoBase64 } from '../multerConfig.js';
import { uploadImage, deleteUploadedFiles } from '../cloudConfig.js';

function calculateAge(birthDate) {

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  if (today.getMonth() < birthDate.getMonth()) {
    age -= 1;
  }

  if (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) {
    age -= 1;
  }

  return age;
};

export async function createProfile(req, res) {

    const userId = req.user.userId;

    const result = profileSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ success: false, error: z.flattenError(result.error) });
    };

    const { nickname, name, surname, dateOfBirth } = result.data;


    const existingProfile = await prisma.userProfile.findUnique({
        where: { userId: userId }
    });

    if (existingProfile) {
        return res.status(409).json({ success: false, error: "Profile connected to this user already exists" });
    }

    if (calculateAge(dateOfBirth)<18) {
        return res.status(400).json({success: false, error: "User must be at least 18 years old"});
    }

    const avatar = req.file || null;
    let avatarId = null;

    if (avatar) {
        try {
            avatarId = await uploadImage(intoBase64(avatar));
        }
        catch (err) {
            console.error(err);
        }
    }

    const newProfile = {
                userId: userId,
                nickname: nickname,
                name: name,
                surname: surname,
                dateOfBirth: dateOfBirth,
                avatarId: avatarId
            };

    try {
        await prisma.userProfile.create({
            data: newProfile
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({success: false, error: "An error occurred while trying to insert the record into the database"});
    };

    return res.status(201).json({success: true, newProfile: newProfile});


}