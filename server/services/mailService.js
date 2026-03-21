import { transporter } from "../config/mailConfig.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Tablica do wyboru templte'a i tytulu maila
const EMAIL_TYPES = {
    verify: {
        subject: "Weryfikacja adresu e-mail! PartyPpl2.0",
        template: "verifyEmail.html"
    },
    reset: {
        subject: "Resetowanie hasła! PartyPpl2.0",
        template: "resetPassword.html"
    }
};

export async function sendEmail(to, type, token) {
    try {
        const config = EMAIL_TYPES[type];
        if (!config) throw new Error("Wybrana zła opcja wysłania maila!");

        // Znalezienie ścieżki odpoiedniego motywu maila + dodanie tokenu w odpowiednie miejsce
        const PATH = path.join(__dirname, config.template);
        let content = fs.readFileSync(PATH, "utf-8");
        content = content.replace("{{676767}}", token);

        const info = await transporter.sendMail({
        from: `"PartyPpl" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: config.subject,
        html: content
    })
    console.log("Message sent: ", info.messageId);
    return info;
    } catch (error) {
        console.error("Nastąpił błąd podczas wysyłania maila:", error);
        throw error;
    }
}