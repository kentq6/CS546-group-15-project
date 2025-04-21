import mongoose, { model } from 'mongoose'
import { DuplicateKeyError, NotFoundError } from '../error/error';

const { Schema } = mongoose;

const capitalizeWords = (str) => {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

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
        required: true,
        match: [/^[A-Za-z0-9!?]{8,30}$/, 'Incorrect password format']
    },
    firstname: {        // not updatable
        type: String,
        required: true,
        match: [/^[A-Za-z]{1,30}$/, 'Incorrect firstname format'],
        trim: true,                                     // setter calls trim() before the match validator
        lowercase: true,                                // setter calls toLowerCase() before the match validator
        get: capitalizeWords                            // getter capitalizes words
    },
    lastname: {         // not updatable
        type: String,
        required: true,
        match: [/[A-Za-z]{1,30}/, 'Incorrect lastname format'],
        trim: true,
        lowercase: true,
        get: capitalizeWords
    },
    company: {          // not updatable
        type: Schema.type.ObjectId,
        required: true,
        ref: 'Company'
    },
    role: {             // not updatable
        type: String,
        enum: ['Owner', 'Field Manager', 'Engineer'],
        required: true
    }
}, {
    query: {
        byProjectId: function (projectId) {
            return this.where({projects: projectId})
        }
    }
})

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
        match: [/^[A-Za-z\s]{2,30}$/],
        trim: true,
        lowercase: true,
        get: capitalizeWords
    }
    // adds automatic createdAt and updatedAt fields, and auto updates them as documents are created/updated
}, { timestamps: true })

