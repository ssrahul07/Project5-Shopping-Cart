const mongoose = require("mongoose")
const userModel=require("../models/userModel")
const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")

// const isValidInputBody = function (object) {
//     return Object.keys(object).length > 0
// }


// const isValidInputValue = function (value) {
//     if (typeof (value) === 'undefined' || value === null) return false
//     if (typeof (value) === 'string' && value.trim().length > 0) return true
//     return false
// }

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};



const createCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const { cartId, productId } = req.body
        //-------------------------------------checking user------------------------------------------//
        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) }
        const checkUser = await userModel.findById(userId)
        if (checkUser == null || checkUser.isDeleted == true) {
            return res.status(404).send({ status: false, message: "user not found or it may be deleted" })
        }
        //-------------------------------------checking product------------------------------------------//
        if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Please provide a valid productId." }) }
        const checkProduct = await productModel.findById(productId)
        if (checkProduct == null || checkProduct.isDeleted == true) {
            return res.status(404).send({ status: false, message: "Product not found or it may be deleted" })
        }
        //-------------------------------------------------------------------------------------------//
        let itemForAdd = {
            "productId": productId,
            "quantity": 1
        }

        if (cartId) {
            //-------------------------------------checking cart------------------------------------------//
            if (!isValidObjectId(cartId)) { return res.status(400).send({ status: false, message: "Please provide a valid cartId." }) }
            const checkCart = await cartModel.findById(cartId)
            if (checkCart == null || checkCart.isDeleted == true) {
                return res.status(404).send({ status: false, message: "cart not found or it may be deleted" })
            }
            //-------------------------------------------------------------------------------------------//
            let arr = checkCart.items
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId == itemForAdd.productId) {
                    arr[i].quantity = arr[i].quantity + itemForAdd.quantity;
                    break
                }
                else if (i == (arr.length - 1)) {
                    arr.push(itemForAdd)
                    break
                }
            }
            // product image
            const dataForUpdate = {
                "userId": userId,
                "items": arr,
                "totalPrice": checkProduct.price + checkCart.totalPrice,
                "totalItems": arr.length///confuse in:when quantity of product is 2 at that time what should be totalItems
            }
            const updateCard = await cartModel.findByIdAndUpdate(
                { "_id": cartId },
                { $set: dataForUpdate }, 
                { new: true }
            ).populate("items.productId",("price title description productImage availableSizes"))
            return res.status(200).send({ status: true, message: "Cart updated", data: updateCard })

        }
        else {
            const checkCart = await cartModel.findOne({ "userId": userId })
            if (checkCart) {
                return res.status(400).send({ status: false, message: "A cart with this userId already present try to edit that cart" })
            }

            const dataForCreate = {
                "userId": userId,
                "items": [itemForAdd],
                "totalPrice": checkProduct.price,
                "totalItems": 1
            }
             await cartModel.create(dataForCreate)
            // .populate("items.productId",("price title description productImage availableSizes"))
            const finalCart = await cartModel.findOne(dataForCreate).populate({ path: 'items.productId', select: { '_id': 1, 'title': 1, 'price': 1, 'productImage': 1, 'description': 1 } })
            return res.status(201).send({ status: true, message: "Success", data: finalCart });
        }
           

        
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const { productId, cartId, removeProduct } = req.body
        //-------------------------------------checking user------------------------------------------//
        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) }
        // const checkUser=await userModel.findById(userId)
        // if (checkUser == null || checkUser.isDeleted == true) {
        //     return res.status(404).send({ status: false, message: "user not found or it may be deleted" })
        // }

        //-------------------------------------checking cart------------------------------------------//

        if (!isValidObjectId(cartId)) { return res.status(400).send({ status: false, message: "Please provide a valid cartId." }) }
        const checkCart = await cartModel.findOne({ "_id": cartId, "userId": userId })
        if (checkCart == null || checkCart.isDeleted == true) {
            return res.status(404).send({ status: false, message: "cart not found either it may be deleted or there is conflict(check userId and cartId are from the same document or not)" })
        }

        //-------------------------------------checking product------------------------------------------//
        if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Please provide a valid productId." }) }
        const checkProduct = await productModel.findById(productId)
        if (checkProduct == null || checkProduct.isDeleted == true) {
            return res.status(404).send({ status: false, message: "Product not found or it may be deleted" })
        }
        //-----------------------------------------------------------------------------------------------//
        let arr = checkCart.items
        let quantity = 0
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].productId == productId) {
                quantity = arr[i].quantity //assigning value to quantity
                if (quantity == 0 || removeProduct == 0) {
                    arr.splice(i, 1)
                    break
                }
                else if (quantity >= removeProduct) {
                    arr[i].quantity = quantity - removeProduct;
                    quantity = arr[i].quantity///assigning value to quantity after reducing
                    break
                }
                else if (quantity < removeProduct) {
                    return res.status(400).send({ status: false, message: "removeProduct value cannot greater than available quantity" })
                }

            }
        }

        const dataForUpdation = {
            "userId": userId,
            "items": arr,
            "totalPrice": checkCart.totalPrice - (checkProduct.price * quantity),
            "totalItems": arr.length
        }
        const updateCard = await cartModel.findByIdAndUpdate(
            { "_id": cartId },
            { $set: dataForUpdation }, //confuse in output i.e. in output whether details of product are to be shown or not
            { new: true }
        ).populate("items.productId",("price title description productImage availableSizes"))
        return res.status(200).send({ status: true, message: "Cart updated", data: updateCard })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const getCart = async function (req, res) {///price/title/size/image
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) }
        let user = await userModel.findById(userId)
        if (!user) { return res.status(400).send({ status: false, message: "this user doesnot exists" }) }
        let cart = await cartModel.findOne({ "userId": userId }).populate("items.productId",("price title description productImage availableSizes"))
        if (!cart) { return res.status(400).send({ status: false, message: "this user doesnot have any cart exists" }) }
        return res.status(200).send({ status: true, message: "Success", data: cart })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) };

        const userExist = await userModel.findById(userId)
        if (!userExist) return res.status(404).send({ status: false, msg: "user not found" })

        const cartExist = await userModel.findById(userId)
        if (!cartExist) return res.status(404).send({ status: false, msg: "cart not found" })

        let cart = await cartModel.findByIdAndUpdate((userId), { items: [], totalItems: 0, totalPrice: 0 }, { new: true })
        return res.status(204).send({ status: false, msg: "CART DELETED SUCESSFULLY", data: cart })
    } catch (error) {
        return res.status(500).send({ status: false, err: error.message })
    }
}


module.exports = { createCart, updateCart, getCart, deleteCart }   