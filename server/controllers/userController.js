import prisma from '../db.js';
import * as z from 'zod';
import cloudinary from 'cloudinary';
import { profileSchema } from '../schemas/profileSchema.js';
import { intoBase64 } from '../config/multerConfig.js';
import { uploadImage, deleteUploadedFiles } from '../config/cloudConfig.js';






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

    const existingNickname = await prisma.userProfile.findFirst({
        where: {nickname: nickname}
    });

    if (existingNickname){
        return res.status(409).json({ success: false, error: "This nickname is taken. Try something else" });
    }

    const avatar = req.file || null;
    let avatarId = null;


    if (avatar) {
        try {
            avatarId = await uploadImage(intoBase64(avatar));
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "An error occurred while trying to upload avatar into the cloud" });
        }
    }

    const newProfile = {
        userId: userId,
        nickname: nickname,
        name: name,
        surname: surname,
        dateOfBirth: dateOfBirth,
    };

    let createdProfile;
    try {
        createdProfile = await prisma.userProfile.create({
            data: newProfile
        });
        if (avatar) {
            try {
                await prisma.image.create({
                    data: {
                        profileId: createdProfile.profileId,
                        publicId: avatarId,
                        url: cloudinary.url(avatarId)
                }
                });
            }
            catch (err) {
                console.error(err);
                await deleteUploadedFiles([avatarId]);
                
            }
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "An error occurred while trying to insert the record into the database" });
    };

    return res.status(201).json({ success: true, newProfile: createdProfile });


}