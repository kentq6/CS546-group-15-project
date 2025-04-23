import { Router } from 'express'
import {createCompanyAndOwnerHandler, deleteCompanyHandler, getCompanyHandler, updateCompanyDetailsHandler } from '../controllers/companyController.js'
import { dummyRouteAuth } from '../middleware/auth.js'

const router = Router()


router.route('/')
    .get(dummyRouteAuth('Owner', 'Field Manager', 'Engineer'), getCompanyHandler)

    // ensure the post is an unprotected route
    .post(createCompanyAndOwnerHandler)

    .put(dummyRouteAuth('Owner'), updateCompanyDetailsHandler)

    .delete(dummyRouteAuth('Owner'), deleteCompanyHandler)
    

export default router