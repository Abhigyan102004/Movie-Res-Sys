const {getTransporter} = require('../config/email');
const nodemailer = require('nodemailer');

async function sendTicketEmail(userEmail,movieTitle,showtimeDetails,qrCodeBase64){
    const transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'',
            pass:''
        }
    });

    const htmlContent=`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h1 style="color: #2c3e50; text-align: center;">Your Movie Tickets are Confirmed!</h1>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin-top: 0; color: #e74c3c;">${movieTitle}</h2>
                <p><strong>When:</strong> ${new Date(showtimeDetails.startTime).toLocaleString()}</p>
                <p><strong>Where:</strong> ${showtimeDetails.screen.theatre.name} - ${showtimeDetails.screen.name}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #7f8c8d; margin-bottom: 10px;">Present this QR code at the entrance</p>
                <img src="${qrCodeBase64}" alt="Ticket QR Code" style="width: 200px; height: 200px; border: 2px solid #bdc3c7; border-radius: 10px; padding: 10px;" />
            </div>
            
            <p style="text-align: center; color: #95a5a6; font-size: 12px;">Thank you for choosing our cinema!</p>
        </div>
    `;

    const info=await transporter.sendMail({
        from:' "Cinema Express" <tickets@cinemaexpress.com>',
        to:userEmail,
        subject:`tickets for ${movieTitle}`,
        html:htmlContent
    });

    console.log('ticket email sent');
    console.log('preview url: %s',nodemailer.getTestMessageUrl(info));
}

module.exports={sendTicketEmail};