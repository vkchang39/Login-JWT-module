// ANCHOR Adding modules
const express = require('express') // server handling
const multer = require('multer') // file upload handler
const sharp = require('sharp') // image handler or modifier
const auth = require('../middleware/auth')
const User = require('../models/user')
const {
    sendWelcomeEmail,
    sendCancelEmail
} = require('../emails/account')
const router = new express.Router()

// ANCHOR Creating a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        //sendWelcomeEmail(user.email, user.name) ANCHOR  Remove in prod
        const token = await user.generateAuthToken()
        res.status(201)
        res.send('Sucess...')
    } catch (e) {
        res.status(400).send(e)
    }
})

// ANCHOR GETTING CREDENTIALS FROM USER AND GENERATING A TOKEN
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send(e)
    }
})

// ANCHOR LOGUT ROUTER
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// ANCHOR LOGOUT ALL USER
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// ANCHOR User get request to server db to find user profile via authentication
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// ANCHOR Update a user 
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }

    try {
        const user = await req.user

        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        // findbyidandupdate bypasses mongoose thats why we cannot use below line
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }

})

// ANCHOR Deleting a user
router.delete('/users/me', auth, async (req, res) => {
    try {
        sendCancelEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

// ANCHOR upload details and filters
const upload = multer({
    dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload in supported format.'))
        }

        cb(undefined, true)
    }
})

// ANCHOR uploading user profile pic, modifying and error handling
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({
        width: 250,
        height: 250
    }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})

// ANCHOR deleting a user's profile pic
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// ANCHOR fetching user's profile pic from db
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

// ANCHOR Exporting or Routing this to index.js
module.exports = router