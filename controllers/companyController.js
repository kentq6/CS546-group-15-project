import mongoose from 'mongoose'
import { attatchDocumentToReqById, getNonRequiredFields, getRequiredFieldsOrThrow } from '../helpers.js'
import { Company, User } from '../model/model.js'
import { NotFoundError } from '../error/error.js'

export const attatchCompanyToReq = attatchDocumentToReqById(Company)

export async function createCompanyAndOwner (req, res, next) {
    try {
        const ownerRequiredFields = 
            [ 'username'
            , 'password'
            , 'firstname'
            , 'lastname'
            ]

        const companyRequiredFields =
            [ 'title'
            , 'location'
            , 'industry'
            ]

        const ownerFields = getRequiredFieldsOrThrow(ownerRequiredFields, req.body)
        const companyFields = getRequiredFieldsOrThrow(companyRequiredFields, req.body)
        const companyId = new mongoose.Types.ObjectId

        const owner = await User.create({
            ...ownerFields,
            company: companyId,
            role: 'Owner'
        })
        try {
            const company = await Company.create({
                ...companyFields,
                _id: companyId,
                owner: owner._id,
            })

            return res.status(201).json({owner, company})

        } catch(companyErr) {
            await User.findByIdAndDelete(owner._id)
            throw companyErr
        } 
    } catch(err) {
        next(err)
    }
}

// assumes company has already been attatched to request.
// 
export async function updateCompanyDetails(req, res, next) {
    try {
        const updateFields = ['location', 'industry']
        const updates = getNonRequiredFields(updateFields, req.body)

        const company = await Company.findByIdAndUpdate(req.company._id, updates, {new: true})
        if (!company) {
            throw new NotFoundError('Company not found; no updates applied')
        }
        
        return res.status(200).json(company)
        
    } catch(err) {
        next(err)
    }
}


