import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import methodOverride from 'method-override';

import productsRouter from './router/products.router.js'; // FRONT
import cartsRouter from './router/carts.router.js';       // FRONT
import viewsRouter from './router/views.router.js';       // FRONT extra (home)

import cartsApiRouter from './router/carts.api.router.js'; // POSTMAN JSON
import productsApiRouter from './router/products.api.router.js'; // POSTMAN JSON
import { connectDB } from './config/db.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method')); // permite PUT y DELETE desde formularios

// Handlebars
app.engine('handlebars', engine({
  helpers: {
    multiply: (a, b) => a * b,
    add: (a, b) => a + b
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Routers
app.use('/api/products', productsApiRouter); // POSTMAN JSON
app.use('/api/carts', cartsApiRouter);       // POSTMAN JSON

app.use('/products', productsRouter);        // FRONT productos
app.use('/carts', cartsRouter);              // FRONT carritos
app.use('/', viewsRouter);                   // FRONT home

// DB + Server
const PORT = process.env.PORT || 8080;
await connectDB(process.env.MONGODB_URI);
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
