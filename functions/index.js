const functions = require('firebase-functions')
const admin = require('firebase-admin')

const app = require('express')()
admin.initializeApp()

var firebaseConfig = {
    apiKey: "AIzaSyA7mMKjfGInNBOf0QPvy6sEonQblLi3LD4",
    authDomain: "react-social-app-248c7.firebaseapp.com",
    databaseURL: "https://react-social-app-248c7.firebaseio.com",
    projectId: "react-social-app-248c7",
    storageBucket: "react-social-app-248c7.appspot.com",
    messagingSenderId: "31290543404",
    appId: "1:31290543404:web:6219122470a52215f5b089"
  }
  

const firebase = require('firebase')
// Initialize Firebase
firebase.initializeApp(firebaseConfig)


app.get('/screams', (req, res) => {
    admin
        .firestore()
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = []
            data.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                })
            })
            return res.json(screams)
        })
        .catch((err) => console.error(err))
})
app.post('/screams', (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    }

    admin.firestore()
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({ message: `Documento ${doc.id} criado com sucesso!` })
        })
        .catch(err => {
            res.status(500).json({ error: 'Ocorreu um erro!' })
            console.error(err)
        })
})
// Signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    }
    //TODO: validate data
    firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then((data) => {
            return res
                .status(201)
                .json({ message: `Usuario ${data.user.uid} criado com sucesso!`  })
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).json({ error: err.code })
        })
})

exports.api = functions.region('europe-west1').https.onRequest(app)