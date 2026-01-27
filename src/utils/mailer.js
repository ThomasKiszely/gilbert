const nodemailer = require('nodemailer');
const { isProduction } = require('../utils/isProduction')

let transporterPromise = null;

async function getTransporter() {
    if (transporterPromise) {
        return transporterPromise;
    }

    // Production → Gmail
    if (isProduction()) {
        transporterPromise = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            }
        });
        return transporterPromise;
    }

    // Development → Fake mailer
    transporterPromise = {
        sendMail: async ({ to, subject, html }) => {
            console.log("FAKE MAIL SENDT");
            console.log("Modtager:", to);
            console.log("Emne:", subject);
            console.log("Indhold:", html);
            console.log("-----------------------------");
            return { messageId: "fake-" + Date.now() };
        }
    };

    return transporterPromise;
}

async function send({ to, subject, html }) {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
        from: '"Gilbert" <no-reply@gilbert.local>',
        to,
        subject,
        html
    });

    return info;
}

module.exports = { send };
