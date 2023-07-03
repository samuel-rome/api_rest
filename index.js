// importar las dependencias

const connection = require("./database/connection");

const express = require("express");

const cors = require("cors");

//MENSAJE DE BIENVENIDA

console.log("Bienvenido a mi API");

// Conexion a bbdd

connection();

// Crear servidor node

const app = express();
const port = 3900;

// Configurar cors

app.use(cors());

// Convertir Los datos del body a objetos js

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cargar conf rutas

const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);

//ruta de prueba

app.get("/ruta-prueba", (req, res) => {
  return res.status(200).json({
    id: 1,
    nombre: "Samuel",
    web: "facebook.com",
  });
});

// Poner servidor a escuchar peticiones hhtp

app.listen(port, () =>
  console.log("Servidor de node ejecutando en el puerto: ", port)
);
