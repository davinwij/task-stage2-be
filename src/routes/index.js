const express = require('express')

const router = express.Router()

const cron = require('node-cron')

const { auth, adminAuth } = require('../middlewares/auth')
const { uploadFile } = require('../middlewares/uploadFile')

const { addUsers, userLogin, userRegister, getUsers, deleteUser, checkAuth, getUserBook} = require('../controllers/users')
const { addBook, getBooks, getBookDetail, updateBook, deleteBook, addToList} = require('../controllers/books')
const { addTransaction, updateTransaction, getTransaction, getTransactions, updateUserRemaining } = require('../controllers/transaction')

router.post('/user', auth ,addUsers) //place middleware before controllers
router.get('/users', auth, getUsers)
router.delete('/user/:id', deleteUser)
router.post('/login', userLogin)
router.post('/register', userRegister)
router.get('/check-auth', auth, checkAuth)

//book
router.post('/book', adminAuth, uploadFile('imageFile', 'bookFile'), addBook)
router.get('/books', getBooks)
router.get('/book/:id', getBookDetail)
router.patch('/book/:id', auth,updateBook)
router.delete('/book/:id', auth, deleteBook)
router.post('/addlist/:id', auth, addToList)
router.get('/userbook', auth, getUserBook)

//transaction
router.post('/transaction', auth, uploadFile('transferProof', ''), addTransaction)
router.patch('/transaction/:id', updateTransaction)
router.get('/transaction', getTransactions)
router.get('/user-transaction', auth, getTransaction)

cron.schedule('* * * * *', function(){
    updateUserRemaining()
})

module.exports = router