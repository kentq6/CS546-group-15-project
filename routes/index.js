import companyRouter from './companyRoutes.js'
import errorHandler from './errorHandler.js'
import pageRouter from './pageRoutes.js'
import userRouter from './userRoutes.js'
import projectRouter from './projectRoutes.js'

const constructorMethod = (app) => {

    app.use('/', pageRouter)

    app.use('/company', companyRouter)

    app.use('/users', userRouter)

    app.use('/projects', projectRouter)

    // catch-all error handler
    app.use(errorHandler)

    // catch-all routes that arent defined
    app.use(/(.)*/, (req, res) => {
        return res.status(404).json({status: 'error', message: 'Resource not found'})
    })
}

export default constructorMethod