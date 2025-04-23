import { Router } from 'express'
import { attatchCompanyToReq, createCompanyAndOwner, updateCompanyDetails } from '../controllers/companyController.js'

const router = Router()

router.param('company_id', attatchCompanyToReq)

router.route('/')
    .post(createCompanyAndOwner)

router.route('/:company_id')
    .put(updateCompanyDetails)
    

export default router