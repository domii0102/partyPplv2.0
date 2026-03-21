import prisma from '../db.js';
import * as z from 'zod';
import jwt from "jsonwebtoken";
import "dotenv/config";
import cloudinary from 'cloudinary';
import { profileSchema, updateProfileSchema } from '../schemas/profileSchema.js';
import { intoBase64 } from '../config/multerConfig.js';
import { uploadImage, deleteUploadedFiles } from '../config/cloudConfig.js';

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
        where: { nickname: nickname }
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

    const userId = req.user.userId;
    const avatar = req.file || null;
    const result = updateProfileSchema.safeParse(req.body);
    let avatarId;
    let oldAvatarId;
    let updatedProfile;
    let currentProfile;
    let existingNickname;

    if (!result.success) {
        console.log(req.body);
        return res.status(400).json({ success: false, error: z.flattenError(result.error) });
    };

    const { nickname, name, surname, dateOfBirth, deleteAvatar } = result.data;
    console.log(`deleteAvatar: ${deleteAvatar}`);

    try {
        currentProfile = await prisma.userProfile.findFirst({
            where: { userId: userId },
            select: { nickname: true, profileId: true, avatar: true }
        });
        console.log(`currentProfile.avatar: : ${currentProfile.avatar}`);
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
        const changes = await prisma.$transaction(async (tx) => {
            let newAvatar = null;

            if (avatar) {
                console.log("Przyszedł nowy avatar")
                avatarId = await uploadImage(intoBase64(avatar));
                oldAvatarId = currentProfile.avatar.publicId;
                newAvatar = await tx.image.update({
                    where: { imageId: currentProfile.avatar.imageId },
                    data: {
                        publicId: avatarId,
                        url: cloudinary.url(avatarId)
                    }
                });
                console.log("Usuwamy stary avatar, bo przyszedł nowy");
                if (oldAvatarId) {
                    await deleteUploadedFiles([oldAvatarId]);
                }

            }

            if (deleteAvatar === true && currentProfile.avatar && !avatar) {
                console.log("Usuwamy avatar, bo użytkownik tak chciał, ale nie przysłał nowego")
                await tx.image.delete({ where: { imageId: currentProfile.avatar.imageId } });
                await deleteUploadedFiles([oldAvatarId]);
            }

            updatedProfile = await tx.userProfile.update({
                where: { userId: userId },
                data: {
                    nickname: nickname,
                    name: name,
                    surname: surname,
                    dateOfBirth: dateOfBirth
                }
            });

            return { userProfile: updatedProfile, avatar: newAvatar };
        });

        if (avatarId && !changes.avatar) {
            await deleteUploadedFiles([avatarId]);
        }
        const updatedProfileWithAvatar = await prisma.userProfile.findUnique({
            where: { userId: userId },
            include: { avatar: true }
        });
        return res.status(200).json({ success: true, data: updatedProfileWithAvatar });
    } catch (err) {
        console.error(err);
        if (avatarId) {
            await deleteUploadedFiles([avatarId]);
        }

        return res.status(500).json({ success: false, error: "An error occurred while trying to update the profile" });
    }

}