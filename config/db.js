const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("MONGODB CONNECTED");
  } catch (error) {
    console.log(error.message);
    process.exit(1); //to process with failure
  }
};

module.exports = connectDB;
