const express = require('express');
const route = express.Router();
const userController=require("../controllers/userController")
const productController = require("../controllers/productController")
const middleware = require("../middleware/auth")

// ------------------register-------------------
route.post("/register",userController.createUser)

// ----------------------login------------------
route.post("/login" , userController.login)

// ------------------getUserProfile-------------
route.get("/user/:userId/profile" , middleware.Authenticate ,userController.getUserProfile)


// ---------------updateUserProfile--------------
route.put("/user/:userId/profile" ,middleware.Authenticate , middleware.Authorization , userController.updateProfile)

route.post("/products",productController.createProduct)

// -------------------getProductById--------------------
route.get("/products/:productId" ,productController.ProductById )

// --------------------deleteProduct-----------------------
route.delete("/products/:productId" ,productController.deleteProduct)


route.all("/*", function (req, res) {
    res.status(400).send({status: false,message: "The api you request is not available"})
})
module.exports = route;