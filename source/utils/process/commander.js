const { Command } = require('commander')

const commander = new Command()

commander
    .option('--mode <mode>', 'modo de trabajo', 'development')
    .parse()


module.exports = {
    commander
}









// const commander = require('commander')

// const program = new commander.Command()

// program
//     .option('-d', 'Variable para debug', false)
//     .option('-p, --port <port>', 'Puerto para el servidor', 8080)
//     .option('--mode <mode>', 'Modo de trabajo', 'production')
//     .requiredOption('-u <user>', 'Usuario utilizando el appicativo', 'No se ha declarado un usuario')
//     .option('-l, --letters [letter...]', 'specify the letters')
    
// program.parse()

// console.log('options: ', program.opts())
// console.log('Remaining Arguments: ', program.args)



// module.exports = {
//     program
// }