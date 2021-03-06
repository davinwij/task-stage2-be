const multer = require('multer')

exports.uploadFile = (imageFile, bookFile) => {
    const storage = multer.diskStorage({
        destination: function(req, res, cb) {
            cb(null, "uploads")
        },
        filename: function(req, file, cb){
            cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ""))
        }
    })

    const fileFilter = function(req, file, cb){
        if(file.fieldname === imageFile){
            if(!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)){
                req.fileValidationError = {
                    message: "Only image file are allowed"
                }
                return cb(new Error("Only image file are allowed"), false)
            }
        }
        if(file.fieldname === bookFile){
            if(!file.originalname.match(/\.(epub|EPUB)$/)){
                req.fileValidationError = {
                    message: "File type not allowed"
                }
                return cb(new Error("Only image file are allowed"), false)  
            }
        }
        cb(null, true)
    }

    const sizeInMB = 10
    const maxSize = sizeInMB * 1000 * 1000

    const upload = multer({
        storage,
        fileFilter,
        limits:{
            fileSize: maxSize
        }
    }).fields([
        {name: imageFile},
        {name: bookFile}
    ])

    return(req, res, next) => {
        upload(req, res, function(err){
            if(req.fileValidationError){
                return res.status(400).send(req.fileValidationError)
            }
            
            if(!req.files.bookFile && !err ){
                return res.status(400).send({
                    message: "Please select file to upload"                    
                })
            }

            if(!req.files.imageFile && !err ){
                return res.status(400).send({
                    message: "Please select file to upload"                    
                })
            }
            
            if(err){
                if(err.code == "LIMIT_FILE_SIZE"){
                    return res.status(400).send({
                        message: "Max file size 10MB"
                    })            
                }
                return res.status(400).send(err)
            }
            return next()            
        })
    }
}

