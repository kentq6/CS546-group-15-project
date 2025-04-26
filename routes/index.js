import companyRouter from './companyRoutes.js'
import errorHandler from './errorHandler.js'
import pageRouter from './pageRoutes.js'
import userRouter from './userRoutes.js'

const constructorMethod = (app) => {

    app.use('/', pageRouter)

    app.use('/company', companyRouter)

    app.use('/users', userRouter)

    // catch-all error handler
    app.use(errorHandler)

    // catch-all routes that arent defined
    app.use(/(.)*/, (req, res) => {
        return res.status(404).json({err: 'Page Not Found'})
    })
}

export default constructorMethod