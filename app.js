import express from 'express'
import configRoutes from './routes/index.js'
import { connectToDb } from './config/connection.js'


async function run() {
    const app = express()

    app.use(express.json())

    configRoutes(app)

    await connectToDb()

    app.listen(3000, () => {
        console.log('Startup successful')
    })
}

run()




