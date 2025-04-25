import companyRouter from './companyRoutes.js'
import errorHandler from './errorHandler.js';
import pageRouter from './pageRoutes.js'
const constructorMethod = (app) => {
    // routes for pages
    app.use('/', pageRouter)
    // routes for companies
    app.use('/company', companyRouter)
    // catch-all error handler
    app.use(errorHandler)
    // catch-all routes that arent defined
    app.use(/(.)*/, (req, res) => {
        return res.status(404).json({err: 'Page Not Found'})
    })
}

export default constructorMethod