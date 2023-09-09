const { faker } = require('@faker-js/faker')

const productGenerator = () => {
    return{
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseInt(faker.commerce.price()),
        code: faker.string.numeric(),
        stock: parseInt(faker.string.numeric()),
        category: faker.commerce.department(),
        thumbnail: [faker.image.url()]
    }

}

module.exports = productGenerator


// const stock = faker.number.int({ max: 20 })

// return {
//     title: faker.commerce.productName(),
//     description: faker.commerce.productDescription(),
//     price: faker.commerce.price({ min: 50, max: 100 }),
//     thumbnails: [faker.image.url(), faker.image.url()],
//     code: faker.string.nanoid({ min: 10, max: 15 }),
//     stock,
//     status: stock === 0,
//     category: faker.commerce.department()
// }