const isEmail = (email) => {
  const regEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if(email.match(regEx)) return true
  else return false
}

const isEmpty = (string) => {
  if(string.trim() === '') return true
  else return false
}

// const objectKey = (errors) => {
//     return {
//         errors,
//         valid: Object.keys(errors).length === 0 ? true : false
//     }
// }

exports.validateSignupData = (data) => {
  let errors = {}

  if(isEmpty(data.email)) {
    errors.email = 'Campo obrigatorio!'
  } else if(!isEmail(data.email)) {
    errors.email = 'Você deve inserir um email valido!'
  }

  if(isEmpty(data.password)) errors.password = 'Campo obrigatorio!'
  if(data.password !== data.confirmPassword) errors.confirmPassword = 'As senhas não conferem!'
  if(isEmpty(data.handle)) errors.handle = 'Campo obrigatorio!'

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}

exports.validateLoginData = (data) => {
  let errors = {}
  if(isEmpty(data.email)) errors.email = 'Campo obrigatorio!'
  if(isEmpty(data.password)) errors.password = 'Campo obrigatorio!'

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}

exports.reduceUserDetails = (data) => {
  let userDetails = {}
  if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio
  if(!isEmpty(data.website.trim())) {
    if(data.website.trim().substring(0, 4) !== 'http') {
      userDetails.website = `http://${data.website.trim()}`
    } else userDetails.website = data.website
  }
  if(!isEmpty(data.location.trim())) userDetails.location = data.location
  return userDetails
}