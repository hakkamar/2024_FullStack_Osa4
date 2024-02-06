//require("dotenv").config();
const mongoose = require("mongoose");

/*
mongoose.set("strictQuery", false);

const mongoUrl = process.env.MONGODB_URI;
//console.log("connecting to", mongoUrl);

mongoose
  .connect(mongoUrl)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });
*/

/*
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        return /^(\d{2,3})[-](\d{4,9})$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    minlength: 8,
    required: true,
  },
});
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
*/
const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

//const Blog = mongoose.model("Blog", blogSchema);

module.exports = mongoose.model("Blog", blogSchema);
