//Importar dependencias y modulo
const bcrypt = require("bcrypt");
const moongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

//importar modelos
const User = require("../models/user");
const Follow = require("../models/follow");
const Publication = require("../models/publication");


// importar servicios

const jwt = require("../services/jwt");
const followService = require("../services/followService");
const follow = require("../models/follow");

//Acciones de prueba

const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controllers/user.js",
    usuario: req.user,
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
        status: "success",
        message: "Usuario Registrado Correctamente",
        user: userStored,
      });
    });
  });
};

const login = (req, res) => {
  //recoger parametros body

  let params = req.body;

  if (!params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "faltan datos por enviar",
    });
  }

  //buscar en la bbdd si existe

  User.findOne({ email: params.email })

    //.select({ password: 0 })
    .exec((error, user) => {
      if (error || !user)
        return res
          .status(404)
          .send({ status: "error", message: "No existe en al base de ddatos" });

      // compobar su contraseña
      const pwd = bcrypt.compareSync(params.password, user.password);

      if (!pwd) {
        return res.status(400).send({
          status: "error",
          message: "No te haz identificado correctamente",
        });
      }

      // Conseguir token

      const token = jwt.createToken(user);

      //Eliminar password del objeto

      // devolcer datos del usuario

      return res.status(200).send({
        status: "success",
        message: "te has identificado correctamente",
        user: {
          id: user._id,
          name: user.name,
          nick: user.nick,
        },
        token,
      });
    });
};

const profile = (req, res) => {
  //Recibir el parametro del id de usuario por la ulr

  const id = req.params.id;

  //Consulta para sacar los datos del usuario

  User.findById(id)
    .select({ password: 0, role: 0 })
    .exec(async (error, userProfile) => {
      if (error || !userProfile) {
        return res.status(404).send({
          status: "error",
          message: "El usuario no existe o hay un error",
        });
      }

      // Info de seguimiento
      const followInfo = await followService.followThisUser(req.user.id, id);

      //Devolver el resultado
      return res.status(200).send({
        status: "success",
        user: userProfile,
        following: followInfo.following,
        follower: followInfo.follower
      });
    });
};

const list = (req, res) => {
  //controlar que pagina estamos
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  page = parseInt(page);

  //consultar con moongoose paginate

  let itemsPerPage = 5;

  User.find()
    .select("-password -email -role -__v")
    .sort("_id")
    .paginate(page, itemsPerPage, async (error, users, total) => {
      if (error || !users) {
        return res.status(400).send({
          status: "success",
          message: "No hay usuarios disponibles",
          error
        });
      }
      // Sacar un array de ids de los usuarios que me siguen y los que sigo como Samuel
      let followUserIds = await followService.followUserIds(req.user.id);
      //devolver el resultado (posteriormente info follow)
      return res.status(200).send({
        status: "success",
        users,
        page,
        itemsPerPage,
        total,
        pages: Math.ceil(total / itemsPerPage),
        user_following: followUserIds.following,
        user_follow_me: followUserIds.followers
      });
    });
};

const update = (req, res) => {
  // Recoger info del usuario a actualizar

  let userIdentity = req.user;
  let userToUpdate = req.body;

  // Eliminar campos sobrantes

  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;
  delete userToUpdate.image;

  //Comprobar si el usuario ya existe

  User.find({
    $or: [
      { email: userToUpdate.email.toLowerCase() },
      { nick: userToUpdate.nick.toLowerCase() },
    ],
  }).exec(async (error, users) => {
    if (error)
      return res
        .status(500)
        .json({ status: "error", message: "Error en la consulta" });

    let userIsset = false;

    users.forEach((user) => {
      if (user && user._id != userIdentity.id) userIsset = true;
    });

    if (userIsset) {
      return res.status(200).send({
        status: "success",
        message: "El usuario ya existe",
      });
    }

    //cifrar la contraseña
    if (userToUpdate.password) {
      let pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    //añadido
    }else{
        delete userToUpdate.password;
    }

    //Buscar y actualizar
    try {
      let userUpdated = await User.findByIdAndUpdate({_id: userIdentity.id},userToUpdate,{new: true});

      if (!userUpdated)
        return res.status(400).json({ status: "error", message: "Error al actualizar" });

      // Devolver respuesta
      return res.status(200).send({
        status: "success",
        message: "Metodo de actualizar usuario",
        user: userUpdated,
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message: "Error al actualizar",
      });
    }
  });
};

const upload = (req, res) => {
  // Recoger el fichero de imagen y comprobar que existe

  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "Peticion no incluye imagen",
    });
  }

  // Conseguir el nombre del archivo

  let image = req.file.originalname;

  // Sacar la extension del archivo

  const imageSplit = image.split(".");
  const extension = imageSplit[1];

  // Comprobar extension

  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    // Borrar archivos subido
    const filePath = req.file.path;
    console.log(filePath);
    const fileDeleted = fs.unlinkSync(filePath);

    //Devolcer respuesta negativa
    return res.status(400).send({
      status: "error",
      message: "Extencion del fichero invalida",
    });
  }

  // Si es correcta, guardar imagen en bbdd
  User.findByIdAndUpdate({
    _id: req.user.id
  },
    { image: req.file.filename },
    { new: true },
    (error, userUpdated) => {
      if (error || !userUpdated) {
        return res.status(500).send({
          status: "error",
          message: "Error en la SUBIDA del Avatar",
        });
      }

      //Devolver respuesta
      return res.status(200).send({
        status: "success",
        user: userUpdated,
        file: req.file,
      });
    }
  );
};

const avatar = (req, res) => {

  // Sacar el parametro de la url

  const file = req.params.file;

  // Montar el path real de la imagen

  const filePath = "./uploads/avatars/" + file;

  // Comprobar que existe

  fs.stat(filePath, (error, exists) => {
    if (!exists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la imagen"
      });
    }

    // Devolver el file
    return res.sendFile(path.resolve(filePath));
  })

};

const counters = async (req, res) => {

  let userId = req.user.id;

  if (req.params.id) {
    userId = req.params.id;
  }

  try {
    const following = await Follow.count({ "user": userId });

    const followed = await Follow.count({ "followed": userId });
    
    const publications = await Publication.count({ "user": userId });

    return res.status(200).send({
      userId,
      following: following,
      followed: followed,
      publications: publications
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en los contadores",
      error
    });
  }
}

//Exportar acciones

module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
  counters
  
};
