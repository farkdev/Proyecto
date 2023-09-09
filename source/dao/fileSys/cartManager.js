const fs = require('fs')

class CartManager {
    constructor(){
        this.cart = []
        this.path = './source/dao/cart.json'
        
    }

    exists() {
        /* verifico si existe el archivo */
        try {
            if (!fs.existsSync(this.path)) {
                throw new Error("The file does not exists");
            } else {
                return true;
            }
        } catch (error) {
            console.log(`Error looking for the file: ${error.message}`);
        }
    }
    
    getCarts = async() =>{
        try{
            const data = await fs.promises.readFile(this.path, 'utf-8')
            return JSON.parse(data)
        } catch (error) {
            console.log(error)
        }         
    }

    writeCart = async(data)=>{
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(data,null,2))
        } catch (err){
            console.log(err)
        }
    }

    

    createCart = async () => {
        try{
            let cartsArray = []
            if(!this.exists(this.cart)){
                let cartArray=[]
                const cart = {
                    id: this.#idGen(),
                    products: []
                }
                cartArray.push(cart)
                await this.writeCart(cartArray)
                console.log(`El carrito fue agregado con el id: ${cart.id}`)
                return cart.id

            } else {
                if(await this.readCart(this.path)){
                    cartsArray = await this.readCart(this.path)
                }
                if(cartsArray.length === 0 || !cartsArray){
                    const cart = {
                        id: this.#idGen(),
                        products: []
                    }
                    cartsArray.push(cart)
                } else {
                    const cart = {
                        id: this.#idGen(cartsArray),
                        products: []
                    }
                    cartsArray.push(cart)
                }
                await this.writeCart(cartsArray)
                console.log(`El carrito fue adherido con el id ${cart.id}`)
                return cart
            }

        } catch (error) {
            console.log(`Error adhiriendo los productos ${error.message}`)
        }
    }

    getCartById = async id => {
        try {
            if(this.exists(this.path)){
                const carts = await this.readCart()
                const cart = carts.find(item => item.id === id)
                return cart ? cart : console.log('No se halló el producto')
        }
        return console.log('The database not exist')
        } catch (error) {
            console.log(error);
        }
    }

    addToCart = async (cid, pid, quantity) => {
        try {
            if (this.exists(this.path)) {
                const carts = await this.readCart();
                const cart = carts.find(item => item.id === cid);
                if (cart) {
                    const addProduct = cart.products.find(item => item.id === pid);
                    if (addProduct) {
                        addProduct.quantity += quantity;
                    } else {
                        cart.products.push({id: pid, quantity: quantity});
                    }
                    await this.writeCart(carts);
                    this.cart = cart;
                    return this.cart;
                }
                throw new Error(`The cart with the id was not found: ${cid}`);
            }
        } catch (error) {
            console.log(error);
        }
    };
    


    //SIMPLIFICANDO CODIGO ---------------------------------------------------------------
    // addToCart = async (cid, pid) => {
    //     try {
    //         if(this.exists(this.path)) {
    //             const carts = await this.readCart()
    //             const cart = carts.find(item => item.id === cid)
    //             if(cart) {
    //                 const addProduct = cart.products.find(item => item.id === pid)
    //                 if(addProduct) {
    //                 addProduct.quantity++
    //                 } else {
    //                     cart.products.push({id: pid, quantity: 1 })
    //                 }
    //                 await this.writeCart(carts)
    //                 this.cart = cart
    //                 return this.cart
    //             }
    //         throw new Error(`The cart with the id was not found: ${cid}`)
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    //SIMPLIFICANDO CODIGO ---------------------------------------------------------------



    #idGen(productsArray = []) {
        const id =
        productsArray.length === 0
            ? 1
            : productsArray[productsArray.length - 1].id + 1;
        return id;
    }

    

    modifyProdFromCart = async (cid, pid, quantity) => {
        try {
            const carts = await this.readCart();
            const cart = carts.find(item => item.id === cid);
            if (cart) {
                const product = cart.products.find(item => item.id === pid);
                if (product) {
                    product.quantity = quantity;
                    await this.writeCart(carts);
                    console.log(`Se modifico la cantidad del producto ${pid} en el carrito ${cid}.`);
                } else {
                    console.log(`No se encontró el producto ${pid} en el carrito ${cid}.`);
                }
            } else {
                console.log(`No se encontró el carrito ${cid}.`);
            }
        } catch (error) {
            console.log(`Error al modificar el producto en el carrito: ${error.message}`);
        }
    };
    

    removeAllProductsFromCart = async () => {
        try {
          if (this.exists()) {
            this.cart.products = [];
            await this.writeCart(this.cart);
            console.log('Se han eliminado todos los productos del carrito.');
          } else {
            console.log('No se puede eliminar los productos del carrito porque no existe.');
          }
        } catch (error) {
          console.log(`Error al eliminar los productos del carrito: ${error.message}`);
        }
    };

    removeProductFromCart = async (cid, pid) => {
        try {
          if (this.exists()) {
            const cart = await this.getCartById(cid);
            if (cart) {
              const index = cart.products.findIndex((item) => item.id === pid);
              if (index !== -1) {
                cart.products.splice(index, 1);
                await this.writeCart(this.cart);
                console.log(`El producto con ID ${pid} ha sido eliminado del carrito.`);
              } else {
                console.log(`No se encontró un producto con ID ${pid} en el carrito.`);
              }
            } else {
              console.log(`No se encontró un carrito con ID ${cid}.`);
            }
          } else {
            console.log('No se puede eliminar un producto del carrito porque el carrito no existe.');
          }
        } catch (error) {
          console.log(`Error al eliminar el producto del carrito: ${error.message}`);
        }
    };

    deleteCart = async () => {
        try {
          if (this.exists()) {
            await fs.promises.unlink(this.path);
            this.cart = [];
            console.log('El carrito ha sido eliminado por completo.');
          } else {
            console.log('No se puede eliminar el carrito porque no existe.');
          }
        } catch (error) {
          console.log(`Error al eliminar el carrito: ${error.message}`);
        }
    };
    




}


module.exports = CartManager