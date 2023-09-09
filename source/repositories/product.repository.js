class ProductRepository {
    constructor(dao){
        this.dao = dao
    }

    getRealTimeProducts(){
        return this.dao.getRealTimeProducts()
    }

    getProducts(limit, page, sortOptions){
        return this.dao.getProducts(limit, page, sortOptions)
    }

    getProductById(pid){
        return this.dao.getProductById(pid)
    }

    createProduct(newProduct){
        return this.dao.createProduct(newProduct)
    }

    updateProduct(pid, obj){
        return this.dao.updateProduct(pid, obj)
    }

    deleteProduct(pid){
        return this.dao.deleteProduct(pid)
    }
}



module.exports = ProductRepository
