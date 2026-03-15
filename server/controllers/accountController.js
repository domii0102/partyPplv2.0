import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as z from "zod";
import "dotenv/config";
import prisma from "../db.js";
import { credentialsSchema } from "../schemas/credentialsSchema.js";
import { emailVerificationSchema, emailVerificationResendSchema, passwordChangeSchema } from "../schemas/emailVerificationSchema.js";
import { sendEmail } from "../services/mailService.js";
import { randomInt } from "crypto";
import { error } from "console";
import { userRoleOptions } from "../enums.js";


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

        const verifyToken = randomInt(100000, 1000000).toString();
        const verifyTokenHash = await bcrypt.hash(verifyToken, 10);

        const newUser = await prisma.userCredentials.create({
            data: {
                email: email,
                emailConfirmed: false, // vvv
                emailConfirmationToken: verifyTokenHash,
                passwordHash: passwordHash,
                userRole: userRoleOptions.USER, // vvv
                createdAt: new Date() //Czy tych rzeczy nie mozna skipnc skoro sa ustawione defaulty w schemacie?
            },
        });

        const token = jwt.sign(
            { userId: newUser.userId, email, userRole: userRoleOptions.USER, emailConfirmed: newUser.emailConfirmed },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });

        // Adresat, typ maila, token
        await sendEmail(email, "verify", verifyToken);

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

        if (!user.emailConfirmed) { //Front powinien wtedy odsylac do weryfikacji maila (chyba)
            return res.status(403).json({
                success: false,
                error: "Email not verified"
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


export async function verifyEmail(req, res) {
    const result = emailVerificationSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { email, token } = result.data;

    try {
        const existingUser = await prisma.userCredentials.findUnique({
            where: { email }
        });

        if (existingUser.emailConfirmed) {
            return res.status(409).json({
                success: false,
                error: "User with such email is already verified"
            });
        }

        if (!existingUser.emailConfirmationToken) {
            return res.status(400).json({
                success: false,
                error: "No token to verify"
            });
        }

        if (existingUser.isDeleted) {
            return res.status(403).json({
                success: false,
                error: "Account has been removed"
            });
        }

        const valid = await bcrypt.compare(token, existingUser.emailConfirmationToken);

        if (!valid) {
            return res.status(401).json({
                success: false,
                error: "Invalid token"
            });
        }

        await prisma.userCredentials.update({
            where: { email },
            data: {
                emailConfirmed: true,
                emailConfirmationToken: null
            }
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Email verification error:", err);
        return res.status(500).json({
            success: false,
            error: "Email verification failed"
        });
    }
}


export async function resendVerificationCode(req, res) {
    const result = emailVerificationResendSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error),
        });
    }

    const { email } = result.data;

    try {
        const existingUser = await prisma.userCredentials.findUnique({
            where: { email },
        });

        if (!existingUser) {
            return res.status(401).json({
                success: false,
                error: "Invalid email",
            });
        }

        if (existingUser.isDeleted) {
            return res.status(403).json({
                success: false,
                error: "Account has been removed",
            });
        }

        // Nie wiem czy potrzebujemy tutaj sprawdzac weryfikacje maila, bo to ma byc uniersalny endpoint do resetu hasla i weryfikacji po logowaniu

        const verifyToken = randomInt(100000, 1000000).toString();
        const verifyTokenHash = await bcrypt.hash(verifyToken, 10);

        await prisma.userCredentials.update({
            where: { email },
            data: {
                emailConfirmationToken: verifyTokenHash
            }
        });

        // Adresat, typ maila, token
        await sendEmail(email, "verify", verifyToken);

        return res.status(200).json({
            success: true
        });
    } catch (err) {
        console.error("Verification error:", err);
        return res.status(500).json({
            success: false,
            error: "Verification failed",
        });
    }
}

// Jezeli robimy sprawdzanie tokenu + reset razem na jednej stronie to te dwa endpointy trzeba polaczyc
export async function requestPasswordReset(req, res) {
    const result = emailVerificationSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { email, token } = result.data;

    try {
        const existingUser = await prisma.userCredentials.findUnique({
            where: { email }
        });

        if (!existingUser.emailConfirmed) {
            return res.status(409).json({
                success: false,
                error: "User with such email is not yet verified"
            });
        }

        if (!existingUser.emailConfirmationToken) {
            return res.status(400).json({
                success: false,
                error: "No token to verify"
            });
        }

        if (existingUser.isDeleted) {
            return res.status(403).json({
                success: false,
                error: "Account has been removed"
            });
        }

        const valid = await bcrypt.compare(token, existingUser.emailConfirmationToken);

        if (!valid) {
            return res.status(401).json({
                success: false,
                error: "Invalid token"
            });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Code verification error:", err);
        return res.status(500).json({
            success: false,
            error: "Code verification failed"
        });
    }
}


export async function resetPassword(req, res) {
    const result = passwordChangeSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { email, token, password } = result.data;

    try {
        const existingUser = await prisma.userCredentials.findUnique({
            where: { email }
        });

        if (!existingUser.emailConfirmed) {
            return res.status(409).json({
                success: false,
                error: "User with such email is not yet verified"
            });
        }

        if (!existingUser.emailConfirmationToken) {
            return res.status(400).json({
                success: false,
                error: "No token to verify"
            });
        }

        if (existingUser.isDeleted) {
            return res.status(403).json({
                success: false,
                error: "Account has been removed"
            });
        }

        // Double check, musze poszukac jak sie robi weryfikacje tak juz profesjonalnie sensownie
        const valid = await bcrypt.compare(token, existingUser.emailConfirmationToken);

        if (!valid) {
            return res.status(401).json({
                success: false,
                error: "Invalid token"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.userCredentials.update({
            where: { email },
            data: {
                passwordHash: passwordHash
            }
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Code verification error:", err);
        return res.status(500).json({
            success: false,
            error: "Code verification failed"
        });
    }
}