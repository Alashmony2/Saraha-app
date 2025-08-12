import nodemailer from 'nodemailer';
export async function sendEmail({to, subject, html}) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth:{
                user: "as4679155@gmail.com",
                pass: "gzjexhmfsibkzrhk"
            }
        });
        await transporter.sendMail({
            from: "'Sara7a App'<as4679155@gmail.com>",
            to,
            subject,
            html
        })
    } catch (error) {
        
    }
}