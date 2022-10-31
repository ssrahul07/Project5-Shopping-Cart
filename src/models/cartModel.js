//===================== Import Packages =====================//
const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId


//===================== Create Cart's Schema =====================//
const cartSchema = new mongoose.Schema({

    userId: {
        type: ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    
    items: [{
        productId: { type: ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        _id: false
    }],

    totalPrice: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    }

}, { timestamps: true })


//===================== Module Export =====================//
module.exports = mongoose.model('Cart', cartSchema)