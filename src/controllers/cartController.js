const mongoose=require("mongoose")
const cartModel=require("../models/cartModel")
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



const postCart=async function(req,res){
    try {
        const userId=req.params.userId
        if(!isValidObjectId(userId))
         return res.status(400).send({sttaus:false,msg:`${userId} is not valid`})
        let{productId, cartId } =productDetails
        if (!isValidInputValue(productId) || !isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Product ID is required and should be valid" });
        }
        if (cartId) {
            if (!isValidInputValue(cartId) || !isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: "Cart ID should be valid" });
            }
        }
        const productByproductId=await productModel.findOne({_id:productId,isDeleted:false,deletedAt:undefined})
        if(!productByproductId)
         return res.status(404).send({status:false,msg:"product is not found"})
         
        //  userCartDetails
        const userCartDetails=await cartModel.findById(userId)
        if (userCartDetails==null){
        const createcart = await CartModel.create({ userId: userId, totalPrice: 0, totalItems: 0 })
        const productData = { productId: productId, quantity: 1 };

            const cartData = { items: [productData], totalPrice: productByProductId.price, totalItems: 1 };

            const newCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: cartData }, { new: true }).select({ items: { _id: 0 } });
            // console.log(newCart)
            return res.status(200).send({
                status: true, message: "Product added to cart", data: newCart
            });}


        
        
    } catch (error) {
        return res.status(500).send({status:false,msg:error.message})
    }
}

moldule.exports.postCart=postCart