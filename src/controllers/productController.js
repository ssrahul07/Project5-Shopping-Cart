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
       console.log(requestbody)
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
       // if(!isValid(currencyId))
       // return res.status(400).send({status:false,msg:"currencyIdis required"})
       if(currencyId!="INR")
       return res.status(400).send({status:false,msg:"currencyId should be only INR"})
       // if(!isValid(currencyFormat))
       // return res.status(400).send({status:false,msg:"currencyFormat is required"})
       if(currencyFormat!="₹")
       return res.status(400).send({status:false,msg:"currencyFormat should be only ₹"})
       // if(style){
       //  if(typeof(style)!=String)
       //  return res.status(400).send({status:false,msg:" style will be in string form "})
       // }
       let enumSize = ["S", "XS", "M", "X", "L", "XXL", "XL"];
       for (let i = 0; i <availableSizes.length; i++) {
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
  
  function isValidPrice(value) {
    return /^[1-9]{1}\d*((\.)\d+)?$/.test(value)
  }
  const isValidName = function (value) {
    return /^[A-Za-z]+((\s)?[A-Za-z]+)*$/.test(value)
  }
  const getProductByFilter = async function (req, res) {
    try {
        let reqquery = req.query
        let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];
        
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = reqquery
        
        if (priceSort) {
            if (!(priceSort === -1 || priceSort === 1))
                return res.
                    status(400).
                    send({ status: false, message: "pricesor can contain only 1 0r -1" })
        }
        
        if (size) {

            let sizeArr = size.replace(/\s+/g, "").split(",");

            var uniqueSize = sizeArr.filter(function (item, i, ar) {
                return ar.indexOf(item) === i;
            });
            for (let i = 0; i < uniqueSize.length; i++) {
                if (!arr.includes(uniqueSize[i]))
                    return res.status(400).send({
                        status: false,
                        data: "Enter a Valid Size, Like 'XS or S or M or X or L or XL or XXL'",
                    });
            }
        }

        if (name) {
            if (!isValidName(name))
                return res.
                    status(400).
                    send({ status: false, message: "plz give the name in valid formate" })
        } else
            name = ""

        if (priceGreaterThan) {
            if (!isValidPrice(priceGreaterThan))
                return res.
                    status(400).
                    send({ status: false, message: "plz give the priceGratterThen in valid formate" })
        } else
            priceGreaterThan = 0

        if (priceLessThan) {
            if (!isValidPrice(priceLessThan))
                return res.
                    status(400).
                    send({ status: false, message: "plz give the priceLowerThen in the valid formate" })
        } else
            priceLessThan = 2 ** 32 - 1

        if (size != undefined) {
            let result = await productModel.find({ "title": { $regex: `${name}` }, "price": { "$gte": `${priceGreaterThan}`, "$lte": `${priceLessThan}` }, "availableSizes": { $in: `${size}` }, isDeleted: false })
            if (priceSort == 1)
                result.sort((a, b) => (a.price) - (b.price))
            else if (priceSort == -1)
                result.sort((a, b) => (b.price) - (a.price))
            return res.
                status(200).
                send({ status: true, data: result })
        } else {
            let result = await productModel.find({ "title": { $regex: `${name}` }, "price": { "$gte": `${priceGreaterThan}`, "$lte": `${priceLessThan}` }, isDeleted: false })
            if (priceSort == 1)
                result.sort((a, b) => (a.price) - (b.price))
            else if (priceSort == -1)
                result.sort((a, b) => (b.price) - (a.price))
            return res.
                status(200).
                send({ status: true, data: result })
        }
    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
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

// ----------------------------updateProduct--------------------

const updateProduct = async function(req, res){
  
    try {
      let productId = req.params.productId;
  
      if (!mongoose.Types.ObjectId.isValid(productId))
        return res.status(400).send({ status: false, msg: `please provide valid ${productId}` })
  
      const productByproductId = await productModel.findOne({
        _id: productId,
        isDeleted: false,
      });
  
      if (!productByproductId) {
        return res
          .status(404)
          .send({ status: false, message: " Product not found" });
      }
      let data = req.body;
      let {
        title,
        price,
        currencyId,
        currencyFormat,
        availableSizes,
        productImage,
      } = data;
  
      let files = req.files;
      if (files && files.length > 0) {
  
        let fileUrl = await uploadFile(files[0]);
       requestbody.productImage = fileUrl;
      }
  
      if (title) {
        let uniqueTitle = await productModel
          .findOne({ title: title })
  
        if (uniqueTitle) {
          return res.status(400).send({
            status: false,
            message: "Title already present",
          });
        }
      }
  
      if (price) {
        // if (!isValidPrice(price)) {
        //   return res.status(400).send({
        //     status: false,
        //     message:
        //       "Price should be minimum 3-5 digits and for decimal value- after decimal please take 2 digits",
        //   });
        // }
      }
      if (currencyId) {
        if (currencyId != "INR") {
          return res.status(400).send({
            status: false,
            message: "CurrencyId should be INR",
          });
        }
      }
  
      if (currencyFormat) {
        if (currencyFormat != "₹") {
          return res.status(400).send({
            status: false,
            message: "CurrencyFormat should be ₹ ",
          });
        }
      }
  
      if (availableSizes) {
        let enumSize = ["S", "XS", "M", "X", "L", "XXL", "XL"];
        for (let i = 0; i < availableSizes.length; i++) {
          if (!enumSize.includes(availableSizes[i])) {
            return res.status(400).send({
              status: false,
              message: "availableSizes should be-[S, XS,M,X, L,XXL, XL]",
            });
          }
        }
      }
  
      let updatedData = await productModel.findOneAndUpdate(
        { _id: productId },
        data,
        {
          new: true,
        }
      );
      return res.status(200).send({
        status: true,
        message: "product details updated",
        data: updatedData,
      });
    } catch (err) {
      return res.status(500).send({ status: false, error: err.message });
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
  module.exports = {createProduct,getProductByFilter,ProductById , updateProduct , deleteProduct}



  