const { NOW } = require('sequelize')
const { MEDIUMINT } = require('sequelize')
const { book } = require('../../models')

exports.addBook = async (req, res) => {
    try {
        
        const addData = req.body        
        
        await book.create({
            ...addData,
            bookFile: req.file.filename
        })            

        const data = await book.findOne({
            where:{
                title: addData.title
            },
            attributes:{
                exclude: ['createdAt', 'updatedAt']
            }
        })

            res.status(200).send({
                status: "success",
                data: {
                    book: data                    
                }      
            })

    } catch (error) {
        res.status(400).send({
            status: "failed",
            message: "Server error"
        })
    }
}

exports.getBooks = async (req,res) => {
    try {
        let data = await book.findAll()
        
        if(!data){
            return res.status(400).send({
                status: "failed",
                message: "no data"
            })
        }

        data = JSON.parse(JSON.stringify(data))

        res.status(200).send({
            status: "success",
            data:{
                books: {
                    ...data,                    
                }
            }
        })


    } catch (error) {
        res.status(400).send({
            status: "failed",
            message: `Server error, ${error}`
        })
    }
}

exports.getBookDetail = async (req, res) => {
    try {
        const { id } = req.params

        const data = await book.findOne({
            where:{
                id: id
            }
        })        


        if(!data){
            return res.status(400).send({
                status: "failed",
                message: `no data with id ${id}`
            })
        }

        res.status(200).send({
            message:"success",
            data:{
                book: data
            }
        })

    } catch (error) {
        res.status(400).send({
            status: "failed",
            message: "Server error"
        })        
        console.log(error)
    }
}

exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params
        const data = req.body            

        const bookData = await book.findOne({
            where:{
                id: id
            }
        })

        if(bookData){
            await book.update(
                data,
                {
                where:{
                    id: id
                }
            })

            const updatedData = await book.findOne({
                where:{
                    id: id
                }
            })

            res.status(200).send({
                message:"success",
                data:{
                    book: updatedData
                }
            })
        }else{
            res.status(400).send({
                status: "failed",
                message: `no data with id ${id}`
            })  
        }
        

    } catch (error) {
        res.status(400).send({
            status: "failed",
            message: `Server error, ${error}`
        })                        
    }
}

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params

        const data = await book.destroy({
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
        res.status(400).send({
            status: "failed",
            message: `Server error, ${error}`
        })        
    }
}

const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

const monthConverter = async (date) =>{
    const monthIndex = date.getMonth()
    const year = date.getFullYear()

    return `${month[monthIndex-1]} ${year}`
}

const dateConverter = (date) => {
    const second = date / 1000
    const minute = second / 60
    const hour = minute / 60
    const day = hour / 24
}
