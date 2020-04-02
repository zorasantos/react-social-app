const functions = require('firebase-functions')
const app = require('express')()

const { getAllScreams, postOneScream, getScream } = require('./handlers/screams')
const { signup, login, uploadImage, addUserDetails, getAuthnticatedUser } = require('./handlers/users')
const FBAuth = require('./util/fbAuth')

app.get('/screams', getAllScreams)
app.post('/scream', FBAuth, postOneScream)
app.get('/scream/:screamId', getScream)

app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthnticatedUser)

exports.api = functions.region('europe-west1').https.onRequest(app)