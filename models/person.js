const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
  name: String,
  phone: Number,
  address: String,
  imgUrl: String,
});

module.exports = new mongoose.model("Person", personSchema);
