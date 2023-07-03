//Importar dependencias y modulo
const User = require("../models/user");
const bcrypt = require("bcrypt");

//Acciones de prueba

const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controllers/user.js",
  });
};

//Registro de usuarios

const register = (req, res) => {
  //recoger datos de la peticion

  let params = req.body;

  //comprobar que me llega bien + validacion

  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }

  //control de usuarios duplicados

  User.find({
    $or: [
      { email: params.email.toLowerCase() },
      { nick: params.nick.toLowerCase() },
    ],
  }).exec(async (error, users) => {
    if (error)
      return res
        .status(500)
        .json({ status: "error", message: "Error en la consulta" });

    if (users && users.length >= 1) {
      return res.status(200).send({
        status: "success",
        message: "El usuario ya existe",
      });
    }

    //cifrar la contraseña

    let pwd = await bcrypt.hash(params.password, 1);
    params.password = pwd;

    //Crear objeto de usuario

    let user_to_save = new User(params);
    //guardar usuario

    user_to_save.save((error, userStored) => {
      if (error || !userStored)
        return res
          .status(500)
          .send({ status: "error", message: "Error al guardar el usuario" });

      //devolver resultado
      return res.status(200).json({
        status: "SUCCESS",
        message: "Usuario Registrado Correctamente",
        user: userStored,
      });
    });
  });
};

//Exportar acciones

module.exports = {
  pruebaUser,
  register,
};
