const jwt = require('jsonwebtoken')

exports.auth = (req, res, next) => {
    const authHeader = req.header("Authorization")

    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        return res.status(401).send({
            message: "Access Denied"
        })
    }

    try {
        const SECRET_KEY = process.env.TOKEN_KEY
        const verified = jwt.verify(token, SECRET_KEY)

        req.user = verified    

        next()

    } catch (error) {
        return res.status(400).send({
            message: "Invalid Token"
        })
    }

}

exports.adminAuth = (req, res, next) => {
    const authHeader = req.header("Authorization")

    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        return res.status(401).send({
            message: "Access Denied, Only Admin can Add book"
        })
    }

    try {
        const SECRET_KEY = process.env.TOKEN_KEY
        const verified = jwt.verify(token, SECRET_KEY)

        req.user = verified

        if(req.user.role !== "admin"){
            return res.status(400).send({
                message: "Access Denied, Only Admin can Add book"
            })
        }else{
            next()
        }

    } catch (error) {
        return res.status(400).send({
            message: "Invalid Token"
        })
    }


}