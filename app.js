const express = require('express');
var bodyParser = require('body-parser')
var multer = require("multer")
const { uuid } = require('uuidv4');
var path = require("path")
const app = express();
var fs = require("fs")
var tf = require("@tensorflow/tfjs-node")

const PORT = 5000;

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./static/images/")
    },
    filename: (req, file, callback) => {

        callback(null, uuid() + "-" + file.originalname)
    }
})

const upload = multer({
    storage: storage
});
app.use(express.json());
app.post('/', upload.single('image'), async (req, res) => {
    try {
        const imageURL = "./static/images/" + req.file.filename
        fs.readFile(imageURL, async (err, data) => {
            try {
                // load đường model
                const model = await tf.loadLayersModel("file://static/mnist-model-10e-6f-ver2/model.json");
                if (model) {
                    // TODO: làm nốt định dạng cho ảnh
                    // ảnh là data
                    
                    const predict = await model.predict(data).array();
                    
                    res.writeHead(200, { 'Content-Type': 'image/jpeg' })
                    res.end(predict) // Send the file data to the browser.
                } else {
                    throw new Error("cant load model")
                }
            } catch (error) {
                res.status(400);
                res.json({
                    code: error.message
                })
            }
        })
        // res.json(image)
    } catch (err) {
        res.status(400);
        res.json({
            code: err.message
        })
    }
})


app.use("/static", express.static(path.join(__dirname + '/static')));
app.listen(PORT, (error) => {
    if (!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT)
    else
        console.log("Error occurred, server can't start", error);
}
);