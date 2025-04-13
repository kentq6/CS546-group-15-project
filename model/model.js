import mongoose, { model } from 'mongoose'

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        match: [/^[A-Za-z0-9_]{5,}$/, 'Incorrect username format']
    },
    password: {
        type: String,
        required: true,
        match: [/^[A-Za-z0-9!?]{8,}$/, 'Incorrect password format']
    },
    firstname: {
        type: String,
        required: true,
        default: ''
    },
    lastname: {
        type: String,
        required: true,
        default: ''
    },
    role: {
        type: String,
        enum: ["Owner, Admin, Field Manager, Engineer"],
        required: true
    }
});

const companySchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        match: [/^[A-Za-z0-9\s]{2,}$/, 'Incorrect title format']
    },
    location: {
        type: String,
        required: true,
        match: [/^[A-Za-z\s\-']+, [A-Za-z\s\-']+$/, 'Incorrect Location format']
    },
    industry: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    employees: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }]
}, {timestamps: true});

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        match: [/^[A-Za-z0-9\s]{2,}$/, 'Incorrect title format']
    },
    description: {
        type: String,
        required: true,
        default: ''
    },
    cost: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Complete']
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const blueprintSchema = new Schema({
    title: {
        type: String,
        required: true,
        match: [/^[A-Za-z0-9\s]{2,}$/, 'Incorrect title format']
    },
    fileURL: {
        type: String,
        required: true,
        match: [/^.+\.(pdf|jpeg|png)$/i, 'Incorrect file format']
    },
    tags: [String],
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const reportSchema = new Schema({
    title: {
        type: String,
        required: true,
        match: [/^[A-Za-z0-9\s]{2,}$/, 'Incorrect title format']
    },
    description: {
        type: String,
        required: true,
        default: ''
    },
    tags: [String],
    fileURL: {
        type: String,
        required: true,
        match: [/^.+\.(pdf|jpeg|png)$/i, 'Incorrect file format']
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    issues: [new Schema({
        title: {
            type: String,
            required: true,
            match: [/^[A-Za-z0-9\s]{2,}$/, 'Incorrect title format']
        },
        description: {
            type: String,
            required: true,
            default: ""
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'InProgress', 'Complete']
        },
        raisedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }, {timestamps: true})]
});

const projectSchema = new Schema({
    title: {
        type: String,
        required: true,
        match: [/^[A-Za-z0-9\s]{2,}$/, 'Incorrect title format'],
        unique: true
    },
    description: {
        type: String,
        required: true,
        default: ''
    },
    budget: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Complete']
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    }],
    tasks: [taskSchema],
    blueprints: [blueprintSchema],
    reports: [reportSchema]
}, {
    query: {
        byMemberId: function(memberId) {
            return this.where('members').equals(memberId);
        }
    }
});



export const User = model('User', userSchema);

export const Company = model('Company', companySchema);

export const Project = model('Project', projectSchema);


