const mongoose=require('mongoose')
const productModel=require('../models/productModel.js')
const { uploadFile } = require("../aws/aws")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value == 'string' && value.trim().length === 0) return false
    return true
  }
  