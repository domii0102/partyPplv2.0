import prisma from '../db.js';
import * as z from 'zod';
import jwt from "jsonwebtoken";
import "dotenv/config";

import cloudinary from 'cloudinary';
import { profileSchema } from '../schemas/profileSchema.js';
import { intoBase64 } from '../config/multerConfig.js';
import { uploadImage, deleteUploadedFiles } from '../config/cloudConfig.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;



export async function getCurrentUser(req, res) {
    const userId = req.user.userId;
    let user;

    try {
        user = await prisma.userProfile.findUnique({
            where: { userId: userId },
            include: { avatar: true }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }

    if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: { user } });
}

export async function getUser(req, res) {

    const userId = req.params.id;

    let profile;
    try {
        profile = await prisma.userProfile.findUnique({
            where: { userId: userId },
            include: { avatar: true }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }

    if (!profile) {
        return res.status(404).json({ success: false, error: "Profile not found" });
    }

    return res.status(200).json({ success: true, data: { profile } });
}

export async function createProfile(req, res) {

    const result = profileSchema.safeParse(req.body);
    const userId = req.user.userId;
    const avatar = req.file || null;
    let avatarId = null;


    if (!result.success) {
        return res.status(400).json({ success: false, error: z.flattenError(result.error) });
    };

    const { nickname, name, surname, dateOfBirth } = result.data;


    const accountData = await prisma.userCredentials.findUnique({
        where: { email: email },
        select: { userId: true, emailConfirmed: true, userRole: true }
    });

    if (!accountData) {
        return res.status(404).json({ success: false, error: "Account not found" });
    }

    if (!accountData.emailConfirmed) {
        return res.status(400).json({ success: false, error: "Email is not confirmed" });
    }

    const existingProfile = await prisma.userProfile.findUnique({
        where: { userId: accountData.userId }
    });

    if (existingProfile) {
        return res.status(409).json({ success: false, error: "Profile connected to this user already exists" });
    }

    const existingNickname = await prisma.userProfile.findFirst({
        where: {
            nickname: nickname,
            NOT: { userId: userId }
        }
    });

    if (existingNickname) {
        return res.status(409).json({ success: false, error: "This nickname is taken. Try something else" });
    }


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
    let createdAvatar = null;
    try {
        createdProfile = await prisma.userProfile.create({
            data: newProfile
        });
        if (avatar) {
            try {
                createdAvatar = await prisma.image.create({
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
                return res.status(500).json("A database error has occurred"); //bo niby użytkownik nie musi mieć zdjęcia, 
                // ale skoro chciał przesłać i nie wyszło to powinien dostać błąd 
            }
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "An error occurred while trying to insert the record into the database" });
    };

    //wysłanie tokenu, bo to ostatni etap rejestracji
    const token = jwt.sign(
        { userId: accountData.userId, email: email, userRole: accountData.userRole, emailConfirmed: accountData.emailConfirmed },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",//przy hostowaniu "none"
        secure: false, // zamienić potem na true
    });


    return res.status(201).json({ success: true, data: { profile: createdProfile, avatar: createdAvatar } });



}

export async function updateProfile(req, res) {
    console.log(req.body);

    const userId = req.user.userId;
    const result = profileSchema.safeParse(req.body);
    let updatedProfile;
    let currentProfile;
    let existingNickname;

    

    if (!result.success) {
        console.log(req.body);
        return res.status(400).json({ success: false, error: z.flattenError(result.error) });
    };

    const { nickname, name, surname, dateOfBirth } = result.data;


    try {
        currentProfile = await prisma.userProfile.findFirst({
            where: { userId: userId },
            select: { nickname: true, profileId: true }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }

    if (!currentProfile) {
        return res.status(404).json({ success: false, error: "Profile not found" });
    }

    try {
        existingNickname = await prisma.userProfile.findFirst({
            where: {
                nickname: nickname,
                NOT: { userId: userId }
            }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }


    if (existingNickname) {
        return res.status(409).json({ success: false, error: "This nickname is taken. Try something else" });
    }


    try {
        updatedProfile = await prisma.userProfile.update({
            where: { userId: userId },
            data: {
                nickname: nickname,
                name: name,
                surname: surname,
                dateOfBirth: dateOfBirth
            },
            include: { avatar: true }
        });

        return res.status(200).json({ success: true, data: updatedProfile });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "An error occurred while trying to update the profile" });
    }

}

export async function updateAvatar(req, res) {

    const userId = req.user.userId;
    const avatar = req.file || null;
    let profile;
    let currentAvatar;
    let newAvatar;
    let newAvatarId = null;

    try {
        profile = await prisma.userProfile.findUnique({
            where: { userId: userId },
            select: { profileId: true, avatar: true }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }

    if (!profile) {
        return res.status(404).json({ success: false, error: "Profile not found" });
    }

    currentAvatar = profile.avatar;

    if (!avatar && currentAvatar) {

        try {
            const deletedAvatar = await prisma.image.delete({
                where: { profileId: profile.profileId }
            });

            if (deletedAvatar) {
                await deleteUploadedFiles([currentAvatar.publicId]);
            }

            return res.status(200).json({ success: true, data: null });
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "A database error has occurred" });
        }
    }

    if (avatar) {
        try {

            newAvatarId = await uploadImage(intoBase64(avatar));

            if (!currentAvatar) {
                newAvatar = await prisma.image.create({
                    data: {
                        profileId: profile.profileId,
                        publicId: newAvatarId,
                        url: cloudinary.url(newAvatarId)
                    }
                });

            } else {
                newAvatar = await prisma.image.update({
                    where: { imageId: currentAvatar.imageId },
                    data: {
                        profileId: profile.profileId,
                        publicId: newAvatarId,
                        url: cloudinary.url(newAvatarId)
                    }

                });
            }
            return res.status(200).json({ success: true, data: newAvatar });

        }
        catch (err) {
            console.error(err);
            if (newAvatarId) {
                await deleteUploadedFiles([newAvatarId]);
            }
            return res.status(500).json({ success: false, error: "An error occurred while trying to upload new avatar" });
        }

    }
    return res.status(200).json({ success: true, data: null });
}