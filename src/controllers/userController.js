// const mongoose = require('mongoose')
const bcrypt = require ('bcrypt')
const saltRound=10
const userModel = require('../models/userModel')
const aws = require('aws-sdk')
const isValid = function(value){
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value == 'string' && value.trim().length === 0) return false
    return true
  }
  const isNotEmpty=function(value){
    if(value.trim().length!=0)
    return true; 
    return false;
}
  const phoneregex = /^([6-9]\d{9})$/
const emailregex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
const passwordregex = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/
const pinregex=       /^\d{6}$/
const streetregex=/^[0-9\\\/# ,a-zA-Z]+[ ,]+[0-9\\\/#, a-zA-Z]{1,}$/


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
        // console.log(data)
        // console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

   
   })
}

const createUser = async function(req, res){

    try{
        let requestbody = req.body
        let requestQuery = req.query
        let files=req.files
        if(files && files.length>0){
          req.profileImage=await uploadFile(files[0])
          console.log(req.profileImage)
        }else
          return res.
            status(400).
              send({status:false,msg:"invalid request"})
        if (Object.keys(requestbody).length == 0)
            return res.
                status(400).
                send({ status: false, message: "Data is required in Request Body" })
        if (Object.keys(requestQuery).length > 0)
            return res.
                status(400).
                send({ status: false, message: "Invalid entry in Request Query" })
    // Destructering

        const {fname,lname,email,password,phone,address} = requestbody
       console.log(requestbody)
      
        // if(Object.keys(rest).length>0 ) return res.status(400).send({status:false,msg:`you cannot fill these(${Object.keys(rest)}) data`})
        if(!isValid(fname)){
            return res.status(400).send({status: false, msg: "first name is required"})}
        if(!isValid(lname)){
            return res.status(400).send({status: false, msg: "last name is required"})}
        if (!isValid(phone))
            return res.status(400).send({ status: false, message: "phone number must be prasent" })
          if (!phone.match(phoneregex))
                return res.status(400).send({ status: false, message: "phone number must be in a valid format" })
            const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone })
          if (isPhoneAlreadyUsed)
              return res.status(400).send({ status: false, message: "phone number already registered" })
        if (!isValid(email))
              return res.status(400).send({ status: false, message: "email is required" })
          if (!email.match(emailregex))
              return res.status(400).send({ status: false, message: "email should be valid" })
          let emailAlreadyUsed = await userModel.findOne({ email: email })
          if (emailAlreadyUsed)
              return res.status(400).send({ status: false, message: "email already registered" })
        if (!isValid(password))
              return res.status(400).send({ status: false, message: "password is required" })
          if (!password.match(passwordregex))
              return res.status(400).send({ status: false, message: "password should be valid" })
         let encryptPassword=await bcrypt.hash(password,saltRound)
          requestbody.password=encryptPassword
       if (!isValid(address)) {
        if (Object.keys(address).length == 0) return res.status(400).send({ status: false, message: "Address must contain shipping,billing address" })
        else {
            const { shipping, billing } = address
            if (!(isValid(shipping) || isValid(billing) )) return res.status(400).send({ status: false, message: "We are looking for sipping,billing value only inside Address Object" })
            else {
                if (address.shipping) {
                    if (Object.keys(shipping).length == 0) return res.status(400).send({ status: false, message: "Address must contain street, city, pincode" })
                    else {
                        const { street, city, pincode } = shipping
                        if (!(isValid(street) || isValid(city) || isValid(pincode))) return res.status(400).send({ status: false, message: "We are looking for street ,city or pincode value only inside Address Object" })
                        else {
                            if (street) {
                                if (!isValid(street)) return res.status(400).send({ status: false, message: "street field is empty" });
                                if (!street.match(streetregex)) return res.status(400).send({ status: false, message: "street is invalid" })
                                address.street = street.trim()
                            } 
                            if (city) {
                                if (!isNotEmpty(city)) return res.status(400).send({ status: false, message: "city field is empty" });
                                if (!city.match(nameregex)) return res.status(400).send({ status: false, message: "city name is not valid" })
                                address.city = city.trim()
                            } if (pincode) {
                                if (!isNotEmpty(pincode)) return res.status(400).send({ status: false, message: "pincode field is empty" });
                                if (!pincode.match(pinregex)) return res.status(400).send({ status: false, message: "pincode must contain only digit with 6 length" })
                                address.pincode = pincode.trim()
                            }
                        }
                    }
                }
                if (address.billing) {
                    if (Object.keys(billing).length == 0) return res.status(400).send({ status: false, message: "Address must contain street, city, pincode" })
                    else {
                        const { street, city, pincode } = billing
                        if (!(isValid(street) || isValid(city) || isValid(pincode))) return res.status(400).send({ status: false, message: "We are looking for street ,city or pincode value only inside Address Object" })
                        else {
                            if (street) {
                                if (!isValid(street)) return res.status(400).send({ status: false, message: "street field is empty" });
                                if (!street.match(streetregex)) return res.status(400).send({ status: false, message: "street is invalid" })
                                address.street = street.trim()
                            } 
                            if (city) {
                                if (!isNotEmpty(city)) return res.status(400).send({ status: false, message: "city field is empty" });
                                if (!city.match(nameregex)) return res.status(400).send({ status: false, message: "city name is not valid" })
                                address.city = city.trim()
                            } if (pincode) {
                                if (!isNotEmpty(pincode)) return res.status(400).send({ status: false, message: "pincode field is empty" });
                                if (!pincode.match(pinregex)) return res.status(400).send({ status: false, message: "pincode must contain only digit with 6 length" })
                                address.pincode = pincode.trim()
                            }
                        }
                    }
                }
            }console.log(billing)
        }
    }
      
        
        let filterData={

            password:encryptPassword,
            profileImage: req.profileImage,
            lname:lname,
            fname:fname,
            address:address,
            phone:phone,
            email:email
            
        }
        console.log(filterData)
        const result = await userModel.create(filterData)
        console.log(result)
       
       return res.
            status(201).
            send({ status: true, message: "user Successfully Created", data: result })

        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
}
module.exports.createUser=createUser

