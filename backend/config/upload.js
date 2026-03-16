const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../frontend/assets/img"));
    },

    filename: function (req, file, cb) {
        const nombreUnico = Date.now() + path.extname(file.originalname);
        cb(null, nombreUnico);
    }

});

const upload = multer({ storage });

module.exports = upload;