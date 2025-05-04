import { Router } from 'express'
import * as companyHandlers from '../controllers/companyController.js'
import * as authHandlers from '../middleware/auth.js'

const router = Router()


router.route('/')
    .get
        ( authHandlers.authenticateAndAuthorizeAllRoles
        , companyHandlers.getCompanyHandler
        )
    // ensure the post is an unprotected route
    .post
        (companyHandlers.createCompanyAndOwnerHandler)
    .put
        ( authHandlers.authenticateAndAuthorizeRoles('Owner')
        , companyHandlers.updateCompanyDetailsHandler
        )
    .delete
        ( authHandlers.authenticateAndAuthorizeRoles('Owner')
        , companyHandlers.deleteCompanyHandler
        )
    

export default router