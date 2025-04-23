import companyRouter from './companyRoutes.js'
import errorHandler from './errorHandler.js';

const constructorMethod = (app) => {
    app.use('/company', companyRouter)
    app.use(errorHandler)
    app.use(/(.)*/, (req, res) => {
        return res.status(404).json({err: 'Page Not Found'})
    })
}

export default constructorMethod