//===================== Importing Module and Packages =====================//
const orderModel = require('../Model/orderModel')
const cartModel = require('../Model/cartModel')
const validator = require('../Validator/validator')




//<<<===================== This function is used for Create Cart Data =====================>>>//
const createOrder = async (req, res) => {                              

    try {

        let userId = req.params.userId
        let data = req.body

        //===================== Destructuring Order Body Data =====================//
        let { cartId, cancellable, ...rest } = data

        //===================== Create a empty Object =====================//
        let obj = {}

        //===================== Checking Field =====================//
        if (!validator.checkInputsPresent(data)) return res.status(400).send({ status: false, message: "You have to put CardId." });
        if (validator.checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can put only CartId." }) }

        //===================== Checking the CartId =====================//
        if (!validator.isValidBody(cartId)) return res.status(400).send({ status: false, message: "Please enter CartId ." })
        if (!validator.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: `This cartId: ${cartId} is not valid!.` })

        //===================== Condition for Checking cancellable is present or not =====================//
        if (cancellable || cancellable == '') {

            if (!validator.isValidBody(cancellable)) return res.status(400).send({ status: false, message: "Please enter valid Cancellable ." })
            if (cancellable != true && cancellable != false) {
                return res.status(400).send({ status: false, message: "Cancellable must be Boolean Value(i.e. true or false). " })
            }

            obj.cancellable = cancellable
        }

        //===================== Fetch the Cart Data From DB =====================//
        let findCart = await cartModel.findOne({ userId: userId, _id: cartId })
        if (!findCart) return res.status(404).send({ status: false, message: "This CartId does not exist!" })

        //===================== Checking inside cart Item is present or not =====================//
        if (findCart.items.length == 0) return res.status(400).send({ status: false, message: "This CartId is empty." })

        //===================== Push Key and value pair inside Object =====================//
        obj.userId = findCart.userId
        obj.items = findCart.items
        obj.totalPrice = findCart.totalPrice
        obj.totalItems = findCart.totalItems

        //===================== Set Quantity as '0' =====================//
        let quantity = 0

        //===================== For loop is for get total Quantity of every Product =====================//
        for (let i = 0; i < findCart.items.length; i++) {
            quantity = quantity + findCart.items[i].quantity

        }

        obj.totalQuantity = quantity

        //===================== Final Order creatation =====================//
        let orderCreate = await orderModel.create(obj)

        //===================== Update or Delete that Cart Data in DB =====================//
        await cartModel.findOneAndUpdate({ _id: cartId }, { items: [], totalItems: 0, totalPrice: 0 })

        //===================== Return response for successful Order creation =====================//
        return res.status(201).send({ status: true, message: "Success", data: orderCreate })

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}




//<<<===================== This function is used for Create Cart Data =====================>>>//
const updateOrder = async (req, res) => {

    try {

        let userId = req.params.userId
        let data = req.body

        //===================== Destructuring Order Body Data =====================//
        let { orderId, status } = data

        //===================== Checking the OrderId =====================//
        if (!validator.isValidBody(orderId)) return res.status(400).send({ status: false, message: "Please enter OrderId ." })
        if (!validator.isValidObjectId(orderId)) return res.status(400).send({ status: false, message: `This OrderId: ${orderId} is not valid!.` })

        //===================== Validation of Status with Enum Value =====================//
        if (!validator.isValidateStatus(status)) {
            return res.status(400).send({ status: false, message: "Please enter existing status(i.e 'pending', 'completed', 'cancled' )." })
        }

        //===================== Fetch the Order Data from DB =====================//
        let checkStatus = await orderModel.findOne({ _id: orderId, userId: userId })
        if (!checkStatus) { return res.send(404).send({ status: false, message: "Order doesn't exist with your UserID." }) }

        //===================== Fetch the Order Data from DB and Checking Status value =====================//
        if (checkStatus.status) {

            if (checkStatus.status == 'completed') { return res.status(200).send({ status: true, message: "Your Order have been placed." }) }
            if (checkStatus.status == 'cancelled') { return res.status(200).send({ status: true, message: "Your Order already cancelled." }) }

        }

        //===================== Fetch the Order Data from DB and Checking Cancellable Value =====================//
        if (checkStatus.cancellable == false) { return res.status(200).send({ status: true, message: "Your Order can't be cancel!" }) }

        //===================== Fetch the Cart Data from DB =====================//
        let cartDetails = await cartModel.findOne({ userId: userId })
        if (!cartDetails) { return res.status(404).send({ status: false, message: "Cart doesn't exist!" }) }

        //===================== Final Order Updation =====================//
        let orderUpdate = await orderModel.findByIdAndUpdate({ _id: orderId, userId: userId }, { status: status }, { new: true })

        //===================== Return Response for Updatation Successful =====================//
        return res.status(200).send({ status: true, message: "Success", data: orderUpdate })

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}





//===================== Module Export =====================//
module.exports = { createOrder, updateOrder }