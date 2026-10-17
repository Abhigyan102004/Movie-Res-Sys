const nodemailer = require('nodemailer');

let transporter;

async function initTransporter(){
    const testAcc = await nodemailer.createTestAccount();

    transporter=nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port:587,
        secure:false,
        auth:{
            user:testAcc.user,
            pass:testAcc.pass,
        },
    });

    console.log(`ethereal email initialized: ${testAcc.user}`);
}

initTransporter().catch(console.error);

function getTransporter(){
    if(!transporter) throw new Error('Transporter not initialized yet');
    return transporter;
}

module.exports = {getTransporter};