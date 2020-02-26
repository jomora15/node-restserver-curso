const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res) => {
    let body = req.body; //Obtengo el body

    //Encuentro el usuario por el correo
    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioBD) { //Evaluo si no existe el usuario
            return res.status(400).json({
                ok: false,
                err: {
                    message: "(Usuario) o contraseña incorrectos."
                }
            });
        }

        //Comparo la contraseña normal con la encriptada (bcrypt ya hace la validación)
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o (contraseña) incorrectos."
                }
            });
        }

        //Genero el token
        let token = jwt.sign({
            usuario: usuarioBD
        }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioBD,
            token
        });
    });
});

// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken; //Obtengo el token de Google
    let googleUser = await verify(token) //Valido el token
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => { //Verifico que el correo no exista
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (usuarioBD) { //Si existe valido el tipo de registro
            if (!usuarioBD.google) { //Si no es Google le digo que ingrese con contraseña
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Ud ya se encuentra registrado con usuario y contraseña'
                    }
                });
            } else { //Si es Google le permito el ingreso
                //Genero el token
                let token = jwt.sign({
                    usuario: usuarioBD
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioBD,
                    token
                });
            }
        } else {
            //Como no existe lo registro
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                //Genero el token
                let token = jwt.sign({
                    usuario: usuarioBD
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioBD,
                    token
                });
            });
        }
    })
});



module.exports = app;