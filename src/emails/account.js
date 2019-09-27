 // ANCHOR Adding modules 
 const sgMail = require('@sendgrid/mail')



 // ANCHOR Setting sendgrid api to module
 sgMail.setApiKey(process.env.SENDGRID_API_KEY)

 // ANCHOR Sending a welcome email via sendgrid api
 const sendWelcomeEmail = (email, name) => {
     sgMail.send({
         to: email,
         from: 'SteamBot@support.com',
         subject: 'Welcome!',
         text: `Welcome to the app, ${name}.`
     })
 }

 //ANCHOR Sending a cancel email
 const sendCancelEmail = (email, name) => {
     sgMail.send({
         to: email,
         from: 'SteamBot@support.com',
         subject: 'Good Bye!',
         text: `You are alwayse welcome, ${name} to singup again. Thank you.`
     })
 }

 // ANCHOR Exporting modules
 module.exports = {
     sendWelcomeEmail,
     sendCancelEmail
 }