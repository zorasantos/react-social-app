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
firebase.initializeApp(firebaseConfig)

const db = admin.firestore()


app.get('/screams', (req, res) => {
    db
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

        db
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
    db.doc(`/users/${newUser.handle}`).get()
      .then( doc => {
          if(doc.exists) {
              return res.status(400).json({ handle: 'Este nickname ja existe!' })
          } else {
            return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password)          
          }
      })
      .then(data => {
          return data.user.getIdToken()
      })
      .then((token) => {
          return res.status(201).json({ token })
      })
      .catch((err) => {
          console.error(err)
          if (err.code === 'auth/email-already-in-use') {
              return res.status(400).json({ email: 'Email ja cadastrado!' })
          } else {
              return res.status(500).json({ error: err.code })
          }
      })
})

exports.api = functions.region('europe-west1').https.onRequest(app)