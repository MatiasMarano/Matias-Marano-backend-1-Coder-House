import fs from 'fs/promises';
import path from 'path';

export class ProductManager {
  constructor() {
    this.path = path.resolve('data/products.json');
  }

  async getProducts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveProducts(products) {
    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
  }

  async addProduct(product) {
    const products = await this.getProducts();

    // Generar id automáticamente
    const newId = products.length ? products[products.length - 1].id + 1 : 1;

    const newProduct = { id: newId, ...product };
    products.push(newProduct);

    await this.saveProducts(products);
    return newProduct;
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => p.id === Number(id));
  }

  async updateProduct(id, updateFields) {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === Number(id));
    if (index === -1) return null;

    // No actualizar id
    const updatedProduct = { ...products[index], ...updateFields, id: products[index].id };
    products[index] = updatedProduct;

    await this.saveProducts(products);
    return updatedProduct;
  }

  async deleteProduct(id) {
    let products = await this.getProducts();
    products = products.filter(p => p.id !== Number(id));
    await this.saveProducts(products);
  }
}
