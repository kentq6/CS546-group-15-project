import mongoose, { model } from 'mongoose'
import { DuplicateKeyError, NotFoundError } from '../error/error.js';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const capitalizeWords = (str) => str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

const userSchema = new Schema({
    username: {         // not updatable
        type: String,
        required: true,                                 // no two users can have the same username
        unique: true,
        lowercase: true,
        match: [/^[a-z0-9_]{5,30}$/, 'Incorrect username format'],
    },
    password: {         // not updatable
        type: String,
        required: true
    },
    firstname: {        // updatable
        type: String,
        required: true,
        match: [/^[A-Za-z]{1,30}$/, 'Incorrect firstname format'],
        trim: true,                                     
        lowercase: true,                                
        get: capitalizeWords                            
    },
    lastname: {         // updatable
        type: String,
        required: true,
        match: [/^[A-Za-z]{1,30}$/, 'Incorrect lastname format'],
        trim: true,
        lowercase: true,
        get: capitalizeWords
    },
    company: {          // not updatable
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Company'
    },
    role: {             // not updatable
        type: String,
        enum: ['Owner', 'Field Manager', 'Engineer'],
        required: true
    }
}, {
    toJSON: {getters: true}
})

/* 
 * Middleware to hash passwords before saving to database
 * This ensures passwords are never stored in plain text, not sure if we need this but im doin it anyway
 * Uses bcrypt with a salt round of 10 for secure password hashing. Dont go over or it will take forever to hash
 */
