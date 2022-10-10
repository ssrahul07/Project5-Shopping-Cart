const mongoose = require('mongoose')
const bcrypt = require ('bcrypt')
const saltRound=10
const userModel = require('../models/userModel')
const aws = require('aws-sdk')


aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

   })
}

const createUser = async function(req, res){

    try{
        let files= req.files
        let {fname,lname,email,profileImage,password,phone,address,...rest}=req.body
       if(Object.keys(rest).length>0 ) return res.status(400).send({status:false,msg:`you cannot fill these(${Object.keys(rest)}) data`})
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            // bcrypt.hash bcrypt.compare(password,encryptpassword)
            let encryptPassword=await bcrypt.hash(password,saltRound)
            body.password=encryptPassword
            let uploadedFileURL= await uploadFile( files[0] )
            let createData=await userModel.create(files)
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
}
module.exports.createUser=createUser

