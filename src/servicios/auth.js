const express = require("express");
const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// -------------------------
//  REGISTRO
// -------------------------
router.post("/register", async(req, res) => {
    try {
        const { nombre, email, password } = req.body;

        const existe = await Usuario.findOne({ email });
        if (existe) return res.status(400).json({ error: "El usuario ya existe" });

        const hashed = await bcrypt.hash(password, 10);

        const usuario = new Usuario({ nombre, email, password: hashed });
        await usuario.save();

        res.json({ message: "Usuario registrado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error en registro" });
    }
});

// -------------------------
//  LOGIN
// -------------------------
router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ message: "Usuario no encontrado" });

        const valido = await bcrypt.compare(password, usuario.password);
        if (!valido) return res.status(400).json({ message: "Contraseña incorrecta" });

        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });

        res.json({
            token,
            usuario: {
                _id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                estado: usuario.estado,
                fechaRegistro: usuario.fechaRegistro,
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
});

module.exports = router;