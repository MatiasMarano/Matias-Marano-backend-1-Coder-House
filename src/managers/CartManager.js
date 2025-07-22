import fs from 'fs/promises';
import path from 'path';

export class CartManager {
  constructor() {
    this.path = path.resolve('data/carts.json');
  }

  async getCarts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveCarts(carts) {
    await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
  }

  async createCart() {
    const carts = await this.getCarts();

    const newId = carts.length ? carts[carts.length - 1].id + 1 : 1;
    const newCart = {
      id: newId,
      products: []
    };

    carts.push(newCart);
    await this.saveCarts(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find(c => c.id === Number(id));
  }

  async addProductToCart(cid, pid) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex(c => c.id === Number(cid));
    if (cartIndex === -1) return null;

    const cart = carts[cartIndex];

    const productIndex = cart.products.findIndex(p => p.product === Number(pid));
    if (productIndex === -1) {
      cart.products.push({ product: Number(pid), quantity: 1 });
    } else {
      cart.products[productIndex].quantity++;
    }

    carts[cartIndex] = cart;
    await this.saveCarts(carts);
    return cart;
  }
}
