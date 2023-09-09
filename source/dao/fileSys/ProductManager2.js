const fs = require('fs');


class ProductManager {
    constructor() {
      this.products = [];
      this.path = './source/data.json';
      try {
        fs.readFile(this.path, 'utf-8', (err, data) => {
          if (err) {
            console.log(err);
          } else {
            this.products = JSON.parse(data);
          }
        });
        } catch (error) {
          console.log(error);
        }
    }

    async createProduct(titulo, descripcion, precio, thumbnail, code, stock, categoria, status) {
      try {
        const product = {
          titulo,
          descripcion,
          precio,
          thumbnail,
          code,
          stock,
          categoria,
          status
        };

      if (this.products.length === 0) {
        product.id = 1;
      } else {
        const lastProduct = this.products[this.products.length - 1];
        product.id = lastProduct.id + 1;
      }

      this.products.push(product);
      await fs.promises.writeFile(this.path, JSON.stringify(this.products,null, 2))
      return product
      } catch (error){
        throw new Error(`No se agrego el producto ${err.message}`)
      }
    }

    async getProducts() {
    try {
        const data = await fs.promises.readFile(this.path)
        this.products = JSON.parse(data)
        return this.products
      } catch (err){
        throw new Error(`no se pudo encontrar el producto ${err.message}`)
      }
    }

    async updateProduct(id, newData) {
      try {
        const products = await this.getProducts();
        const productIndex = products.findIndex((product) => product.id === id);
        if (productIndex <= -1) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }
        const oldData = products[productIndex];
        const updatedProduct = { ...oldData, ...newData };
        products[productIndex] = updatedProduct;
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return updatedProduct;
    } catch (err) {
        throw new Error(`No se pudo actualizar el producto: ${err.message}`);
    }
  }
  

  async getProductById(id) {
    try {
        const products = await this.getProducts();
        const product = products.find((p) => p.id === id);
        if (!product) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }
        return product;
    } catch (err) {
        throw new Error(`No se pudo obtener el producto: ${err}`);
    }
  }

  async deleteProduct(id) {
    try{
      const products = await this.getProducts()
      const productIndex = products.findIndex((product) => product.id === id)
      if (productIndex <=-1){
        throw new Error(`producto con ID ${id} no encontrado`)
      }
      products.splice(productIndex, 1)
      await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2))
      return products
    } catch(err){
      throw new Error(`no se pudo actualizar el producto ${err.message}`)
    }
  }
} 


// const admin = new ProductManager
// admin.addProduct("Pelota de tenis", "Pelota profesional de tenis, 3 unidades", 1900, "sin ruta", 936, 35)
// admin.addProduct("Raqueta Wilson", "Raqueta Wilson N Code 95", 47000, "sin ruta", 134, 10)
// admin.addProduct("Bolso Head", "Bolso Raquetero x3", 24000, "sin ruta", 422, 10)

// console.log(admin.getProductById(3))
// console.log(admin.getProducts)


// admin.addProduct("Pelota de tenis", "Pelota profesional de tenis, 3 unidades", 1900, "sin ruta", 936, 35)
//     .then(() => admin.addProduct("Raqueta Wilson", "Raqueta Wilson N Code 95", 47000, "sin ruta", 134, 10))
//     .then(() => admin.addProduct("Bolso Head", "Bolso Raquetero x3", 24000, "sin ruta", 422, 10))
//     .then(() => admin.getProducts())
//     .then(() => admin.updateProduct(1, { precio: 300 })
//         .then((updatedProduct) => console.table(updatedProduct))
//         .then(() => admin.getProducts().then(res => console.table(res))))
//     .then(() => admin.getProducts())

// admin.deleteProduct(4)
//     .then((deletedProduct) => console.log(`Producto eliminado: ${JSON.stringify(deletedProduct)}`))
//     .then(() => admin.getProducts())
//     .then((products) => console.log(`Productos restantes: ${JSON.stringify(products)}`))
//     .catch((error) => console.error(`Error al eliminar el producto: ${error.message}`));

// admin.getProducts().then(res => console.table(res))



module.exports = ProductManager;