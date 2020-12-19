const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
});
const fileFilter = function (req, file, cb) {
    if(file.mimetype=="image/bmp" || file.mimetype=="image/png" || file.mimetype=="image/jpeg" || file.mimetype=="image/jpg"){
        cb(null, true)
    }else{
        return cb(new Error('Only image are allowed!'))
    }
}
var uploadImage = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fieldSize: 3 * 1024 * 1024 }
})

module.exports = uploadImage;