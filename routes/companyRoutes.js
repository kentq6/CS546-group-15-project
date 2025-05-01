import { Router } from 'express'
import 
    { createCompanyAndOwnerHandler
    , deleteCompanyHandler
    , getCompanyHandler
    , updateCompanyDetailsHandler
    } 
    from '../controllers/companyController.js'

import 
    { authenticateAndAuthorizeAllRoles
    , authenticateAndAuthorizeRoles
    }
    from '../middleware/auth.js'

const router = Router()


router.route('/')
    .get
        ( authenticateAndAuthorizeAllRoles
        , getCompanyHandler
        )
    // ensure the post is an unprotected route
    .post
        (createCompanyAndOwnerHandler)
    .put
        ( authenticateAndAuthorizeRoles('Owner')
        , updateCompanyDetailsHandler
        )
    .delete
        ( authenticateAndAuthorizeRoles('Owner')
        , deleteCompanyHandler
        )
    

export default router