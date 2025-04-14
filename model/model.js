import mongoose, { model } from 'mongoose'

const { Schema } = mongoose;

const capitalizeWords = (str) => {
    return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        match: [/^[A-Za-z0-9_]{5,30}$/, 'Incorrect username format'],
    },
    password: {
        type: String,
        required: true,
        match: [/^[A-Za-z0-9!?]{8,30}$/, 'Incorrect password format']
    },
    firstname: {
        type: String,
        required: true,
        match: [/^[A-Za-z]{1,30}$/, 'Incorrect firstname format'],
        trim: true,
        lowercase: true,
        get: capitalizeWords
    },
    lastname: {
        type: String,
        required: true,
        match: [/[A-Za-z]{1,30}/, 'Incorrect lastname format'],
        trim: true,
        lowercase: true,
        get: capitalizeWords
    },
    role: {
        type: String,
        enum: ['Owner', 'Admin', 'Field Manager', 'Engineer'],
        required: true
    }
});

const companySchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        match: [/^[A-Za-z0-9\s]{2,30}$/, 'Incorrect title format'],
        trim: true
    },
    location: {
        type: String,
        required: true,
        match: [/^[A-Za-z\s\-']{2,30}, [A-Za-z\s\-']{2,30}$/, 'Incorrect Location format'],
        trim: true,
        lowercase: true,
        get: capitalizeWords
    },
    industry: {
        type: String,
        required: true,
        match: [/^[A-Za-z\s]{2,30}$/],
        trim: true,
        lowercase: true,
        get: capitalizeWords
    },
    ownerId: {
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
}, {timestamps: true}); // adds automatic createdAt and updatedAt fields, and auto updates them as documents are created/saved


const issueSchema = new Schema({
    title: {
        type: String,
        required: true,
        match: [/^[A-Za-z0-9\s]{2,30}$/, 'Incorrect title format'],
        trim: true
    },
    description: {
        type: String,
        required: true,
        default: ''
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'InProgress', 'Complete'],
        default: 'Pending'
    },
    raisedBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {timestamps: true});

const reportSchema = new Schema({
    title: {
        type: String,
        required: true,
        match: [/^[A-Za-z0-9\s]{2,30}$/, 'Incorrect title format'],
        trim: true
    },
    description: {
        type: String,
        required: true,
        default: ''
    },
    projectId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    tags: [{
        type: String,
        match: [/^[A-Za-z0-9]{2,30}$/],
        lowercase: true,
        trim: true
    }],
    fileURL: {
        type: String,
        required: true,
        match: [/^.+\.(pdf|jpeg|png)$/i, 'Incorrect file format'],
        trim: true
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    issues: {
        type: [issueSchema],
        validate: (arr) => {
            const titles = arr.map(e=>e.title)
            return Set(titles).size === titles.length
        }
    }
});
// ensures that no reports under the same project can have the same title
reportSchema.index({ title: 1, projectId: 1 }, { unique: true });


const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        match: [/^[A-Za-z0-9\s]{2,30}$/, 'Incorrect title format'],
        trim: true
    },
    description: {
        type: String,
        required: true,
        default: '',
    },
    projectId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Complete'],
        default: 'Pending'
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    }
});
taskSchema.index({ title: 1, projectId: 1 }, { unique: true });

const blueprintSchema = new Schema({
    title: {
        type: String,
        required: true,
        match: [/^[A-Za-z0-9\s]{2,30}$/, 'Incorrect title format'],
        trim: true,
    },
    projectId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    fileURL: {
        type: String,
        required: true,
        match: [/^.+\.(pdf|jpeg|png)$/i, 'Incorrect file format'],
        trim: true
    },
    tags: [{
        type: String,
        match: [/^[A-Za-z0-9]{2,30}$/],
        lowercase: true,
        trim: true
    }],
    uploadedBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});
blueprintSchema.index({ title: 1, projectId: 1 }, { unique: true });

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
        enum: ['Pending', 'In Progress', 'Complete'],
        default: 'Pending'
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    }]
}, {
    query: {
        byMemberId: function(memberId) {
            return this.where({ members: memberId })
        }
    }
});



export const User = model('User', userSchema);

export const Company = model('Company', companySchema);

export const Project = model('Project', projectSchema);


