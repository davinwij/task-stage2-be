const { transaction, users } = require('../../models')


exports.addTransaction = async (req, res) => {
    try {
        const { id, name } = req.user

        const defaulData = {
            transferProof: req.file.filename,
            remainingActive: 0,            
            userStatus: "Not Active",
            paymentStatus: "Pending",        
        }

        const newTransaction = await transaction.create({            
            idUser: id,
            transferProof: req.file.filename,            
            ...defaulData
        })

        res.status(200).send({
            status: "success",
            data:{
                transaction:{
                    users: {
                        id: id,
                        name: name
                    },
                    ...defaulData
                }
            }
        })

    } catch (error) {
        res.status(400).send({
            status: "failed",
            message: error
        })            
    }
}

exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params

        let { paymentStatus } = req.body       

        const approvedData = {
            remainingActive: 30,            
            userStatus: "Active",
            paymentStatus: "Approved", 
        }

        const rejectedData = {
            remainingActive: 0,            
            userStatus: "Not Active",
            paymentStatus: "Cancel", 
        }            
        
        paymentStatus = JSON.parse(JSON.stringify(paymentStatus))        

        if(paymentStatus === "Approved"){
            await transaction.update(approvedData,{       
                where:{
                    id: id
                }
            })

            const updatedData = await transaction.findOne({
                include: {
                        model: users,
                        as: 'user',
                        attributes:{
                            exclude: ['email', 'password', 'role', 'createdAt', 'updatedAt']
                        }
                    },
                where:{
                    id: id
                },
                attributes:{
                    exclude: ['createdAt', 'updatedAt']
                }
            })    

            res.status(200).send({
                status: "success",
                data: {
                    transaction: updatedData                    
                }
            })
        }else{
            await transaction.update(rejectedData,{                              
                where:{
                    id: id
                }
            })

            const updatedData = await transaction.findOne({
                include: 
                    {
                        model: users,
                        as: 'user',
                        attributes:{
                            exclude: ['email', 'password', 'role', 'createdAt', 'updatedAt']
                        }
                    },
                where:{
                    id: id
                },
                attributes:{
                    exclude: ['createdAt', 'updatedAt']
                }
            })    

            res.status(200).send({
                status: "success",
                data: {
                    transaction: updatedData                                    
                }
            })

        }    

    } catch (error) {
        res.status(400).send({
            status: "failed",
            message: error
        })   
        console.log(error)
    }
}


exports.getTransactions = async (req, res) => {
    try {
        const data = await transaction.findAll({
            include: 
            {
                model: users,
                as: 'user',
                attributes:{
                    exclude: ['email', 'password', 'role', 'createdAt', 'updatedAt']
                }
            },
            attributes:{
                exclude: ['createdAt', 'updatedAt']
            }
        })



        if(data){
            res.status(200).send({
                status: "success",
                data: {
                    transaction: data
                }
            })
        }else{
            res.status(200).send({
                status: "success",
                data: {
                    transaction: "No Data"
                }
            })            
        }

    } catch (error) {
        res.status(400).send({
            status: "failed",
            message: error
        })   
        console.log(error)
    }
}

exports.getTransaction = async (req, res) => {
    try {
        const id  = req.user.id
        
        const data = await transaction.findOne({
            include: 
            {
                model: users,
                as: 'user',
                attributes:{
                    exclude: ['email', 'password', 'role', 'createdAt', 'updatedAt']
                }
            },
            where:{
                idUser: id
            },
            attributes:{
                exclude: ['createdAt', 'updatedAt']
            }
        })    

        if(data){
            res.status(200).send({
                status: "success",
                data: {
                    transaction: data
                }
            })
        }else{
            res.status(200).send({
                status: "success",
                data: {
                    transaction: "No Data"
                }
            })            
        }


    } catch (error) {
        res.status(400).send({
            status: "failed",
            message: error
        })   
        console.log(error)
    }
}

exports.updateUserRemaining = async(req, res) => {
    try {
        const getData = await transaction.findAll()

        for (let i = 0; i < getData.length; i++) {
            if(getData[i].remainingActive > 0){
                await transaction.update({remainingActive: getData[i].remainingActive - 1},{
                    where:{
                        id: getData[i].id
                    }
                })
            }else{
                const rejectedData = {
                    remainingActive: 0,            
                    userStatus: "Not Active",
                    paymentStatus: "Cancel", 
                }     

                await transaction.update(rejectedData, {
                    where:{
                        id: getData[i].id
                    }
                })
            }
        }

    } catch (error) {

    }
}
