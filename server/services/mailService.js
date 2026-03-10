import { transporter } from "../config/mailConfig.js";

export async function sendEmail(to, subject, content) {
    const info = await transporter.sendMail({
        from: `"PartyPpl" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: content
    })
    console.log("Message sent: ", info.messageId);
}

//dodac opcje gotowe do resetu hasla i weryfikacji maila zeby przy wywolaniu funckji mozna bylo podac tylko verify lub reset i reszta dziala sie tutaj