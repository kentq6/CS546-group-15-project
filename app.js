import 'dotenv/config';
import express from 'express'
import configRoutes from './routes/index.js'
import { connectToDb } from './config/connection.js'
import exphbs from 'express-handlebars'
import cookieParser from 'cookie-parser'



async function run() {
    const app = express()

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(express.static('public'))
    app.use(cookieParser())
    
    // Create the Handlebars engine with custom helpers
    const hbs = exphbs.create({
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
        defaultLayout: 'main', // Ensure this layout exists in views/layouts
        helpers: {
            ifCond(v1, v2, options) {
                if (v1 === v2) {
                    return options.fn(this); // Render the block if they match
                }
                return options.inverse(this); // Render the inverse block if they don't match
            }
        },
        //partialsDir: '/views/partials'
    });

    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');

    configRoutes(app)

    await connectToDb()

    app.listen(3000, () => {
        console.log('Startup successful')
    })
}

run() 