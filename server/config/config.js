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

// TOKEN (48h)
//======================
process.env.CADUCIDAD_TOKEN = '48h';
process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'este-es-el-secre-dev';

// GOOGLE
//======================
process.env.CLIENT_ID = process.env.CLIENT_ID || '209260946719-h4fvlkbv65q2ddgee4ddbkf8mm6u6mb5.apps.googleusercontent.com';