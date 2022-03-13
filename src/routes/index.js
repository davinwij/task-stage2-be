const express = require('express')

const router = express.Router()

const { auth } = require('../middlewares/auth')
const { uploadFile } = require('../middlewares/uploadFile')

const { addUsers, userLogin, userRegister, getUsers, deleteUser} = require('../controllers/users')
const { addBook, getBooks, getBookDetail, updateBook, deleteBook } = require('../controllers/books')
const { addTransaction, updateTransaction, getTransaction, getTransactions } = require('../controllers/transaction')

router.post('/user' ,auth ,addUsers) //place middleware before controllers
router.get('/users', getUsers)
router.delete('/user/:id', deleteUser)
router.post('/login', userLogin)
router.post('/register', userRegister)

//book
router.post('/book', auth, uploadFile('bookFile'), addBook)
router.get('/books', getBooks)
router.get('/book/:id', getBookDetail)
router.patch('/book/:id', auth,updateBook)
router.delete('/book/:id', auth, deleteBook)

//transaction
router.post('/transaction', auth, uploadFile('transferProof'), addTransaction)
router.patch('/transaction/:id', auth, updateTransaction)
router.get('/transaction', getTransactions)
router.get('/transaction/:id', getTransaction)

module.exports = router