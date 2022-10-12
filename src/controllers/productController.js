const mongoose=require('mongoose')
const productModel=require('../models/productModel.js')
const { uploadFile } = require("../aws/aws")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value == 'string' && value.trim().length === 0) return false
    return true
  }




  // -----------------getProductById-----------------------------
  const ProductById = async function (req , res){
    try{
      let productId = req.params.productId
    if (!mongoose.Types.ObjectId.isValid(productId)) { return res.status(400).send({ status: false, message: "productId is not valid" }) }

    const product = await productModel.findOne({ _id: productId })
    if (!product) {
      return res.status(404).send({ send: false, message: "No profile available with this productId" })
    }
    return res.status(200).send({ status: true, message: "User profile details", data: product })

    
    }catch(error){
      return res.status(500).send({ status: false, message: error.message })
    }

  }



  // ----------------------------deleteProduct -------------------------
  const deleteProduct = async function (req, res) {
    try{
    let productId = req.params.productId;
    if (!mongoose.Types.ObjectId.isValid(productId)) { return res.status(400).send({ status: false, message: "productId is not valid" }) }
  
    }catch(error){
      return res.status(500).send({ status: false, message: error.message })
    }
  }
  module.exports = {ProductById , deleteProduct}