import { Router } from 'express'
import {createCompanyAndOwnerHandler, deleteCompanyHandler, getCompanyHandler, updateCompanyDetailsHandler } from '../controllers/companyController.js'
import { authorizeAllRoles, authorizeRoles, dummyAuthenticate } from '../middleware/auth.js'

const router = Router()


router.route('/')
    .get
        ( dummyAuthenticate
        , authorizeAllRoles
        , getCompanyHandler
        )
    // ensure the post is an unprotected route
    .post(createCompanyAndOwnerHandler)
    .put
        ( dummyAuthenticate
        , authorizeRoles('Owner')
        , updateCompanyDetailsHandler
        )
    .delete
        ( dummyAuthenticate
        , authorizeRoles('Owner')
        , deleteCompanyHandler
        )
    

export default router