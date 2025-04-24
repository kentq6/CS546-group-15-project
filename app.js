import express from 'express'
import configRoutes from './routes/index.js'
import { connectToDb } from './config/connection.js'
import exphbs from 'express-handlebars'


async function run() {
    const app = express()

    app.use(express.json())

    app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }))

    app.set('view engine', 'handlebars');

    configRoutes(app)

    await connectToDb()

    app.listen(3000, () => {
        console.log('Startup successful')
    })
}

run()




