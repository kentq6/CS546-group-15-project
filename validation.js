import { ObjectId } from 'mongodb';

const exportedMethods = {
  // Valid String
  isValidString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces!`;

    return strVal;
  },
  // Valid Number
  isValidNumber(value, fieldName) {
    if (value === undefined || value === null) throw `Error: ${fieldName} is required!`;
  
    const num = Number(value);
    if (isNaN(num)) throw `Error: ${fieldName} must be a number!`;
    if (num < 0) throw `Error: ${fieldName} cannot be negative!`;
  
    return num;
  },
  
  // Valid ID Format
  isValidId(id, varName) {
    if (!id) throw `Error: You must provide a valid ${varName}!`;
    if (typeof id !== 'string') throw `Error: ${varName} must be a string!`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces!`;
    if (!ObjectId.isValid(id)) 
      throw `Error: ${varName} is an invalid object ID!`;

    return id;
  },
  // Valid Array
  isValidArray(arr, varName = 'array') {
    if (!arr) {
        console.warn(`Warning: ${varName} is undefined, defaulting to an empty array.`);
        return [];
    }
    if (!Array.isArray(arr)) throw `Error: ${varName} is not an array!`;
    return arr;
  },
  // Valid Name
  isValidName(name) {
    name = this.isValidString(name, 'name');
    // define correct name format (regex.)
    const validName = /^[A-Za-z]{3,}\s[A-Za-z]{3,}$/;
    if (!validName.test(name))
      throw `Error: ${name || 'Provided input'} is not a valid name!`;

    return name;
  },
  // Valid Username
  isValidUsername(username) {
    username = this.isValidString(username, 'username');
    // defintes correct format of username
    const validUsername = /^[A-Za-z0-9_]{5,}$/;
    if (!validUsername.test(username))
      throw `Error: ${username || 'Provided Input'} is not a valid username!`;

    return username;
  },
  // Valid Password
  isValidPassword(password) {
    password = this.isValidString(password, 'password');
    // defintes correct format of password
    const validPassword = /^[A-Za-z0-9!?]{8,}$/;
    if (!validPassword.test(password))
      throw `Error: Not a valid password!`;

    return password;
  },
  // Valid Title
  isValidTitle(title) {
    title = this.isValidString(title, 'title');
    const validTitle = /^[A-Za-z0-9\s]{2,}$/;
    if (!validTitle.test(title))
      throw `Error: ${title || 'Provided Input'} is not a valid title!`;

    return title;
  },
  // Valid File Format
  isValidFileUrl(fileUrl, varName) {
    // validates input as a string
    fileUrl = this.isValidString(fileUrl, varName || 'fileUrl');
    // defines correct format of file Url
    const validUrlRegex = /^.+\.(pdf|jpeg|png)$/i;
    // checks if URL is valid
    if (!validUrlRegex.test(fileUrl))
      throw `Error: ${varName} is not a valid file URL!`;

    return fileUrl;
  },
  // Valid Status
  isValidStatus(status, def) {
    status = this.isValidString(status, 'status');
    if (!def.includes(status))
      throw `Error: ${status || 'Provided Input'} is not a valid status!`;

    return status;
  },
  // Valid Location Format
  isValidLocation(location) {
    // validates input as a string
    location = this.isValidString(location, 'location');
    // defines correct format of location
    const locationRegex = /^[A-Za-z\s\-']+, [A-Za-z\s\-']+$/;
    // checks if location is valid format
    if (!locationRegex.test(location))
      throw `Error: Location must be in the format 'City, State/Country'!`;
  
    return location;
  },
  // Valid Movie
  isValidUser(name, username, password, role) {
    // checks if all fields have values
    if (!name || !username || !password || !role)
      throw 'Error: All fields need to have values!';

    // validates each field accordingly
    name = this.isValidName(name);
    username = this.isValidString(username, 'username');
    password = this.isValidString(password, 'password');
    role = this.isValidString(role, 'role');

    return { name, username, password, role };
  },

  isValidProject(title, description, budget, status, members, tasks, blueprints, reports, companyId) {
    // checks if all fields except optional ones have values
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Budget:', budget);
    console.log('Status:', status);
    console.log('Members:', members);
    console.log('Tasks:', tasks);
    console.log('Blueprints:', blueprints);
    console.log('Reports:', reports);
    console.log('CompanyId:', companyId);
    if (!title || !description || !budget || !status || !companyId)
      throw 'Error: Title, description, budget, status, and companyId are required fields!';

    // validates each field accordingly
    title = this.isValidTitle(title);
    description = this.isValidString(description, 'description');
    budget = this.isValidNumber(budget, 'budget');
    status = this.isValidStatus(status, ['Pending', 'In Progress', 'Completed']);
    if (members.length !== 0) members.forEach(userId => this.isValidId(userId, `${userId}`));
    if (tasks.length !== 0) tasks.forEach(taskId => this.isValidId(taskId, `${taskId}`));
    if (blueprints.length !== 0) blueprints.forEach(blueprintId => this.isValidId(blueprintId, `${blueprintId}`));
    if (reports.length !== 0) reports.forEach(reportId => this.isValidId(reportId, `${reportId}`));
    companyId = this.isValidId(companyId, 'companyId');

    return { title, description, budget, status, members, tasks, blueprints, reports, companyId };
  },

  isValidTask(title, description, assignedTo, cost, status) {
    // checks if all fields have values
    if (!title || !description || !cost || !status || !assignedTo)
      throw 'Error: All fields have to have values!';
  
    // validates each field accordingly
    title = this.isValidTitle(title);
    description = this.isValidString(description, 'description');
    cost = this.isValidNumber(cost, 'cost');
    status = this.isValidStatus(status, ['Pending', 'In Progress', 'Completed']);
    this.isValidId(assignedTo, 'assignedTo'); // Validate single user ID
    // this.isValidId(projectId, 'projectId'); // Validate project ID
  
    return { title, description, cost, status, assignedTo, projectId };
  },
  isValidBlueprint(title, fileUrl, tags, uploadedBy) {
    // checks if all fields have values
    if (!title || !fileUrl || !tags || !uploadedBy)
      throw 'Error: All fields have to have values!';

    // validates each field accordingly
    title = this.isValidTitle(title);
    fileUrl = this.isValidFileUrl(fileUrl, 'fileUrl');
    tags.forEach(tag => this.isValidString(tag, `${tag}`));
    uploadedBy = this.isValidId(uploadedBy, 'uploadedBy');


    return { title, fileUrl, tags, uploadedBy };
  },
  isValidReport(title, description, fileUrl, tags, uploadedBy, projectId) {
    // checks if all fields have values
    if (!title || !description || !fileUrl || !tags || !uploadedBy || !projectId)
      throw 'Error: All fields have to have values!';

    // validates each field accordingly
    title = this.isValidTitle(title);
    description = this.isValidString(description, 'description');
    fileUrl = this.isValidFileUrl(fileUrl, 'fileUrl');
    tags.forEach(tag => this.isValidString(tag, `${tag}`));
    uploadedBy = this.isValidId(uploadedBy, 'uploadedBy');
    projectId = this.isValidId(projectId, 'projectId');

    return { title, description, fileUrl, tags, uploadedBy, projectId };
  },
  isValidReportForPutRQ(title, description, fileUrl, tags, uploadedBy) {
    // checks if all fields have values
    if (!title || title.length === 0) {
      throw "title is invalid";
    }
    if (!description || description.length === 0) {
      throw "description is invalid";
    }
    if (!fileUrl || fileUrl.length === 0) {
      throw "fileUrl is invalid";
    }
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      throw "tags is invalid";
    }
    if (!uploadedBy || uploadedBy.length === 0) {
      throw "uploadedBy is invalid";
    }

    return { title, description, fileUrl, tags, uploadedBy };
  },
  isValidCompany(title, location, industry, ownerId, members, projects) {
    // checks if all fields have values
    if (!title || !location || !industry || !ownerId || !members || !projects)
      throw 'Error: All fields have to have values!';

    // validates each field accordingly
    title = this.isValidTitle(title);
    location = this.isValidLocation(location);
    industry = this.isValidString(industry, 'industry');
    ownerId = this.isValidId(ownerId, 'ownerId');
    members.forEach(userId => this.isValidId(userId, `${userId}`));
    projects.forEach(projectId => this.isValidId(projectId, `${projectId}`));

    return { title, location, industry, ownerId, members, projects };
  },
};

export default exportedMethods;
