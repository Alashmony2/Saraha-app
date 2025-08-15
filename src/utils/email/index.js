import nodemailer from 'nodemailer';
export async function sendEmail({to, subject, html}) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: `'Sara7a App'<${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        })
    } catch (error) {
        
    }
}