const { users, transaction, userBookList, book} = require('../../models')

const Joi = require('joi')
const bycrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


exports.addUsers = async (req, res) => {
    try {
        const data = req.body

        const salt = await bycrypt.genSalt(10)
        const hashPassword = await bycrypt.hash(data.password, salt)

        await users.create({
            email: data.email,
            password: hashPassword,
            fullname: data.fullname,
            role: data.role
        })

        res.send({
            status: "success",
            message: "Add user success"
        })

    } catch (error) {
        res.send({
            status: "failed",
            message: `Server error, ${error}`    
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
            res.status(400).send({
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
            const SECRET_KEY = process.env.TOKEN_KEY           
            console.log(SECRET_KEY)
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
                name: data.fullname,
                role: data.role
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
                            id: data.id,
                            email: data.email,
                            role: data.role,                        
                            token: token,
                            fullname: data.fullname
                        }              
                    }                    
                })                
            }            
        }


    } catch (error) {
        res.status(400).send({
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

exports.checkAuth = async (req, res) => {
    try {
      const id = req.user.id;
  
      const dataUser = await users.findOne({
        where: {
          id,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      });
  
      if (!dataUser) {
        return res.status(404).send({
          status: "failed",
        });
      }
  
      res.status(200).send({
        status: "success...",
        data: {
          user: {
            id: dataUser.id,
            fullname: dataUser.fullname,
            email: dataUser.email,
            role: dataUser.role,
          },
        },
      });
    } catch (error) {
      console.log(error);
      res.status({
        status: "failed",
        message: "Server Error",
      });
    }
};

exports.getUserBook = async (req, res) => {
    try {
        const { id } = req.user

        const data = await book.findAll({            
            include: [
                {
                    model: users,
                    as: "userList",
                    through: {
                        model: userBookList,
                        as: "bridge",
                        attributes:{
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    where:{
                        id
                    },
                    attributes:{
                        exclude: ["createdAt", "updatedAt", "email", "password", "role", ]
                    }
                }
            ],
            attributes:{
                exclude: ["createdAt", "updatedAt"]
            }
        })

        if(!data){
            res.status(400).send({
                status: "failed",
                message: `No data`
            })   
        }else{
            res.status(200).send({
                status: "success",
                data: data
            })
        }
        

    } catch (error) {
        res.status(400).send({
            status: "failed",
            message: `Server error, ${error}`
        })   
    }
}


