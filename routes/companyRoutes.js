import { Router } from 'express'
import {createCompanyAndOwnerHandler, deleteCompanyHandler, getCompanyHandler, updateCompanyDetailsHandler } from '../controllers/companyController.js'
import { authorizeRoles } from '../middleware/auth.js'

const router = Router()


router.route('/')
    .get(authorizeRoles('Owner', 'Field Manager', 'Engineer'), getCompanyHandler)

    // ensure the post is an unprotected route
    .post(createCompanyAndOwnerHandler)

    .put(authorizeRoles('Owner'), updateCompanyDetailsHandler)

    .delete(authorizeRoles('Owner'), deleteCompanyHandler)
    

export default router