 // ANCHOR Adding modules 
 const mongoose = require('mongoose')

 // ANCHOR Connecting DataBase to Server  
 mongoose.connect(process.env.MONGODB_URL, {
     useNewUrlParser: true,
     useCreateIndex: true
 }).then(console.log('mongodb connected...')).catch(e => (console.log(e)))