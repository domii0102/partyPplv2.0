import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as z from "zod";
import "dotenv/config";
import prisma from "../db.js";
import { credentialsSchema } from "../schemas/credentialsSchema.js";


const JWT_SECRET = process.env.JWT_SECRET;


export async function register(req, res) {
    const result = credentialsSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error),
        });
    }

    const { email, password } = result.data;

    try {
        const existingUser = await prisma.userCredentials.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: "User with such email already exists",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.userCredentials.create({
            data: {
                email: email,
                emailConfirmed: false,
                emailConfirmationToken: null,
                passwordHash: passwordHash,
                userRole: "User",
                createdAt: new Date()
            },
        });

        const token = jwt.sign(
            { userId: newUser.userId, email, userRole: "User", emailConfirmed: newUser.emailConfirmed },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });

        return res.status(200).json({
            success: true,
            userId: newUser.userId,
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({
            success: false,
            error: "Database error occurred",
        });
    }
}





export async function login(req, res) {
    const result = credentialsSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error),
        });
    }

    const { email, password } = result.data;

    try {
        const user = await prisma.userCredentials.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password",
            });
        }

        if (user.isDeleted) {
            return res.status(403).json({
                success: false,
                error: "Account has been removed",
            });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                userId: user.userId,
                email: user.email,
                userRole: user.userRole,
                emailConfirmed: user.emailConfirmed 
            },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24,
        });

        return res.status(200).json({ success: true, token: token }); //token zwracany na potrzeby testów, potem usunąć
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            error: "Login failed",
        });
    }
}


export async function logout(req, res) {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            path: "/",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out",
        });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
            success: false,
            error: "Logout failed",
        });
    }
}

export async function deleteCredentials(req, res) {
    const { userId } = req.params;

    try {
        const user = await prisma.userCredentials.findUnique({
            where: { userId },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Credentials not found",
            });
        }

        await prisma.userCredentials.delete({
            where: { userId },
        });

        return res.status(204).send();
    } catch (err) {
        console.error("Delete credentials error:", err);
        return res.status(500).json({
            success: false,
            error: "Failed to delete credentials",
        });
    }
}