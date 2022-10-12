const mongoose = require("mongoose")
const productSchema = new mongoose.Schema({
       title: {
              type: String,
              reuired: true,
              unique: true,
              trim: true
       },
       description: {
              type: String,
              reuired: true,
              trim: true
       },
       price: {
              type: Number,
              reuired: true,
              trim: true
       },
       currencyId: {
              type: String,
              required: true,
              enum: ["INR"],
              trim: true
       },
       currencyFormat: {
              type: String,
              required: true,
              enum: [""],
              trim: true
       },
       isFreeShipping: {
              type: Boolean,
              default: false
       },
       productImage: {
              type: String,
              required: true,
              trim: true
       },  // s3 link
       style: {
              type: String,
              trim: true
       },
       availableSizes: {
              type: [String],
              enum: ["S", "XS", "M", "X", "L", "XXL", "XL"],
              trim: true
       },
       installments: { type: Number },
       deletedAt: { type: Date },
       isDeleted: {
              type: Boolean,
              default: false
       }
},
       { timestamps: true })

       module.exports = mongoose.model("Product",productSchema)