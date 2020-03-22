const { admin, db } = require('../util/admin')

module.exports = (req, res, next) => {
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