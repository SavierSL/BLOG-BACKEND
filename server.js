const express = require("express"); //routing
const connectDB = require("./config/db"); //to connect in database
const app = express();

connectDB(); //connect to DB

app.get("/", (req, res) => {
  res.send("connected to port hehe");
});

//Init Middleware
app.use(express.json({ extended: false }));

//Define Routes
app.use("/api/users", require("./config/routers/users"));

//we a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Started in port: ${PORT}`);
});
