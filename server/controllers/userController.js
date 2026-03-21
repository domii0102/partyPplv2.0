import prisma from '../db.js';
import * as z from 'zod';
import cloudinary from 'cloudinary';
import { profileSchema } from '../schemas/profileSchema.js';
import { intoBase64 } from '../config/multerConfig.js';
import { uploadImage, deleteUploadedFiles } from '../config/cloudConfig.js';




export async function getCurrentUser(req, res) {
    const userId = req.user.userId;

    const user = await prisma.userProfile.findUnique({
        where: { userId: userId }
    });

    if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
        success: true,
        data: { user }
    });
}

export async function createProfile(req, res) {

    const result = profileSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ success: false, error: z.flattenError(result.error) });
    };

    const { email, nickname, name, surname, dateOfBirth } = result.data;

    const accountData = await prisma.userCredentials.findUnique({
        where: {email: email},
        select: {userId: true, emailConfirmed: true, userRole: true}
    });

    if (!accountData) {
        return res.status(404).json({success: false, error: "Account not found"});
    }

    if (!accountData.emailConfirmed) {
        return res.status(400).json({success: false, error: "Email is not confirmed"});
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


    return res.status(201).json({ success: true, data: {profile: createdProfile, avatar: createdAvatar }});


}