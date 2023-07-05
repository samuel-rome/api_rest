// importar modulos

const jwt = require("jwt-simple");
const moment = require("moment");

//importar claves secreta

const libjwt = require("../services/jwt");
const secret = libjwt.secret;

//MIDDLEWARE DE AUTENTICACION

exports.auth = (req, res, next) => {
  //comprobar si me llega la cabecera de auth

  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message: "La peticion no tiene la cabecera de autenticacion",
    });
  }

  // limpiar el token

  let token = req.headers.authorization.replace(/['"]+/g, "");

  // decodificar el token

  try {
    let payload = jwt.decode(token, secret);


    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        status: "error",
        message: "token expirado",
        
      });
    }

    // agregar datos de usuario a request

    req.user = payload;

  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "token invalido",
      error,
    });
  }

  // pasar a ejecucion de accion

  next();
};
