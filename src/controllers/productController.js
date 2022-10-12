const mongoose=require('mongoose')
const productModel=require('../models/productModel.js')
const { uploadFile } = require("../aws/aws")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value == 'string' && value.trim().length === 0) return false
    return true
  }

  const createProduct=async  function(req,res){
    try {
       let requestbody=req.body 
       if(Object.keys(requestbody).length==0)
        return res.status(400).send({status:false,msg:"body should not be empty"})
        let files = req.files
        let fileUrl = await uploadFile(files[0]);
        requestbody.productImage = fileUrl;
        if (!files || files.length == 0) {
          return res
            .status(400)
            .send({ status: false, message: "No product Image found" });
        }
        let {title,description,price,currencyId,currencyFormat,availableSizes}=requestbody
        if (!isValid(title)) 
         return res.status(400).send({status:false,msg:"title is required"})
         let titleAlreadyexist=await productModel.findOne({title:title})
         if(titleAlreadyexist) 
         
         return res.status(400).send({status:false,msg:"title already exist"})
         console.log(title)
        if(!isValid(description))
        return res.status(400).send({status:false,msg:"description is required"})
        if(!isValid(price))
        return res.status(400).send({status:false,msg:"price is required"})
        if(!isValid(currencyId))
        return res.status(400).send({status:false,msg:"currencyIdis required"})
        if(currencyId!="INR")
        return res.status(400).send({status:false,msg:"currencyId should be only INR"})
        if(!isValid(currencyFormat))
        return res.status(400).send({status:false,msg:"currencyFormat is required"})
        if(currencyFormat!="₹")
        return res.status(400).send({status:false,msg:"currencyFormat should be only ₹"})
        // if(style){
        //  if(typeof(style)!=String)
        //  return res.status(400).send({status:false,msg:" style will be in string form "})
        // }
        let enumSize = ["S", "XS", "M", "X", "L", "XXL", "XL"];
        for (let i = 0; i < availableSizes.length; i++) {
          if (!enumSize.includes(availableSizes[i])) {
            return res.status(400).send({
              status: false,
              message: "availableSizes should be-[S, XS,M,X, L,XXL, XL]",
            });
          }
        }
     const create=await productModel.create(requestbody)
     return res.status(201).send({status:true,msg:"product created Successfully",data:create})
    } catch (err) {
        return res.status(500).send({status:false,msg:err.message})
    }
  }
  // ----------------getProductByFilter----------------------
  const getProductByFilter=async function(req,res){
    try {
       const requestbody=req.body
    } catch (error) {
      return res.status(500).send({status:false,msg:error.message})
      
    }
  }


  // -----------------getProductById-----------------------------
  const ProductById = async function (req , res){
    try{
      let requestbody=req.body 
       if(Object.keys(requestbody).length>0)
       
       return res.status(400).send({ status: false, message: "invalid request" });
      let reqquery = req.query;
      if(Object.keys(reqquery).length>0)return res.status(400).send({ status: false, message: "invalid request" });
      let productId = req.params.productId
    if (!mongoose.Types.ObjectId.isValid(productId)) { return res.status(400).send({ status: false, message: "productId is not valid" }) }

    const product = await productModel.findOne({ _id: productId,isDeleted:false })
    if (!product) {
      return res.status(404).send({ send: false, message: "No profile available with this productId or might be deleted" })
    }
    return res.status(200).send({ status: true, message: "User profile details", data: product })

    
    }catch(error){
      return res.status(500).send({ status: false, message: error.message })
    }

  }



  // ----------------------------deleteProduct -------------------------
  const deleteProduct = async function (req, res) {
    try{
      let requestbody=req.body 
      if(Object.keys(requestbody).length>0)
      
      return res.status(400).send({ status: false, message: "invalid request" });
     let reqquery = req.query;
     if(Object.keys(reqquery).length>0)return res.status(400).send({ status: false, message: "invalid request" })
    let productId = req.params.productId;
    if (!mongoose.Types.ObjectId.isValid(productId)) { return res.status(400).send({ status: false, message: `${productId} is not valid` }) }
    let productIdInDb=await productModel.findOne({_id:productId,isDeleted:false})
    if(!productIdInDb) return res.status(400).send({status:false,msg:"product is deleted or not found"})
     await productModel.findByIdAndUpdate({_id:productId},{ $set: { isDeleted: true, deletedAt: Date.now() } },{ new: true })
     return res.status(200).send({status:true,msg:"product is deleted successfully"})
    }catch(error){
      return res.status(500).send({ status: false, message: error.message })
    }
  }
  module.exports = {createProduct,getProductByFilter,ProductById , deleteProduct}