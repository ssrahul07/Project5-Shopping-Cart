const express = require('express');
const route = express.Router();
const userController=require("../controllers/userController")
route.post("/register",userController.createUser)

route.all("/*", function (req, res) {
    res.status(400).send({status: false,message: "The api you request is not available"})
})
module.exports = route;