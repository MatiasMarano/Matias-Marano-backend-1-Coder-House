import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import productsRouter from './router/products.router.js';
import cartsRouter from './router/carts.router.js';
import viewsRouter from './router/views.router.js';
import { connectDB } from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Routers (API y vistas)
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// DB + Server
const PORT = process.env.PORT || 8080;
await connectDB(process.env.MONGODB_URI);

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
