const jwt = require('jsonwebtoken');

// Verificar token
// ===================

let verificaToken = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED_TOKEN, (err, decode) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: 'Token no válido'
            });
        }

        req.usuario = decode.usuario;
        next();
    });
};

// Verificar Rol Admin
// ===================
let verificaAdminRol = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role == 'ADMIN_ROLE')
        next();
    else
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
};

// Verificar token IMG
// ===================
let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED_TOKEN, (err, decode) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: 'Token no válido'
            });
        }

        req.usuario = decode.usuario;
        next();
    });
}

module.exports = {
    verificaToken,
    verificaAdminRol,
    verificaTokenImg
}