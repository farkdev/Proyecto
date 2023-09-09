class CartRepository {
    constructor(dao){
        this.dao = dao
    }

    getCarts(){
        return this.dao.getCarts()
    }

    getCartById(cid){
        return this.dao.getCartById(cid)
    }

    createCart(newCart){
        return this.dao.createCart(newCart)
    }

    addToCart(cid, pid, quantity){
        return this.dao.addToCart(cid, pid, quantity)
    }
    
    modifyProdFromCart (cid, pid, quantity){
        return this.dao.modifyProdFromCart(cid, pid, quantity)
    }

    removeProductFromCart(cid, pid){
        return this.dao.removeProductFromCart(cid, pid)
    }

    removeAllProductsFromCart(cid){
        return this.dao.removeAllProductsFromCart(cid)
    }


    deleteCart(cid){
        return this.dao.deleteCart(cid)
    }
    
    generateTicket(newTicket){
        return this.dao.generateTicket(newTicket)
    }

}

module.exports = CartRepository