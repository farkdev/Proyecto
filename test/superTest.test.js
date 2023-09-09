const chai = require('chai')
const supertest = require('supertest')


const expect = chai.expect
const requester = supertest('http://localhost:8080')


describe('Testing proyecto', ()=>{
     describe('Test de User', ()=>{
        let userId 
        let userRole
        let userEmail
        let cookie 
        //este usuario creado es utilizado en los demas test de session, 
        //si se ejecuta mas de una vez cambiar email de userMock
        //ya que fallaria debido a que el campo email es unico y no se puede volver a crear
        it('POST /register debe crear usuario correctamente', async () => {
            const userMock = {
                first_name: 'UserSupertest',
                last_name: 'userSuperSuperTest',
                email: 'usTest@usertest.com',
                date_of_birth: '2023-10-10',
                password: 'test123'
            };
        
            const response = await requester.post('/api/session//register').send(userMock);
            
            expect(response.statusCode).to.be.equal(200);
            expect(response).to.be.ok;
            expect(response.body).to.have.property('status').that.is.equal('success');
            expect(response).to.have.property('payload');
            expect(response.body.payload).to.have.property('_id');
        
            userId = response.body.payload._id;
            userRole = response.body.payload.role;
            userEmail = response.body.payload.email;
        });
        

        it('POST /login debe loguear usuario correctamente y devolver una cookie', async()=>{
            const userMock = {
                email: 'userTest@usertest.com',
                password: 'test123'
            }
            const response = await requester.post('/api/session/login').send(userMock)
            const cookieResult = response.headers['set-cookie'][0]
            cookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1],
            }
            expect(response).to.be.ok
            expect(response.statusCode).to.be.equal(302)
            expect(cookieResult).to.be.ok
            expect(cookie.name).to.be.ok.and.eql('coderCookieToken')
            expect(cookie.value).to.be.ok
        })

        it('GET /current debe enviar el jwt del usuario y devolver los datos', async()=>{
            const response = await requester.get('/current').set('Cookie',[`${cookie.name}=${cookie.value}`])
            expect(response).to.be.ok
            expect(response.statusCode).to.be.equal(200)
            expect(response.body).to.have.property('status').that.is.equal('success')
            expect(response.body.payload).to.have.property('email').that.is.equal(userEmail)
            expect(cookie.name).to.be.ok.and.eql('coderCookieToken')
            expect(cookie.value).to.be.ok
        })

        it('GET /premium/:uid debe cambiar el role del usuario de user a premium y viceversa', async()=>{
            const response =await requester.get(`/premium/${userId}`)
            expect(response).to.be.ok
            expect(response.statusCode).to.be.equal(200)
            expect(response.body).to.have.property('status').that.is.equal('success')
            expect(response.body).to.have.property('role')
            expect(response.body.role).to.not.equal(userRole)
        })

        it('GET /logout debe eliminar la sesión, destruir la cookie y redireccionar a /login', async()=>{
            const response = await requester.get('/api/session/logout').set('Cookie', [`${cookie.name}=${cookie.value}`])
            expect(response).to.be.ok
            expect(response.statusCode).to.be.equal(302)
            expect(response.headers['location']).to.be.equal('/login')
            const setCookieHeader = response.headers['set-cookie'];
            expect(setCookieHeader).to.be.an('array');
            expect(setCookieHeader).to.have.lengthOf(1);
            expect(setCookieHeader[0]).to.include(`${cookie.name}=;`);
        })
    }) 

    describe('TEST DE PRODUCTOS',() =>{
        let prodId
        let authCookie

        before(async () => {
            const authResponse = await requester.post('/api/session/login').send({
                email: 'userTest@usertest.com',
                password: 'test123'
            });
            authCookie = authResponse.headers['set-cookie'][0]
        })

        it('GET /api/products/ debe traer todo los productos', async () => {
            const response = await requester.get('/api/products');
            
            expect(response).to.be.ok;
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('payload').that.is.an('object');
            
            const payload = response.body.payload;
            expect(payload).to.have.property('docs').that.is.an('array');
        });

     it('POST /api/products/ debe crear un producto correctamente',async ()=>{
            const productMock = {
                title: 'productoSuperTest',
                description: 'producto de prueba Supertest', 
                price: 123, 
                code: 'p123', 
                stock: 123, 
                category: 'producto de prueba Supertest'
            }
            const response = await requester.post('/api/products').set('Cookie', [authCookie]).send(productMock)
            expect(response).to.be.ok
            expect(response.statusCode).to.equal(201)
            expect(response.body).to.have.property('status').that.is.equal('success')
            expect(response.body).to.have.property('payload').that.is.an('object')
            expect(response._body.payload).to.have.property('_id')
            prodId = response.body.payload._id
        })



        it('GET /api/products/:pid debe traer un producto por su id',async ()=>{
            const response = await requester.get(`/api/products/${prodId}`)
            expect(response).to.be.ok
            expect(response.statusCode).to.be.equal(200)
            expect(response.body).to.have.property('status').that.is.equal('success')
            expect(response.body).to.have.property('payload').that.is.an('object')
            expect(response.body.payload).to.have.property('_id')
        })

        it('PUT /api/products/:pid debe actualizar un producto correctamente', async () => {
            const updatedProductMock = {
                code: 1111,
                price: 1200,
                stock: 232,
                category: 'productosupersupertest'
            };
            const response = await requester.put(`/api/products/${prodId}`).set('Cookie', [authCookie]).send(updatedProductMock)
            expect(response).to.be.ok
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.have.property('status').that.is.equal('success')
            expect(response.body).to.have.property('payload').that.is.an('object')
            expect(response.body.payload.code).to.equal(updatedProductMock.code)
            expect(response.body.payload.price).to.equal(updatedProductMock.price)
            expect(response.body.payload.category).to.equal(updatedProductMock.category)
        })

        it('DELETE /api/products/:pid debe eliminar un producto correctamente', async () => {
            const response = await requester.delete(`/api/products/${prodId}`).set('Cookie', [authCookie]);
        
            expect(response).to.be.ok;
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.have.property('status').that.is.equal('success');
            expect(response.body).to.have.property('payload').that.is.an('object');
            expect(response.body.payload).to.have.property('_id');
            expect(response.body.payload._id).to.equal(prodId);
        
            // Verifica que el producto realmente haya sido eliminado en la base de datos
            const deletedProduct = await productService.getProductById(prodId);
            expect(deletedProduct).to.be.null;
        });
        

    })

    describe('TEST DE CARRITOS', async()=>{
        let cartId
        let productId = '64504a143d92f39d390e95bd'
        // before(async () => {
        //     const authResponse = await requester.post('/api/login').send({
        //         email: 'userTest@usertest.com',
        //         password: 'test123'
        //     });
        //     authCookie = authResponse.headers['set-cookie'][0]
        // })

        it('POST /api/carts/ debe crear un cart vacio', async () => {
            const response = await requester.post('/api/carts');
            
            expect(response).to.be.ok;
            expect(response.statusCode).to.be.equal(201);
            expect(response.body).to.have.property('status').that.is.equal('success');
            expect(response.body).to.have.property('payload').that.is.an('object');
            expect(response.body.payload).to.have.property('products').that.is.an('array');
            expect(response.body.payload).to.have.property('_id');
        
            cartId = response.body.payload._id;
        
            //validación adicional para asegurar de que se ha creado un carrito vacío
            expect(response.body.payload.products).to.have.lengthOf(0);
        });

        it('GET /api/carts/ debe traer todos los carts',async ()=>{
            const response = await requester.get('/api/carts')
            expect(response).to.be.ok
            expect(response.statusCode).to.be.equal(200)
            expect(response.body).to.have.property('status').that.is.equal('success')
            expect(response.body).to.have.property('payload').that.is.an('array').that.is.not.empty
        })

        it('GET /api/carts/:cid debe traer un cart por su id',async ()=>{
            const response = await requester.get(`/api/carts/${cartId}`)
            expect(response).to.be.ok
            expect(response.statusCode).to.be.equal(200)
            expect(response.body).to.have.property('status').that.is.equal('success')
            expect(response.body).to.have.property('payload').that.is.an('object')
            expect(response.body.payload).to.have.property('_id')
            expect(response.body.payload).to.have.property('products').that.is.an('array')
        })

        it('POST /api/carts/:cid/product/:pid debe agregar un producto al carrito',async ()=>{
            const cantidadProd = {
                cantidad: 10
            }
            const response = await requester.post(`/api/carts/${cartId}/products/${productId}`).set('Cookie', [authCookie]).send(cantidadProd)
            
            expect(response).to.be.ok
            expect(response.statusCode).to.be.equal(200)
            expect(response.body).to.have.property('status').that.is.equal('success')
            expect(response.body).to.have.property('payload').that.is.an('object')
            expect(response.body.payload).to.have.property('products').that.is.an('array')

            const productObj = response.body.payload.products.find(product => product.product === productId)
            expect(productObj).to.exist
            expect(productObj).to.have.property('product').that.is.equal(productId)
            expect(productObj).to.have.property('cantidad').that.is.equal(cantidadProd.cantidad)

        })

        it('PUT /api/carts/:cid/products/:pid debe modificar un producto dentro del carrito',async ()=>{
            const cantidadProd = {
                cantidad: 12
            }
            const response = await requester.put(`/api/carts/${cartId}/products/${productId}`).send(cantidadProd)
            expect(response).to.be.ok
            expect(response.statusCode).to.be.equal(200)
            expect(response.body).to.have.property('status').that.is.equal('success')
            expect(response.body).to.have.property('payload').that.is.an('object')
            expect(response.body.payload).to.have.property('_id')
            expect(response.body.payload).to.have.property('products').that.is.an('array')

            const productObj = response.body.payload.products.find(product => product.product === productId)
            expect(productObj).to.exist
            expect(productObj).to.have.property('product').that.is.equal(productId)
            expect(productObj).to.have.property('cantidad').that.is.equal(cantidadProd.cantidad)
        })

        it('PUT /api/carts/:cid debe modificar el carrito completo',async ()=>{
            const modifiedCart = [
                {
                    product: '645eaf38968986e5d0689a8a',
                    cantidad: 15
                },
                {
                    product: '645eaf67968986e5d0689a8c',
                    cantidad: 5
                }
            ]

            const response = await requester.put(`/api/carts/${cartId}`).send(modifiedCart)
            expect(response).to.be.ok
            expect(response.statusCode).to.be.equal(200)
            expect(response.body).to.have.property('status').that.is.equal('success')
            expect(response.body).to.have.property('payload').that.is.an('object')
            expect(response.body.payload).to.have.property('_id').that.is.equal(cartId)

            const responseProducts = response.body.payload.products
            expect(responseProducts).to.be.an('array').with.lengthOf(modifiedCart.length)
            for (let i = 0; i < modifiedCart.length; i++) {
                expect(responseProducts[i]).to.deep.equal(modifiedCart[i]);
            }
    
        })

        it('DELETE /api/carts/:cid/products/:pid debe eliminar un producto del carrito',async ()=>{
            let deleteProd = '645eaf38968986e5d0689a8a'
            const response = await requester.delete(`/api/carts/${cartId}/products/${deleteProd}`)
            expect(response).to.be.ok
            expect(response.statusCode).to.be.equal(200)
            expect(response.body).to.have.property('status').that.is.equal('success')
            expect(response.body).to.have.property('payload').that.is.an('object')
            expect(response.body.payload).to.have.property('_id').that.is.equal(cartId)

            const updatedProducts = response.body.payload.products;
            const deletedProductExists = updatedProducts.some(product => product._id === deleteProd);
            expect(deletedProductExists).to.be.false
    
        })

        it('DELETE /api/carts/:cid debe vaciar el carrito',async ()=>{
            const response = await requester.delete(`/api/carts/${cartId}`)
            expect(response).to.be.ok
            expect(response.statusCode).to.be.equal(200)
            expect(response.body).to.have.property('status').that.is.equal('success')
            expect(response.body).to.have.property('payload').that.is.an('object')
            expect(response.body.payload).to.have.property('_id').that.is.equal(cartId)
            expect(response.body.payload.products).to.be.an('array').that.is.empty
    
        })

    })
    
})