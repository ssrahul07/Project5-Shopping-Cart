//===================== Importing Module and Packages =====================//
const productModel = require('../Model/productModel')
const uploadFile = require('../aws/config')
const validator = require('../Validator/validator')





//<<<===================== This function is used for Create Product Data =====================>>>//
const createProduct = async (req, res) => {

    try {

        let data = req.body
        let files = req.files


        //===================== Destructuring User Body Data =====================//
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage, ...rest } = data

        //===================== Checking Mandotory Field =====================//
        if (!validator.checkInputsPresent(data)) return res.status(400).send({ status: false, message: "No data found from body! You need to put the Mandatory Fields (i.e. title, description, price, currencyId, currencyFormat, productImage). " });
        if (validator.checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can input only title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments." }) }


        //===================== Create a Object of Product =====================//
        let obj = {}

        //===================== Validation of title =====================//
        if (!validator.isValidBody(title)) { return res.status(400).send({ status: false, message: "Please enter title!" }) }
        if (!validator.isValidProdName(title)) { return res.status(400).send({ status: false, message: "Please mention valid title In Body!" }) }
        obj.title = title

        //===================== Validation of Description =====================//
        if (!validator.isValidBody(description)) return res.status(400).send({ status: false, message: "Please enter description!" });
        obj.description = description

        //===================== Validation of Price =====================//
        if (!validator.isValidBody(price)) return res.status(400).send({ status: false, message: "Please enter price!" });
        if (!validator.isValidPrice(price)) return res.status(400).send({ status: false, message: "Please valid valid price In Body!" });
        obj.price = price

        //===================== Validation of CurrencyId =====================//
        if (currencyId || currencyId == '') {
            if (!validator.isValidBody(currencyId)) return res.status(400).send({ status: false, message: "Please enter CurrencyId!" });
            if (currencyId != 'INR') return res.status(400).send({ status: false, message: "CurrencyId must be 'INR'!" });
            obj.currencyId = currencyId
        }

        //===================== Validation of CurrencyFormat =====================//
        if (currencyFormat || currencyFormat == '') {
            if (!validator.isValidBody(currencyFormat)) return res.status(400).send({ status: false, message: "Please enter currencyFormat!" });
            if (currencyFormat != '₹') return res.status(400).send({ status: false, message: "Currency Format must be '₹'!" });
            obj.currencyFormat = currencyFormat
        }

        //===================== Validation of isFreeShipping =====================//
        if (isFreeShipping) {
            if (!validator.isValidBody(isFreeShipping)) return res.status(400).send({ status: false, message: "Please enter value of Free Shipping!" });
            if (isFreeShipping !== 'true' && isFreeShipping !== 'false') return res.status(400).send({ status: false, message: "Please valid value of Free shipping!" });
            obj.isFreeShipping = isFreeShipping
        }


        //===================== Validation of Style =====================//
        if (style) {
            if (!validator.isValidBody(style)) return res.status(400).send({ status: false, message: "Please enter style!" });
            if (!validator.isValidName(style)) return res.status(400).send({ status: false, message: "Please valid style!" });
            obj.style = style
        }

        //===================== Validation of AvailableSizes =====================//
        if (!validator.isValidBody(availableSizes)) return res.status(400).send({ status: false, message: "Please enter Size!" });
        availableSizes = availableSizes.split(',').map((item) => item.trim())
        for (let i = 0; i < availableSizes.length; i++) {
            if (!validator.isValidateSize(availableSizes[i])) return res.status(400).send({ status: false, message: "Please mention valid Size!" });
        }
        obj.availableSizes = availableSizes


        //===================== Validation of Installments =====================//
        if (installments || installments == '') {
            if (!validator.isValidBody(installments)) return res.status(400).send({ status: false, message: "Please enter installments!" });
            if (!validator.isValidInstallment(installments)) return res.status(400).send({ status: false, message: "Provide valid Installments number!" });
            obj.installments = installments
        }


        //===================== Fetching Title of Product from DB and Checking Duplicate Title is Present or Not =====================//
        const isDuplicateTitle = await productModel.findOne({ title: title });
        if (isDuplicateTitle) {
            return res.status(400).send({ status: false, message: "Title is Already Exists, Please Enter Another Title!" });
        }


        //===================== Checking the ProductImage is present or not and Validate the ProductImage =====================//
        if (files && files.length > 0) {
            if (files.length > 1) return res.status(400).send({ status: false, message: "You can't enter more than one file for Create!" })
            if (!validator.isValidImage(files[0]['originalname'])) { return res.status(400).send({ status: false, message: "You have to put only Image." }) }
            let uploadedFileURL = await uploadFile(files[0])
            obj.productImage = uploadedFileURL
        } else {
            return res.status(400).send({ message: "Product Image is Mandatory! Please input image of the Product." })
        }


        //x===================== Final Creation of Product =====================x//
        let createProduct = await productModel.create(obj)

        return res.status(201).send({ status: true, message: "Success", data: createProduct })

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}





//<<<===================== This function is used for Get Data of Products =====================>>>//

const getProduct = async (req, res) => {

    try {

        let data = req.query

        //===================== Destructuring User Body Data =====================//
        let { size, name, priceGreaterThan, priceLessThan, priceSort, ...rest } = data

        //===================== Checking Mandotory Field =====================//
        if (validator.checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can input only size, name, priceGreaterThan, priceLessThan, priceSort." }) }

        if (!validator.checkInputsPresent(data)) {

            let productData = await productModel.find({ isDeleted: false })

            if (productData.length == 0) return res.status(404).send({ status: false, message: "Products not found" })

            return res.status(200).send({ status: true, message: "Success", data: productData });
        }

        //===================== Create a Object of Product =====================//
        let obj = { isDeleted: false }

        //===================== Check Present data & Validate of Size =====================//
        if (size || size == '') {
            if (!validator.isValidBody(size)) return res.status(400).send({ status: false, message: "Please enter Size!" });
            size = size.split(',').map((item) => item.trim())
            for (let i = 0; i < size.length; i++) {
                if (!validator.isValidateSize(size[i])) return res.status(400).send({ status: false, message: "Please mention valid Size!" });
            }
            obj.availableSizes = { $all: size }
        }

        //===================== Check Present data & Validate of Name =====================//
        if (name || name == '') {
            if (!validator.isValidBody(name)) { return res.status(400).send({ status: false, message: "Please enter name!" }) }
            if (!validator.isValidProdName(name)) { return res.status(400).send({ status: false, message: "Please mention valid name!" }) }
            obj.title = { $regex: name }
        }

        //===================== Check Present data & Validate of priceGreaterThan =====================//
        if (priceGreaterThan || priceGreaterThan == '') {
            if (!validator.isValidBody(priceGreaterThan)) return res.status(400).send({ status: false, message: "Please enter Price Greater Than!" });
            if (!validator.isValidPrice(priceGreaterThan)) return res.status(400).send({ status: false, message: "priceGreaterThan must be number!" });
            obj.price = { $gt: priceGreaterThan }
        }

        //===================== Check Present data & Validate of priceLessThan =====================//
        if (priceLessThan || priceLessThan == '') {
            if (!validator.isValidBody(priceLessThan)) return res.status(400).send({ status: false, message: "Please enter Price Lesser Than!" });
            if (!validator.isValidPrice(priceLessThan)) return res.status(400).send({ status: false, message: "priceLessThan must be number!" });
            obj.price = { $lt: priceLessThan }
        }

        //===================== Check the Both data(i.e priceGreaterThan & priceLessThan) is present or not =====================//
        if (priceGreaterThan && priceLessThan) {
            obj.price = { $gt: priceGreaterThan, $lt: priceLessThan }
        }

        //===================== Validate the Price Sort =====================//
        if (priceSort || priceSort == '') {
            if (!(priceSort == -1 || priceSort == 1)) return res.status(400).send({ status: false, message: "Please Enter '1' for Sort in Ascending Order or '-1' for Sort in Descending Order!" });
        }

        //x===================== Fetching All Data from Product DB =====================x//
        let getProduct = await productModel.find(obj).sort({ price: priceSort })

        //===================== Checking Data is Present or Not in DB =====================//
        if (getProduct.length == 0) return res.status(404).send({ status: false, message: "Product Not Found." })

        return res.status(200).send({ status: true, message: "Success", data: getProduct })

    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
}


//<<<===================== This function is used for Get Data of Products By Path Param =====================>>>//
const getProductById = async (req, res) => {

    try {

        let productId = req.params.productId

        //===================== Checking the ProductId is Valid or Not by Mongoose =====================//

        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: `Please Enter Valid ProductId: ${productId}.` })

        //x===================== Fetching All Data from Product DB =====================x//

        let getProduct = await productModel.findOne({ _id: productId, isDeleted: false })

        //===================== Checking Data is Present or Not in DB =====================//

        if (!getProduct) return res.status(404).send({ status: false, message: "Product Data is Not Found!" })

        return res.status(200).send({ status: true, message: "Success", data: getProduct })

    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
}






//<<<===================== This function is used for Update Products Data By Path Param =====================>>>//

const updateProduct = async (req, res) => {

    try {

        let data = req.body

        let files = req.files

        let productId = req.params.productId



        //===================== Destructuring User Body Data ===========================================//

        let { title, description, price, isFreeShipping, style, availableSizes, installments, productImage, ...rest } = data

        //===================== Checking the ProductId is Valid or Not by Mongoose =====================//

        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: `Please Enter Valid ProductId: ${productId}` })

        //===================== Checking Body ==========================================================//

        if (!validator.checkInputsPresent(data) && !(files)) return res.status(400).send({ status: false, message: "You have to put atleast one key to update Product (i.e. title, description, price, isFreeShipping, style, availableSizes, installments, productImage). " });

        if (validator.checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can enter to update only title, description, price, isFreeShipping, style, availableSizes, installments, productImage." }) }


        //===================== Create a Object of Product ===============================================//
        let obj = {}

        //===================== Validation of title ======================================================//

        if (title || title == '') {

            if (!validator.isValidBody(title)) { return res.status(400).send({ status: false, message: "Please enter title!" }) }

            if (!validator.isValidProdName(title)) { return res.status(400).send({ status: false, message: "Please mention valid title In Body!" }) }

            //===================== Fetching Title of Product from DB and Checking Duplicate Title is Present or Not =====================//
            let isDuplicateTitle = await productModel.findOne({ title: title });

            if (isDuplicateTitle) {

                return res.status(400).send({ status: false, message: "Title is Already Exists, Please Enter Another One Title!" });
            }

            obj.title = title
        }

        //===================== Validation of Description =======================================//

        if (description || description == '') {
            if (!validator.isValidBody(description)) return res.status(400).send({ status: false, message: "Please enter description!" });

            obj.description = description
        }

        //===================== Validation of Price =============================================//
        if (price || price == '') {

            if (!validator.isValidBody(price)) return res.status(400).send({ status: false, message: "Please enter price!" });

            if (!validator.isValidPrice(price)) return res.status(400).send({ status: false, message: "Please valid valid price In Body!" });
            obj.price = price
        }

        //===================== Validation of isFreeShipping =====================//
        if (isFreeShipping || isFreeShipping == '') {

            if (isFreeShipping !== 'true' && isFreeShipping !== 'false') return res.status(400).send({ status: false, message: "Please valid value of Free shipping!" });
            obj.isFreeShipping = isFreeShipping
        }

        //===================== Checking the ProductImage is present or not and Validate the ProductImage =====================//
        if (productImage == '') return res.status(400).send({ status: false, message: "You have to put image while choosing productImage" })

        if (files && files.length > 0) {

            if (files.length > 1) return res.status(400).send({ status: false, message: "You can't enter more than one file for Create!" })
            if (!validator.isValidImage(files[0]['originalname'])) { return res.status(400).send({ status: false, message: "You have to put only Image." }) }
            let uploadedFileURL = await uploadFile(files[0])
            obj.productImage = uploadedFileURL
        }

        //===================== Validation of Style =====================//
        if (style || style == '') {
            if (!validator.isValidBody(style)) return res.status(400).send({ status: false, message: "Please enter style!" });
            if (!validator.isValidName(style)) return res.status(400).send({ status: false, message: "Please valid style!" });
            obj.style = style
        }

        //===================== Validation of AvailableSizes =====================//
        if (availableSizes || availableSizes == '') {
            if (!validator.isValidBody(availableSizes)) return res.status(400).send({ status: false, message: "Please enter Size!" });
            availableSizes = availableSizes.split(',').map((item) => item.trim())
            for (let i = 0; i < availableSizes.length; i++) {
                if (!validator.isValidateSize(availableSizes[i])) return res.status(400).send({ status: false, message: "Please mention valid Size!" });
            }
            obj.availableSizes = availableSizes
        }


        //===================== Validation of Installments =====================//
        if (installments || installments == '') {
            if (!validator.isValidBody(installments)) return res.status(400).send({ status: false, message: "Please enter installments!" });
            if (!validator.isValidInstallment(installments)) return res.status(400).send({ status: false, message: "Provide valid Installments number!" });
            obj.installments = installments
        }


        //x===================== Fetching All Product Data from Product DB then Update the values =====================x//
        let updateProduct = await productModel.findOneAndUpdate({ isDeleted: false, _id: productId }, { $set: obj }, { new: true })

        //x===================== Checking the Product is Present or Not =====================x//
        if (!updateProduct) { return res.status(404).send({ status: false, message: "Product is not found or Already Deleted!" }); }

        return res.status(200).send({ status: true, message: "Success", data: updateProduct })

    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
}





//<<<===================== This function is used for Delete Product Data By Path Param =====================>>>//
const deleteProduct = async (req, res) => {

    try {

        let productId = req.params.productId

        //===================== Checking the ProductId is Valid or Not by Mongoose =====================//
        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: `Please Enter Valid ProductId: ${productId}.` })

        //x===================== Fetching All Product Data from Product DB then Update the value of isDeleted from false to true =====================x//
        let deletedProduct = await productModel.findOneAndUpdate({ isDeleted: false, _id: productId }, { isDeleted: true, deletedAt: Date.now() })

        //x===================== Checking the Product is Present or Not =====================x//
        if (!deletedProduct) { return res.status(404).send({ status: false, message: "Product is not found or Already Deleted!" }) }

        return res.status(200).send({ status: true, message: "Product Successfully Deleted." })

    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
}





//===================== Module Export =====================//
module.exports = { createProduct, getProduct, getProductById, updateProduct, deleteProduct }