const express = require('express');

let { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

// Mostrar todas las productos
app.get('/producto', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    // let limite = req.query.limite || 5;
    // limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: err
                });
            }

            Producto.count({ disponible: true }, (err, conteo) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err: err
                    });
                }

                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });
            })
        })
});

// Mostrar producto por ID
app.get('/producto/:id', verificaToken, (req, res) => {
    Producto.findById(req.params.id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        })
});

// Buscar productos
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        })
});

// Crear nueva producto
app.post('/producto', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });
});

// Actualizar producto
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;

        productoDB.save((err, _productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: _productoDB
            });
        })

    })
});

// Eliminar producto (solo puede borrar Admin)
app.delete('/producto/:id', [verificaToken, verificaAdminRol], (req, res) => {
    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe.'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, _productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: _productoDB,
                message: 'Producto borrado'
            });
        })
    })
});


module.exports = app;