import mongoose from 'mongoose'
import { getNonRequiredFields, getRequiredFieldsOrThrow } from '../helpers.js'
import { Company, User } from '../model/model.js'
import { NotFoundError } from '../error/error.js'


export async function getCompanyHandler (req, res, next) {
    try {
        const company = await Company.findById(req.user.company)
        if (!company) {
            throw new NotFoundError('Company not found')
        }
        return res.status(200).json(company)
    }
    catch(err) {
        next(err)
    }
}

export async function createCompanyAndOwnerHandler (req, res, next) {
    try {
        const ownerFieldNames = 
            [ 'username'
            , 'password'
            , 'firstname'
            , 'lastname'
            ]

        const companyFieldNames =
            [ 'title'
            , 'location'
            , 'industry'
            ]
        // validate that these fields exist within the request body
        const ownerFields = getRequiredFieldsOrThrow(ownerFieldNames, req.body)
        const companyFields = getRequiredFieldsOrThrow(companyFieldNames, req.body)

        // Check if company exists with this name
        const existingCompany = await Company.findOne({ title: companyFields.title });
        if (existingCompany) {
            throw 'Company with this name already exists';
        }

        // Check if user exists with this username
        const existingUser = await User.findOne({ username: ownerFields.username });
        if (existingUser) {
            throw 'User with this username already exists';
        }

        const companyId = new mongoose.Types.ObjectId()

        // create an owner, if create() throws, nbd - we havent created a company yet
        const owner = await User.create({
            ...ownerFields,
            company: companyId,
            role: 'Owner'
        })

        // try to create a company, if it fails then rollback the creation of the owner
        try {
            const company = await Company.create({
                ...companyFields,
                _id: companyId,
                owner: owner._id,
            })

            // if this line is reached, both document creations were successful
            return res.redirect('/login');

        
        } catch(companyErr) {
            await User.findByIdAndDelete(owner._id)
            throw companyErr
        } 
    } catch(err) {
            return res.render('signup', {
            title: 'Sign Up',
            error: err,
            formData: {
                title: req.body.title,
                location: req.body.location,
                industry: req.body.industry,
                username: req.body.username,
                firstname: req.body.firstname,
                lastname: req.body.lastname
            }
        });
    }
}


export async function updateCompanyDetailsHandler (req, res, next) {
    try {
        const updateFields = ['location', 'industry']
        const updates = getNonRequiredFields(updateFields, req.body)
        const updatedCompany = await Company.findByIdAndUpdate(req.user.company, updates, {runValidators: true, new: true})
        if (!updatedCompany) {
            throw new NotFoundError('Company not found; no updates applied')
        }
        
        return res.status(200).json(updatedCompany)
        
    } catch(err) {
        next(err)
    }
}




/**
 * 
 * this update is castcaded to all projects, users, etc. associated with the company
 * doing this operation deletes the company owner as well
 * 
 * see model.js for details
 */
export async function deleteCompanyHandler(req, res, next) {
    try {
        const deletedCompany = await Company.findByIdAndDelete(req.user.company)
        if (!deletedCompany) {
            throw new NotFoundError('Company not found; no delete applied')
        }
        return res.status(200).json(deletedCompany)
    } catch(err) {
        next(err)
    }
}




