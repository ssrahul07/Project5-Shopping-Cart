const express = require('express');
const route =require("./route/route.js");
const mongoose  = require('mongoose');

const app = express();

app.use(express.json()); 


mongoose.connect("mongodb+srv://functionup-cohort:Vrvn1212@cluster0.jn5ja3l.mongodb.net/product_management?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


 app.use('/', route);



app.listen(3000, function () {
    console.log('Express app running on port ' + (3000))
});


