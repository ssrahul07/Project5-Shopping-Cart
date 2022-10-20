const mongoose = require("mongoose")
const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const isValidInputBody = function (object) {
    return Object.keys(object).length > 0
}




const isValidInputValue = function (value) {
    if (typeof (value) === 'undefined' || value === null) return false
    if (typeof (value) === 'string' && value.trim().length > 0) return true
    return false
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};



const postCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId))
            return res.status(400).send({ sttaus: false, msg: `${userId} is not valid` })
        let { productId, cartId } = productDetails
        if (!isValidInputValue(productId) || !isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Product ID is required and should be valid" });
        }
        if (cartId) {
            if (!isValidInputValue(cartId) || !isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: "Cart ID should be valid" });
            }
        }
        const productByproductId = await productModel.findOne({ _id: productId, isDeleted: false, deletedAt: undefined })
        if (!productByproductId)
            return res.status(404).send({ status: false, msg: "product is not found" })

        //  userCartDetails
        const userCartDetails = await cartModel.findById(userId)
        if (userCartDetails == null) {
            const createcart = await CartModel.create({ userId: userId, totalPrice: 0, totalItems: 0 })
            const productData = { productId: productId, quantity: 1 };

            const cartData = { items: [productData], totalPrice: productByProductId.price, totalItems: 1 };

            const newCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: cartData }, { new: true }).select({ items: { _id: 0 } });
            // console.log(newCart)
            return res.status(200).send({
                status: true, message: "Product added to cart", data: newCart
            });
        }




    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

//-----------------------------updatecart-----------------

const updateCart = async function (req, res) {
    try {
        let userId = req.params.userId;

        let updatedData = req.body;
        let { productId, cartId, removeProduct } = updatedData;

        if (!userId)
            return res.status(400).send({ status: false, msg: `please provide ${userId}` })

        if (!isValidObjectId(userId))
            return res.status(400).send({ sttaus: false, msg: `${userId} is not valid` })


        if (isValidInputBody(updatedData)) {
            return res
                .status(400)
                .send({ status: false, message: "Please add some items, cart can't be empty" });
        }
        if (!isValidInputValue(cartId)) {
            return res.status(400).send({
                status: false,
                message: "Please enter cart id"
            });
        }

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ sttaus: false, msg: `${cartId} is not valid` })
        }

        let cart = await cartModel.findById({ _id: cartId, userId: userId });
        if (!cart) {
            return res.status(400).send({ status: false, message: "cart not found" });
        }
        if (!isValidInputValue(productId)) {
            return res.status(400).send({
                status: false,
                message: "Please enter product id"
            })
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({
                status: false,
                message: "Not a valid ProductId"
            })
        }

        let product = await productModel.findOne({
            _id: productId,
            isDeleted: false,
        });

        if (!product) {
            return res
                .status(404)
                .send({ status: false, message: "product not found" });
        }
        if (!isValidInputValue(removeProduct)) {
            return res.status(400).send({
                status: false,
                message: "Remove product should be number"
            });
        }
        if (isNaN(Number(removeProduct))) {
            return res.status(400).send({
                status: false,
                message: `removeProduct should be a valid number formate either 0 or 1`,
            });
        }
        let arr = cart.items
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

        let data = await cartModel.findOneAndUpdate({ _id: cartId }, { items: itemsArr, totalPrice: totalAmount }, { new: true }).select({ items: { _id: 0 } })

        return res.status(200).send({ status: true, message: `${productId} quantity is been reduced By 1`, data: data })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}




module.exports = { postCart, updateCart }




