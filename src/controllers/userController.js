const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRound = 10
const userModel = require('../models/userModel')
const aws = require('aws-sdk')
const jwt = require("jsonwebtoken")

// --------------------------Validations------------------------------------------------------------
const isValid = function (value) {
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value == 'string' && value.trim().length === 0) return false
  return true
}
const isValidAddress = function (data) {
  if (typeof (data) === "undefined" || data === null) return false;
  if (typeof (data) === "object" && Array.isArray(data) === false && Object.keys(data).length > 0) return true;
  return false;
};


const isValidPincode = function (data) {
  if ((/^[1-9][0-9]{5}$/.test(data))) {
    return true
  }
  return false
}
const isValidOnlyCharacters = function (data) {
  return /^[A-Za-z ]+$/.test(data)
}
const isNotEmpty = function (value) {
  if (value.trim().length != 0)
    return true;
  return false;
}
const phoneregex = /^([6-9]\d{9})$/
const emailregex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
const passwordregex = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/

/* ------------------------------------------------aws config -------------------------------------------------------- */
aws.config.update({
  accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
  secretAccessKey: "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",
  region: "ap-south-1"
});

/* ------------------------------------------------aws fileUpload-------------------------------------------------------- */
let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    let s3 = new aws.S3({ apiVersion: "2006-03-01" });

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",
      Key: "user/" + file.originalname,
      Body: file.buffer,
    };
    s3.upload(uploadParams, function (err, data) {
      if (err) return reject({ error: err });

      return resolve(data.Location);
    });
  });
};


const createUser = async function (req, res) {

  try {
    let requestbody = req.body
    let requestQuery = req.query
    let files = req.files
    let fileUrl = await uploadFile(files[0]);
    requestbody.profileImage = fileUrl;
    if (Object.keys(requestbody).length == 0)
      return res.
        status(400).
        send({ status: false, message: "Data is required in Request Body" })
    if (Object.keys(requestQuery).length > 0)
      return res.
        status(400).
        send({ status: false, message: "Invalid entry in Request Query" })
    // Destructering

    const { fname, lname, email, password, phone, address } = requestbody
    console.log(requestbody)

    // if(Object.keys(rest).length>0 ) return res.status(400).send({status:false,msg:`you cannot fill these(${Object.keys(rest)}) data`})
    if (!isValid(fname)) {
      return res.status(400).send({ status: false, msg: "first name is required" })
    }
    if (!isValid(lname)) {
      return res.status(400).send({ status: false, msg: "last name is required" })
    }
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
    let encryptedPassword = bcrypt
      .hash(requestbody.password, saltRound)
      .then((hash) => {
        console.log(`Hash: ${hash}`);
        return hash;
      });

    requestbody.password = await encryptedPassword;
    //===========================================ADDRESS==============================================
    if (!isValidAddress(address)) {
      return res.status(400).send({ status: false, message: "Address is required!" });
    }
    let arr1 = ["shipping", "billing"];
    let arr2 = ["street", "city", "pincode"];
    for (let i = 0; i < arr1.length; i++) {
      if (!requestbody.address[arr1[i]])
        return res.status(400).send({ status: false, msg: `${arr1[i]} is mandatory` });
      for (let j = 0; j < arr2.length; j++) {
        if (!requestbody.address[arr1[i]][arr2[j]])
          return res.status(400).send({ status: false, msg: `In  ${arr1[i]}, ${arr2[j]} is mandatory` });
      }

      if (!isValidOnlyCharacters(requestbody.address[arr1[i]].city)) {
        return res.status(400).send({
          status: false,
          message: `In ${arr1[i]} , city is invalid`,
        });
      }

      if (!isValidPincode(requestbody.address[arr1[i]].pincode)) {
        return res.status(400).send({
          status: false,
          message: `In ${arr1[i]} , pincode is invalid`,
        });
      }
    }

    const result = await userModel.create(requestbody)
    // console.log(result)
    return res.status(201).send({ status: true, message: "user Successfully Created", data: result })
  }
  catch (err) {
    res.status(500).send({ msg: err })
  }

}

