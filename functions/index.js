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
    .then((data) => {
        let screams = []
        data.forEach((doc) => {
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt,
                commentCount: doc.data().commentCount,
                likeCount: doc.data().likeCount
            })
        })
        return res.json(screams)
    })
    .catch((err) => {
        console.error(err)
        res.status(500).json({ error: err.code })
    })
})

const FBAuth = (req, res, next) => {
    let idToken
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1]
    } else {
        console.error('Token não encontrado!')
        return res.status(403).json({ error: 'Não autorizado!' })
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken
            console.log(decodedToken)
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get()
        })
        .then(data => {
            req.user.handle = data.docs[0].data().handle
            return next()
        })
        .catch(err => {
            console.error('Erro ao verificar o token!', err)
            return res.status(403).json(err)
        })
}
app.post('/scream', FBAuth, (req, res) => {
    if (req.body.body.trim() === '') {
        return res.status(400).json({ body: 'Esse campo não pode estar vazio!' })
    }
    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString()
    }

        db
        .collection('screams')
        .add(newScream)
        .then((doc) => {
            res.json({ message: `Documento ${doc.id} criado com sucesso!` })
        })
        .catch(err => {
            res.status(500).json({ error: 'Ocorreu um erro!' })
            console.error(err)
        })
})
const isEmail = (email) => {
    const regEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if(email.match(regEx)) return true
    else return false
}

const isEmpty = (string) => {
    if(string.trim() === '') return true
    else return false
}
// Signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    }

    let errors = {}

    if(isEmpty(newUser.email)) {
        errors.email = 'Campo obrigatorio!'
    } else if(!isEmail(newUser.email)) {
        errors.email = 'Você deve inserir um email valido!'
    }

    if(isEmpty(newUser.password)) errors.password = 'Campo obrigatorio!'
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'As senhas não conferem!'
    if(isEmpty(newUser.handle)) errors.handle = 'Campo obrigatorio!'

    if(Object.keys(errors).length > 0) return res.status(400).json(errors)


    //TODO: validate data
    let token, userId
    db.doc(`/users/${newUser.handle}`)
      .get()
      .then( doc => {
          if(doc.exists) {
              return res.status(400).json({ handle: 'Este nickname ja existe!' })
          } else {
            return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password)          
          }
      })
      .then((data) => {
          userId = data.user.uid
          return data.user.getIdToken()
      })
      .then((idToken) => {
          token = idToken
          const userCredentials = {
              handle: newUser.handle,
              email: newUser.email,
              createdAt: new Date().toISOString(),
              userId
          }
          return db.doc(`/users/${newUser.handle}`).set(userCredentials)
      })
      .then(() => {
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
app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    let errors = {}
    if(isEmpty(user.email)) errors.email = 'Campo obrigatorio!'
    if(isEmpty(user.password)) errors.password = 'Campo obrigatorio!'

    if(Object.keys(errors).length > 0) return res.status(400).json(errors)

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.json({ token })
        })
        .catch(err => {
            console.error(err)
            if(err.code === 'auth/wrong-password') {
                return res.status(403).json({ general: 'Senha invalida, tente novamente!' })
            } else {
                return res.status(500).json({ error: err.code })
            }
        })
})

exports.api = functions.region('europe-west1').https.onRequest(app)