import nodemailer from 'nodemailer';
export async function sendEmail({to, subject, html}) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth:{
                user: "",
                pass: ""
            }
        });
        await transporter.sendMail({
            from: "'Sara7a App'<>",
            to,
            subject,
            html
        })
    } catch (error) {
        
    }
}