// -------------------------------login--------------------------------
const login = async function (req, res) {
  try {
    if (req.body && Object.keys(req.body).length > 0) {
      let { email, password } = req.body
      if (!isValid(email))
        return res.status(400).send({ status: false, message: "email is required" })
      if (!email.match(emailregex))
        return res.status(400).send({ status: false, message: "email should be valid" })
      if (!isValid(password))
        return res.status(400).send({ status: false, message: "password is required" })
      if (!password.match(passwordregex))
        return res.status(400).send({ status: false, message: "password should be valid" })
      let user = await userModel.findOne({ email: email })
      console.log(user)

      if (!user) return res.status(401).send({ status: false, msg: " No such user exists" })
      const compare = await bcrypt.compare(password, user.password);
      if (!compare) return res.status(200).send({ status: false, msg: "incorrect password" })

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          groupNo: "22"

        }, "secretKeyForgroup22", { expiresIn: "12hr" })
      res.status(200).send({ status: true, message: "User login successfully", data: { userId: user._id, token: token } });

    } else {
      return res.status(400).send({ status: false, msg: "body can't be empty" })
    }

  } catch (error) {
    return res.status(500).send({ status: false, err: error.message })
  }
}


// -------------------------getuserprofile-------------------------
const getUserProfile = async function (req, res) {
  try {
    let userId = req.params.userId
    if (!mongoose.Types.ObjectId.isValid(userId)) { return res.status(400).send({ status: false, message: "userId is not valid" }) }

    const user = await userModel.findOne({ _id: userId })
    if (!user) {
      return res.status(404).send({ send: false, message: "No profile available with this userId" })
    }
    return res.status(200).send({ status: true, message: "User profile details", data: user })
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })

  }
}

// ----------------------update----------------------------------
const updateProfile = async function (req, res) {
  try {
    let requestQuery = req.params["userId"]
    if (!requestQuery)
      return res.status(400).send({ status: false, msg: `please provide ${userId}` })
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).send({ status: false, msg: `please provide valid ${userId}` })
    const userIdIsPresent = await userModel.findById(userId)
    if (!userIdIsPresent) return res.status(400).send({ status: false, msg: `no such user with this ${userId} exist` })
    const requestbody=req.body
    let { fname, lname, email, password, phone, address, profileImage, ...rest } = requestbody
    if (Object.keys(req.body).length == 0)
      return res.status(400).send({ status: false, message: "Data is required in Request Body" })
    // if(Object.keys(rest).length > 0)
    // return res.status(400).send({ status: false, message: "Data is required in Request Body" })
    if (!isValid(fname)) {
      return res.status(400).send({ status: false, msg: "first name is required" })
    }
    if (!isValid(lname)) {
      return res.status(400).send({ status: false, msg: "last name is required" })
    }
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
    let encryptedPassword = bcrypt
      .hash(requestbody.password, saltRound)
      .then((hash) => {
        console.log(`Hash: ${hash}`);
        return hash;
      });

    requestbody.password = await encryptedPassword;
    //===========================================ADDRESS==============================================
    if (!isValidAddress(address)) {
      return res.status(400).send({ status: false, message: "Address is required!" });
    }
    let arr1 = ["shipping", "billing"];
    let arr2 = ["street", "city", "pincode"];
    for (let i = 0; i < arr1.length; i++) {
      if (!requestbody.address[arr1[i]])
        return res.status(400).send({ status: false, msg: `${arr1[i]} is mandatory` });
      for (let j = 0; j < arr2.length; j++) {
        if (!requestbody.address[arr1[i]][arr2[j]])
          return res.status(400).send({ status: false, msg: `In  ${arr1[i]}, ${arr2[j]} is mandatory` });
      }

      if (!isValidOnlyCharacters(requestbody.address[arr1[i]].city)) {
        return res.status(400).send({
          status: false,
          message: `In ${arr1[i]} , city is invalid`,
        });
      }

      if (!isValidPincode(requestbody.address[arr1[i]].pincode)) {
        return res.status(400).send({
          status: false,
          message: `In ${arr1[i]} , pincode is invalid`,
        });
      }
    }
     const updates={
      fname:fname,
      lname:lname,
      email:email,
      profileImage:profileImage,
      phone:phone,
      password:password,
      address:address
     }
    
    const updatedUser=await userModel.findByIdAndUpdate({_id:userId},{$set:{...updates}},{new:true})
    return res.status(200).send({status:true,msg:"data updated successfully",data:updatedUser})



  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })

  }

}
module.exports = { createUser, login, getUserProfile, updateProfile }
