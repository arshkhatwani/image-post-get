const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

require("dotenv").config();
const DB_URL = process.env.DB_URL;

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

const mongoose = require("mongoose");
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", () => console.log("Database not connected"));
db.once("open", () => console.log("Connected to the Database"));

const personModel = require("./models/person");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/uploads"));

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "./frontend/index.html"));
});

app.get("/getData", async (req, res) => {
  try {
    const foundData = await personModel.find();
    res.status(200).json(foundData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Could not send data" });
  }
});

app.post("/submitData", upload.single("imgFile"), async (req, res) => {
  try {
    var newPerson = new personModel({
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      imgUrl: `${req.file.filename}`,
    });
    const savedData = await newPerson.save();
    console.log(savedData);
    res.redirect("/");
  } catch (err) {
    res.status(400).json({ status: "error", message: "Bad Request" });
  }
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
