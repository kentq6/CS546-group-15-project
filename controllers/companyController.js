import mongoose from 'mongoose'
import { Company, User } from '../model/model.js';


export async function createOwnerAndCompany(req, res, next) {
    const { username, password, firstname, lastname } = req.body
    const { title, location, industry } = req.body;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const new_owner = await User.create(
            [{ username, password, firstname, lastname, role: 'Owner' }],
            { session }
        );
        await Company.create(
            [{ title, location, industry, owner: new_owner._id }], 
            { session }
        );
        await session.commitTransaction();
        res.status(201);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}

export async function createAdminFromOwner(req, res, next) {
    const ownerId = req.userId;
    const {username, password} = req.body;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const owner = await User.findById(ownerId).session(session).exec();
        if (!owner) 
            throw new Error('No user found');
        if (owner.role !== 'Owner')
            throw new Error('User not an owner; unauthorized');
        const new_admin = User.create(
            [{ username, password, role: 'Admin' }], 
            { session }
        );
        await Company.findOneAndUpdate(
            { owner: owner._id }, 
            { $addToSet: {employees: new_admin._id} },
            { session }
        );
        await session.commitTransaction();
        res.status(201);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}

export async function createUnpriveledgedUserFromPriveledgedUser(req, res, next) {
    const privUserId = req.userId;
    const {username, password, role} = req.body;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const privUser = User.findById(privUserId).session(session).exec();
        if (!privUser)
            throw new Error('No user found');
        if (privUser.role !== 'Owner' || privUser.role !== 'Admin')
            throw new Error('User not a priveledged user; unauthorized');
        if (role === 'Owner' || role === 'Admin')
            throw new Error('Unauthorized attempt to create priveledged role');

        const new_unpriv_user = User.create(
            [{username, password, role }],
            { session }
        );
        await Company.findOneAndUpdate(
            {
                $or: [
                    { owner: privUser._id },
                    { employees: privUser._id }
                ]
            },
            { $addToset: { employees: new_unpriv_user }},
            { session }
        );
        await session.commitTransaction();
        res.status(201);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}




