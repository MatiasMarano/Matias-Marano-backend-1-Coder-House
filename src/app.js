import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './router/products.router.js';
import cartsRouter from './router/carts.router.js';
import viewsRouter from './router/views.router.js';
import ProductManager from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/products', productsRouter);
app.use('/carts', cartsRouter);
app.use('/', viewsRouter);

// Servidor HTTP
const PORT = 8080;
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

// Servidor de sockets
const io = new Server(httpServer);

// Instancia del ProductManager
const productManager = new ProductManager('./data/products.json');

io.on('connection', async (socket) => {
  console.log('Cliente conectado');

  // Enviar lista inicial
  socket.emit('updateProducts', await productManager.getProducts());

  // Agregar producto
  socket.on('newProduct', async (data) => {
    await productManager.addProduct(data);
    io.emit('updateProducts', await productManager.getProducts());
  });

  // Eliminar producto
  socket.on('deleteProduct', async (id) => {
    await productManager.deleteProduct(id);
    io.emit('updateProducts', await productManager.getProducts());
  });
});

export { io };
