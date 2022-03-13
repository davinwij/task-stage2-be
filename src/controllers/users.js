const { users, transaction } = require('../../models')

const Joi = require('joi')
const bycrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


exports.addUsers = async (req, res) => {
    try {
        const data = req.body

        await users.create(data)

        res.send({
            status: "success",
            message: "Add user success"
        })

    } catch (error) {
        res.send({
            status: "failed",
            message: "Server error"
        })
    }
}

exports.userRegister = async (req, res) => {
    try {
        const {email} = req.body

        const data = await users.findOne({
            where:{
                email: `${email}`,        
            }
        })        

        if(data){
            res.send({
                status: "register failed",
                message: "email already exist"
            })    
        }else{
            const data = req.body   
            
            const salt = await bycrypt.genSalt(10)
            const hashPassword = await bycrypt.hash(req.body.password, salt)

            const schema = Joi.object({
                email: Joi.string()
                    .email()
                    .min(5)
                    .required(),

                password: Joi.string()
                    .min(6)
                    .required(),

                fullname: Joi.string()
                    .required()
                    .min(5)
            })

            const {error} = schema.validate(data)

            if(error){
                return res.status(400).send({
                    status: "failed",
                    message: error.details[0].message
                })
            }

            await users.create({
                email: data.email,
                password: hashPassword,
                fullname: data.fullname,
                role: "user"
            })

            const dataToken ={
                id: data.id
            }                 

            //secret key harusnya di .env
            const SECRET_KEY = "secret"            
            const token = jwt.sign(dataToken, SECRET_KEY)
                

            res.status(200).send({
                status: "success",
                data: {
                    user:{
                        email: data.email,                        
                        token: token
                    }              
                }      
            })
        }
    } catch (error) {
        res.send({
            status: "failed",
            message: `Server error ${error}`
        })
        
    }
}

exports.userLogin = async (req, res) => {
    try {
        const {email, password} = req.body
        
        const data = await users.findOne({
            where:{
                email: `${email}`,                                
            },
            attributes:{
                exclude: ['createdAt', 'updatedAt']
            }
        })        
            
        if(!data){
            return res.status(400).send({
                status: "failed",
                message: "email & password doesnt exist"
            })
        }else{                                
            const isValid = await bycrypt.compare(password, data.password)
            
            const dataToken ={
                id: data.id,
                name: data.fullname
            }                                            

            //secret key harusnya di .env
            const SECRET_KEY = "secret"            
            const token = jwt.sign(dataToken, SECRET_KEY)         
                       
            if(!isValid){
                return res.status(400).send({
                    status: "400",
                    message: "Login Failed, Email & Password doesnt match"
                })
            } else {
                return res.status(200).send({
                    status: "success",
                    data: {
                        user:{
                            email: data.email,                        
                            token: token
                        }              
                    }                    
                })                
            }            
        }


    } catch (error) {
        res.send({
            status: "failed",
            message: error
        })            
    }   
}

exports.getUsers = async (req, res) => {
    try {
        const data = await users.findAll({
            attributes:{
                exclude: ['createdAt', 'updatedAt', 'password', 'role']
            }
        })

        if(data){
            return res.status(200).send({
                status: "success",
                data: {
                    users: data                                
                }                    
            })
        }else{
            return res.status(400).send({
                status: "failed",
                message: "No data"      
            })        
        }
        
        
    } catch (error) {
        res.send({
            status: "failed",
            message: "Server Error"
        })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        
        const data = await users.destroy({
            where:{
                id: id
            }
        })
        
        if(data){
            return res.status(200).send({
                status: "success",
                data: {
                    id: id
                }
            })            
        }else{
            return res.status(400).send({
                status: "failed",
                message: "No data"      
            })        
        }        
    } catch (error) {
        res.send({
            status: "failed",
            message: "Server Error"
        })        
    }
}