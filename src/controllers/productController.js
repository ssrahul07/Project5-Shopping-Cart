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
  const getProductByFilter = async function (req, res) {
    try {
      const requestquery = req.query
      
        let filterCondition={isDeleted:false}
      let { size, name, Price } = requestquery
      if( Object.keys(requestquery).length > 0){
      if (size) {
        const sizeIsPresent = await productModel.find({ size: availableSizes, isDeleted: false })
        if (!sizeIsPresent)
          return res.status(400).send({ status: false, msg: "size is not present" })
          const arrayOfSize =JSON.parse(arrayOfSize)
          let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];
           
          for (let i = 0; i < arrayOfSize.length; i++) {
            console.log(arrayOfSize)
            if (!arr.includes(arrayOfSize[i]))
              return res.status(400).send({status: false,data: "Enter a Valid Size, Like 'XS or S or M or X or L or XL or XXL'",});
          }
          filterCondition["size"] = size.trim();
      }
      if (name) {
        const nameisPresent = await productModel.find({ title: name, isDeleted: false })
        if (!nameisPresent)
          return res.status(400).send({ status: false, msg: "name is not present" })
          filterCondition["name"] = name.trim();
      }
      if (Price) {
        const priceIsPresent = await productModel.find({ price: Price, isDeleted: false })
        if (!priceIsPresent)
          return res.status(400).send({ status: false, msg: "price is not present" })
      
          filterCondition["Price"] = Price.trim();
      }
      if (priceGreaterThan && priceLessThan) {
        return {
          $and: [
            { price: { $gt: requestquery.priceGreaterThan, $lt: requestquery.priceLessThan } },
          ],
        };
      } else if (requestquery.priceGreaterThan) {
        return { price: { $gt: requestquery.priceGreaterThan } };
      } else if (requestquery.priceLessThan) {
        return { price: { $lt: requestquery.priceLessThan } };
      }
      if(requestquery.priceSort==1){
  
         const priceShortInDecending=await productModel.find(filterCondition).sort((a, b) => Number(b.price) - Number(a.price))
         if (priceShortInDecending.length == 0)
      return res.status(404).send({ status: false, message: "no product found" });
         return res.status(200).send({status:true,msg:"all data is collected in decendingOrder",productCount:priceShortInDecending.length,data:priceShortInDecending})
      }
      else if(requestquery.priceSort==-1){
      const priceShortInAscending=await productModel.find(filterCondition).sort((a, b) => Number(a.price) - Number(b.price))
      if (priceShortInAscending.length == 0)
      return res.status(404).send({ status: false, message: "no product found" });
      return res.status(200).send({status:true,msg:"all data is collected in ascendingOrder",productCount:priceShortInAscending.length,data:priceShortInAscending})
      }
      const data=await productModel.find(filterCondition)
      if (data.length==0) return res.status(404).send({ status: false, message: "no product found" });
      return res.status(200).send({status:true,msg:"all data is collected",productCount:data.length,data:data})
      
    }else{
      const allProduct = await productModel.find(filterCondition)
      if (allProduct.length == 0)
      return res.status(404).send({ status: false, message: "no product found" });
      return res.status(200).send({status: true,message: "product list",booksCount: allProduct.length,booksList: allProduct});
    }
  
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message })
  
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


  //----------------------------updateProductAPI--------------
  const updateProduct = async function(req, res){
    try {
      let productId = req.params.productId
  
      if(!isValid(productId)){
        return res.status(400).send({status: false,message: "Product Id is not Valid" })
      }

      let productDetails = await productModel.findById(productId)
  
      if(!productDetails || productDetails.isDeleted == true){
        return res.status(400).send({status: false,message: "Product does not exist" })
      }
      
      let {title,description,price,isFreeShipping,style,availableSizes,installments} = data
      
      let data = req.body 
  
      if(!isValid(data)){
        return res.status(400).send({status: false, message: "Please descriptionprovide data to update the product" })
      }
  
      let updateProductDetails = {}
      
      if(data.hasOwnProperty("title")){
        if(!isValid(title)){
          return res.status(400).send({status: false, message: "Please enter a valid Title" })
        }
        updateProductDetails.title = data.title
      }

      
      if(data.hasOwnProperty("description")){
        if(!isValid(description)){
          return res.status(400).send({status: false, message: "Please enter a valid Description" })
        }
        updateProductDetails.description = data.description
      }

      if(data.hasOwnProperty("price")){
        if(!isValid(price)){
          return res.status(400).send({status: false, message: "Please enter a valid Price" })
        }
        updateProductDetails.price = data.price
      }
      
      if(data.hasOwnProperty("isFreeShipping")){
        if(!isValid(isFreeShipping)){
          return res.status(400).send({status: false, message: "Please enter a valid isFreeShipping" })
        }
        updateProductDetails.isFreeShipping = data.isFreeShipping
      }
      
      if(data.hasOwnProperty("style")){
        if(!isValid(style)){
          return res.status(400).send({status: false, message: "Please enter a valid style" })
        }
        updateProductDetails.style = data.style
      }

      if(data.hasOwnProperty("availableSizes")){
        if(!isValid(availableSizes)){
          return res.status(400).send({status: false, message: "Please enter a valid availableSizes" })
        }
        updateProductDetails.availableSizes = data.availableSizes
      }

      if(data.hasOwnProperty("installments")){
        if(!isValid(installments)){
          return res.status(400).send({status: false, message: "Please enter a valid installments" })
        }
        updateProductDetails.installments = data.installments
      }

      let updateProduct = await productModel.findOneAndUpdate( {_id: productId} ,updateProductDetails, {new: true});
      return res.status(200).send({status: true,message: "Product details updated",data: updateProduct});

    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
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
  module.exports = {createProduct,getProductByFilter,ProductById , deleteProduct , updateProduct}