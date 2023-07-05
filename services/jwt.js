//importar dependencias

const jwt = require("jwt-simple");
const moment = require("moment");

// clave secreta

const secret = "CLAVE_SECRETA_DEL_PROYECTO_567";

// crear una funcion para generar token

const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  // devolver jwt token codificado

  return jwt.encode(payload, secret);
};

module.exports = {
  secret,
  createToken,
};
