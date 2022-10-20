const mongoose = require("mongoose")


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value == 'string' && value.trim().length === 0) return false
    return true
  }
  const isValidAddress = function (data) {
    if (typeof (data) === "undefined" || data === null) return false;
    if (typeof (data) === "object" && Array.isArray(data) === false && Object.keys(data).length > 0) return true;
    return false;
  };
  
  
  const isValidPincode = function (data) {
    if ((/^[1-9][0-9]{5}$/.test(data))) {
      return true
    }
    return false
  }
  const isValidOnlyCharacters = function (data) {
    if (data === undefined) return false
    return /^[A-Za-z ]+$/.test(data)
  
  }
  
  const phoneregex = /^([6-9]\d{9})$/
  const emailregex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
  const passwordregex = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/
  
  function isValidPrice(value) {
    return /^[1-9]{1}\d*((\.)\d+)?$/.test(value)
  }
  const isValidName = function (value) {
    return /^[A-Za-z]+((\s)?[A-Za-z]+)*$/.test(value)
  }

  const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};
