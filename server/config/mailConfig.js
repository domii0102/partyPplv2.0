import nodemailer from "nodemailer"
import "dotenv/config"

// Konfigurcja SMTP
export const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

try {
    await transporter.verify();
    console.log("SMTP ready");
}
catch (err) {
    console.error(err);
}
