const  {Router} = require('express')
const { sendMail } = require('../utils/nodemailer')
const router = Router()


// router.get('/setCookie', (req, res)=>{
//     res.cookie('CoderCookie', "cookie poderosa", {maxAge: 10000}).send("cookie seteada")
// })


// router.get('/getCookie', (req, res)=>{
//     res.send(req.cookies)
// })
// router.get('setSignedCookie', (req,res) =>{
//     res.cookie("SIGNED COOKIE", "Esta cookie es inmutable", {masAge: 10000, signed:true}).send
// })

// router.get('/deleteCookie', (req, res)=>{
//     res.clearCookie("CoderCookie").send('Cookie removed')
// })



router.get('/pruebaMail', (req, res)=>{
  const enviado = sendMail
  res.send({
    status: 'Email enviado',
    payload: enviado})
})


router.get('/stringmuylargo', (req,res)=>{
  let string = "hola coder string muy larggooooooooooooooooo"
  for(let i=0; i<5e8; i++){
    string += "hola coder string muy larggooooooooooooooooo"
  }
  res.send(string)
})

router.get('/logger', (req, res) =>{
  // req.logger.warn('alerta')
  // req.logger.info('info')s
  req.logger.warning('warning')
  res.send({message: 'prueba de logger'})
})

router.get('/session', (req, res)=>{
  if (req.session.counter) {
        req.session.counter ++
        res.send(`se ha visitado el sitio ${req.session.counter} veces`)
  } else {
    req.session.counter = 1
    res.send('Bienvenido')
  }
})

module.exports = router