userSchema.pre('save', async function(next) {
    /* Skip hashing if password hasn't been modified */
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const companySchema = new Schema({
    title: {            // not updatable
        type: String,
        required: true,
        unique: true,
        match: [/^[A-Za-z0-9\s]{2,30}$/, 'Incorrect title format'],
        trim: true
    },
    owner: {            // not updatable
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    location: {         // updatable
        type: String,
        required: true,
        match: [/^[A-Za-z\s\-']{2,30}, [A-Za-z\s\-']{2,30}$/, 'Incorrect Location format'],
        trim: true,
        lowercase: true,
        get: capitalizeWords
    },
    industry: {         // updatable
        type: String,
        required: true,
        match: [/^[A-Za-z\s]{2,30}$/, 'Incorrect industry format'],
        trim: true,
        lowercase: true,
        get: capitalizeWords
    }
    // adds automatic createdAt and updatedAt fields, and auto updates them as documents are created/updated
}, {
    timestamps: true,
    toJSON: {getters: true}
})

const common_fields = {
    title: {        // non-unique title | non-updatabale
        type: String,
        required: true,
        match: [/^[A-Za-z0-9\s]{2,50}$/, 'Incorrect title format'],
        trim: true
    },
    description: {      // updatable
        type: String,
        required: true,
        default: ''
    },
    status: {           // updatable
        type: String,
        required: true,
        enum: ['Pending', 'InProgress', 'Complete'],
        default: 'Pending'
    },
    project: {          // not updatable
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    tags: [{            // updatable
        type: String,
        match: [/^[A-Za-z0-9]{2,30}$/, 'Incorrect tag format'],
        minLength: 2,
        lowercase: true,
        trim: true
    }],
    fileURL: {          // updatable
        type: String,
        required: true,
        match: [/^.+\.(pdf|jpeg|png)$/i, 'Incorrect file format'],
        trim: true
    },
    uploadedBy: {       // updatable
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
} 

const issueSchema = new Schema({
    title: common_fields.title,
    description: common_fields.description,
    status: common_fields.status,
    raisedBy: {         // not updatable
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
}, {timestamps: true})

const reportSchema = new Schema({
    title: common_fields.title,
    description: common_fields.description,
    project: common_fields.project,
    tags: common_fields.tags,
    fileURL: common_fields.fileURL,
    issues: {           // updatable
        type: [issueSchema],                // cant enforce uniqueness on 'title' for a nested subdocument schema
    },
    
})
// ensures that no reports under the same project can have the same title
reportSchema.index({ title: 1, project: 1 }, { unique: true })


const taskSchema = new Schema({
    title: common_fields.title,
    description: common_fields.description,
    project: common_fields.project,
    status: common_fields.status,
    cost: {             // not updatable
        type: Number,
        required: true,
        min: 0
    },
    assignedTo: {       // updatable
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    }
})
taskSchema.index({ title: 1, project: 1 }, { unique: true })

const blueprintSchema = new Schema({
    title: common_fields.title,
    project: common_fields.project,
    tags: common_fields.tags,
    uploadedBy: common_fields.uploadedBy
})
blueprintSchema.index({ title: 1, project: 1 }, { unique: true });

const projectSchema = new Schema({
    title: {            // unique, not updatable
        type: String,
        required: true,
        match: [/^[A-Za-z0-9\s]{2,}$/, 'Incorrect title format']
    },
    description: common_fields.description,
    status: common_fields.status,
    company: {          // not updatable
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Company'
    },
    members: [{        // updatable (assignable/deletable by a field manager, or assign)
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    budget: {           // updatable
        type: Number,
        required: true,
        min: 0
    }
}, {
    query: {
        byCompanyId: function (companyId) {
            return this.where({company: companyId})
        },
        byMemberId: function (memberId) {
            return this.where({ members: memberId })
        }
    }
})
projectSchema.index({title: 1, company: 1}, {unique: true})

// Duplicate key errors are parsed from MongoDB Driver to our user defined error handlnig system
//
const top_level_shcemas = [userSchema, companySchema, projectSchema, blueprintSchema, taskSchema, reportSchema]
top_level_shcemas.map(schema => {
    schema.post('save', function(error, doc, next) {
        // if there is a duplicate key error
        if (error.name === 'MongoServerError' && error.code === 11000) {
            // check if it's a username duplicate
            if (doc instanceof User) {
                next(new Error('Username already exists. Please choose a different username.'));
            }
            // check if it's a company title duplicate
            else if (doc instanceof Company) {
                next(new Error('Company name already exists. Please choose a different company name.'));
            }
            // or else, pass it on as a general duplicate key error
            else {
                next(new DuplicateKeyError(`Duplicate key error; document with unique index already exists: documentId: ${doc._id}`));
            }
        } else {
            next(error);
        }
    });
})

// consts must be declared before usage at top level 
// (database middleware uses the Model not schema to do castcading update queries)
// i.e. projectSchema uses Blueprint, Task, and Report for pre-findOneAndDelete middleware
// see usage below
//


export const Blueprint = model('Blueprint', blueprintSchema)

export const Task = model('Task', taskSchema)

export const Report = model('Report', reportSchema)


// see mongoose middleware for .pre

/**
 * Castcade project(s) deletion to delete all tasks, blueprints, reports associated 
 * with that project
 * 
 * when using Project.findOneAndDelete, ensure that only field managers are able to do this operation
*/
projectSchema.pre('findOneAndDelete', async function(next) {
    const doc_to_delete = await this.model.findOne(this.getQuery())
    if (!doc_to_delete) {
        const error = new NotFoundError('Project not found')
        next(error)
    } else {
        const {_id: id} = doc_to_delete
        // implicit $in
        const filter = { project: id } 
        const models_with_fk = [Blueprint, Task, Report]
        
        await Promise.all(models_with_fk.map(async e => await e.deleteMany(filter)))
        next()
    }
})
// multi-project deletion castcade implementation
// Project.deleteMany should never be used outside of this file. only usage is below in company pre-delete middleware
projectSchema.pre('deleteMany', async function(next) {
    const docs_to_delete = await this.model.find(this.getQuery())
    const models_with_fk = [Blueprint, Task, Report]
    const ids = docs_to_delete.map(({ _id }) => _id)
    // implicit $in in this filter
    const filter = { project: ids }
    
    // implicit $in in mongoose for queries
    await Promise.all(models_with_fk.map( async e => await e.deleteMany(filter) ))
    next()
    
})

export const User = model('User', userSchema)

export const Project = model('Project', projectSchema);

/*
 * Castcade a company deletion operation to delete projects and owner
 *  associated with that company
 * 
 * before calling this method in middleware, ensure that a User who is
 * calling it is validated to be the company's owner
 * 
 
 */
companySchema.pre('findOneAndDelete', async function(next) {
    const doc_to_delete = await this.model
        .findOne(this.getQuery())
    if (!doc_to_delete) {
        return next(new NotFoundError('Company not found'))
    }
    const { _id: companyId } = doc_to_delete
    // delete projects associates with this company, deleteMany is already castcaded for projects 
    await Project.deleteMany({ company: companyId })
    // d
    // finally, delete all users associated with this company, including owner
    await User.deleteMany({ company: companyId })
    next()
})

export const Company = model('Company', companySchema)

