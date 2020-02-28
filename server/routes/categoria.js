const express = require('express');

let { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

// Mostrar todas las categorias
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email') //1 parametro coleccion de relacion, 2 parametro campos que quiero mostrar
        .exec((err, categoriasDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias: categoriasDB
            })
        })
});

// Mostrar categoria por ID
app.get('/categoria/:id', verificaToken, (req, res) => {
    Categoria.findById(req.params.id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            Categoria: categoriaDB
        });
    })
});

// Crear nueva categoria
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// Actualizar categoria
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

// Eliminar categoria (solo puede borrar Admin)
app.delete('/categoria/:id', [verificaToken, verificaAdminRol], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe.'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoría eliminada'
        });
    })
});


module.exports = app;