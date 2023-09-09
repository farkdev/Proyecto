
const socket = io()

const dataForm = document.getElementById('formDelete')
const id = document.getElementById('deleteId')


//PARA ELIMINAR PROD
dataForm.addEventListener('submit', async (evt) => {
    evt.preventDefault();

    const result = await Swal.fire({
        title: 'Eliminar Producto?',
        text: `Se eliminara el producto con ID: ${id.value}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Eliminar',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        socket.emit('deleteProduct', { id: id.value });
    }
});

const displayProducts = (data) => {
    if (data.status === 'error') {
        Swal.fire({
            title: 'Producto no encontrado',
            text: `${data.message}`,
            icon: 'error'
        });
        return { status: 'error', message: 'Producto no encontrado' };
    }

    const productList = data.map(({ _id, title, code, price, category, description, stock, thumbnail }) => `
        <tr>
            <td>${_id}</td>
            <td>${title}</td>
            <td>${code}</td>
            <td>${price}</td>
            <td>${category}</td>
            <td>${description}</td>
            <td>${stock}</td>
            <td>${thumbnail}</td>
        </tr>`
    ).join('');

    const tableHeader = `
        <tr>
            <th scope="col">#id</th>
            <th scope="col">nombre</th>
            <th scope="col">codigo</th>
            <th scope="col">precio</th>
            <th scope="col">categoria</th>
            <th scope="col">descripcion</th>
            <th scope="col">stock</th>
            <th scope="col">imagenes</th>
        </tr>`;

    document.getElementById('tableProduct').innerHTML = tableHeader + productList;

    Swal.fire({
        title: 'Producto Eliminado',
        timer: 8000,
        icon: 'success'
    });
};

socket.on('newList', displayProducts);

// Agregar producto
const addProduct = (newData) => {
    if (newData.status === 'error') {
        Swal.fire({
            title: 'No se pudo agregar el producto',
            text: `${newData.message}`,
            icon: 'error'
        });
        return { status: 'error', message: 'No se pudo agregar el producto' };
    }

    displayProducts(newData);

    Swal.fire({
        title: 'Producto agregado',
        timer: 8000,
        icon: 'success'
    });
};

const addForm = document.getElementById('addForm');
const title = document.getElementById('title');
const price = document.getElementById('price');
const code = document.getElementById('code');
const stock = document.getElementById('stock');
const category = document.getElementById('category');
const description = document.getElementById('description');
const thumbnail = document.getElementById('thumbnail');

addForm.addEventListener('submit', async (evt) => {
    evt.preventDefault();

    socket.emit('addProduct', {
        title: title.value,
        description: description.value,
        price: parseInt(price.value),
        code: parseInt(code.value),
        stock: parseInt(stock.value),
        category: category.value,
        thumbnail: [thumbnail.value]
    });
});

socket.on('productAdded', addProduct);
