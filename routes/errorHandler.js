
// custom express error route handler - if any error/promise-reject is thrown in the succession of normal handlers
// this gets called
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    console.error(err)
    
    let status
    switch (err.name) {
        // thrown by mongoose and our own code
        case 'ValidationError':
            status = 400
            break
        // thrown by mongoose and our own code
        case 'NotFoundError':
            status = 404
            break
        // thrown by our own code
        case 'PermissionError':
            status = 403
            break
        // thrown by our own code
        case 'AuthenticationError':
            status = 401
            break
        // thrown by owr own code, wrapper for error thrown by mongodb driver, search 'MongoServerError' in model/model.js 
        case  'DuplicateKeyError':
            status = 409
            break
        default:
            status = 500
    }

    return res.status(status).json({status: 'error', message: err.message })
}

export default errorHandler