const common_fields = {
    title: {        // non-unique title | non-updatabale
        type: String,
        required: true,
        match: [/^[A-Za-z0-9\s]{2,30}$/, 'Incorrect title format'],
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
        match: [/^[A-Za-z0-9]{2,30}$/],
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
taskSchema.index({ title: 1, projectId: 1 }, { unique: true })

const blueprintSchema = new Schema({
    title: common_fields.title,
    project: common_fields.project,
    tags: common_fields.tags,
    uploadedBy: common_fields.uploadedBy
})
blueprintSchema.index({ title: 1, projectId: 1 }, { unique: true });

const projectSchema = new Schema({
    title: {            // unique
        type: String,
        required: true,
        match: [/^[A-Za-z0-9\s]{2,}$/, 'Incorrect title format'],
        unique: true
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
            return this.wheere({ members: memberId })
        }
    }
})

// Duplicate key errors are parsed from MongoDB Driver to our user defined error handlnig system
//
const top_level_shcemas = [userSchema, companySchema, projectSchema, blueprintSchema, taskSchema, reportSchema]
top_level_shcemas.map(schema => {
    schema.post('save', function(error, doc, next) {
        if (error.name === 'MongoServerError' && error.code === 11000) {
          next(new DuplicateKeyError('Duplicate key error; document with unique index already exists'))
        } else {
          next()
        }
      })
})

// consts must be declared before usage at top level 
// (pre-save middleware uses the Model not schema to do castcading update queries)
// see usage below
//


export const Blueprint = model('Blueprint', blueprintSchema)

export const Task = model('Task', taskSchema)

export const Report = model('Report', reportSchema)


// there must not be any dangling references to a project one it is deleted

/**
 * Castcade project(s) deletion to delete all tasks, blueprints, reports associated 
 * with that project; remove all instances of said project in all ObjectId foreign-key arrays
 * in all User documents
*/
projectSchema.pre('findOneAndDelete', async function(next) {
    const doc_to_delete = await this.model.findOne(this.getQuery())
    if (!doc_to_delete) {
        const error = new NotFoundError('Project not found')
        next(error)
    } else {
        const {_id: id} = doc_to_delete
        const filter = { project: id } 
        const models_with_fk = [Blueprint, Task, Report]
        
        await Promise.all(models_with_fk.map(e => e.deleteMany(filter)))
        next()
    }
})
// multi-project deletion castcade implementation
projectSchema.pre('deleteMany', async function(next) {
    const docs_to_delete = await this.model.find(this.getQuery())
    const models_with_fk = [Blueprint, Task, Report]
    const ids = docs_to_delete.map(({_id}) => _id)
    // implicit $in in this filter
    const filter = { project: ids }
    
    // implicit $in in mongoose for queries
    await Promise.all(models_with_fk.map(e => e.deleteMany(filter)))
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
 * TODO: implement DELETE /company/:id with 'findOneAndDelete'
 */
companySchema.pre('findOneAndDelete', async function(next) {
    const doc_to_delete = await this.model
        .findOne(this.getQuery())
        .populate('owner')
    if (!doc_to_delete) {
        return next(new NotFoundError('Company not found'))
    }
    if (!doc_to_delete.owner) {
        return next(new NotFoundError('Owner for queried company not found'))
    }
    // delete projects associates with this company, deleteMany is already castcaded for projects 
    await Project.find().byCompanyId(doc_to_delete._id).deleteMany()
    // finally, delete owner associated with this company
    await User.findOneAndDelete({_id: doc_to_delete.owner._id})
    next()
})

export const Company = model('Company', companySchema)

/**
 *      * GET /projects
 *          * for engineers and field manages, get all projects they are members of 
 *          * for owners get all projects for the company
 *      * POST /projects
 *          * ensure that only task managers call this. 
 *          * automatically add task manager to the project 
 *              (get Task Manager id from param, append it to the list of initial task members, then addToSet)
 * 
 *      * GET /projects/:project_id
 *          * any memeber belonging to the project or Owner of the project's company can call this
 *      * PUT /projects/:project_id 
 *          * can only be called by Field Managers belonging to this project
 *          * description, status, members, budget
 *      * DELETE /projects/:project_id 
 *          * must be called by a Task Manager
 *          * castcade updates to all subproject compoenents
 * 
 *      
 *      * GET /users
 *          * only owner can call this
 *      * POST /users
 *          * only owner can call this
 *          * only able to create a 'non-owner'
 *          * automatically adds user to their company
 *          * for creating an 'owner' see POST /companies
 *      * PUT /users
 *          * only user that made the request can call this 
 *          * can only update their password or first/lastname, NOT projects, username, nor role
 * 
 *      * DELETE /users/:user_id
 *          * only owner can call this
 *          * onwer cannot delete oneself
 *          * owner can only delete users belonging to their company
 * 
 * 
 * 
 *      * POST /companies
 *          * creates both a company and an owner
 *          * unprotected route
 *          * make sure to validate all fields for both 
 *              company and user before creating them in DB
 *          * crate company first, then user
 * 
 *      * PUT /companies/:company_id
 *          * only owner can do this
 *          * only 'location' and 'industry' can be changed
 * 
 *      * DELETE /companies/:company_id
 *          * only owner can do this
 *          * must castcade deletes for: users, projects, and all
 *               subtasks associated with those projects
 *          
 * 
 * 
 *      * GET /projects/:project_id/blueprints
 *          * called by any member of the project or owner
 *          * support filtering by 'title' and 'tags'
 *      * POST /projects/:project_id/blueprints
 *          * called by any member of the project
 *          * save the uploader id to the db
 * 
 *      * GET /projects/:project_id/tasks/:task_id
 *          * called by member of the project or owner
 *      * PUT /projects/:project_id/blueprints/:blueprint_id
 *          * called by any member of the project
 *          * 'tags' is the only updatable field
 *      * DELETE /projets/:project_id/blueprints/:blueprint_id
 *          * callable only by Field Manager
 *
 * 
 * 
 * 
 *      * GET /projects/:project_id/tasks
 *          * called by any member of the project or owner
 *          * for engineers, get all tasks 'assignedTo' them on that project
 *          * for Field Managers, get all tasks for the project
 *          * support filtering by 'title' and 'tags'
 *      * POST /projects/:project_id/tasks
 *          * called by Field Managers
 *          * assigned to any member of the project
 * 
 *      * GET /projects/:project_id/tasks/:task_id
 *          * called by member of the project or owner
 *      * PUT /projects/:project_id/tasks/:task_id
 *          * callable by Field Manger or project member task is 'assignedTo' on that project
 *          * only 'status' is updatable
 *      * DELETE /projects/:project_id/tasks/:task_id
 *          * callable only by Field Manager
 * 
 * 
 * 
 *      * GET /projects/:project_id/reports
 *          * called by any member of the project or owner
 *          * support filtering via query params by 'title' and 'tags'
 *      * POST /projects/:project_id/reports
 *          * called by any member of the project
 *      
 *      * GET /projects/:project_id/reports/:report_id
 *          * called by member of the project or owner
 *      * PUT /projects/:project_id/reports/:report_id
 *          * called by any member of the project
 *          * only 'tags' can be updated
 *      * DELETE /projects/:project_id/reports/:report_id
 *          * callable only by Field Manager
 * 
 * 
 *      * GET /projects/:project_id/reports/:report_id/issues/
 *          * see auth scenario for GET /projects/:project_id/reports
 *      * POST /projects/:project_id/reports/:report_id/issues/
 *          * called by any member of the project
 *          * ensure the issue uploader is input in 'uploadedBy'
 * 
 *      * GET /projects/:project_id/reports/:report_id/issues/:issue_id
 *          * see GET /projects/:project_id/reports for auth scenario
 *      * PUT /projects/:project_id/reports/:report_id/issues/:issue_id
 *          called by any member of the project
 *          only 'status' is updatable
 *       * DELETE /projects/:project_id/reports/:report_id/issues/:issue_id
 *          * callable only by Field Manager
 *          
 * 
 * 
 * 
 * 
 * 
 *      TODO have that when a user logs in, depending on their role, their rendered dashboard is different with different pages
 *      
 * 
 */
