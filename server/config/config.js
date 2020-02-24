// PUERTO
//======================
process.env.PORT = process.env.PORT || 3000;

// ENTORNO
//======================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// BASE DE DATOS
//======================
let urlDB;

if (process.env.NODE_ENV === 'dev')
    urlDB = 'mongodb://localhost:27017/cafe';
else
    urlDB = process.env.MONGO_URI;

process.env.URLDB = urlDB;

// TOKEN (60 seg * 60 min * 24 horas * 30 dias)
//======================
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;
process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'este-es-el-secre-dev';