const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/mi_redsocial");

    console.log("CONECTADO A LA BASE DE DATTOS");
  } catch (error) {
    console.log(error);
    throw new Error("No se conecto a la ddbb");
  }
};

module.exports = connection;
