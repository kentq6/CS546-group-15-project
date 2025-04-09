//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.
import moment from 'moment';
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
  isValidNumber(numVal, varName) {
    if (!numVal) throw `Error: You must supply a ${varName}!`
    if (typeof numVal !== 'number') throw `Error: ${varName} must be a number!`;
    if (numVal < 0) throw `Error: ${varName} cannot be negative!`;

    return numVal;
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
  // Valid Date
  isValidDate(date) {
    // checks if date is a valid string
    date = this.isValidString(date, 'date');
    // parse through date using moment ('true' param. for strict formatting)
    const parsedDate = moment(date, 'MM/DD/YYYY', true);
    // check if date exists (NOTE: .isValid() is a moment.js built-in function)
    if (!parsedDate.isValid()) 
      throw 'Error: Not a valid date!';
    // set bounds of valid date
    const lowerBound = moment('01/01/1900', 'MM/DD/YYYY');
    const currentYear = new Date().getFullYear();
    const upperBound = moment(`12/31/${currentYear + 2}`, 'MM/DD/YYYY');
    // check if date is valid
    if (parsedDate.isBefore(lowerBound))
      throw 'Error: Date cannot be less than 01/01/1900!';
    if (parsedDate.isAfter(upperBound))
      throw 'Error: Date cannot exceed over 2 years of current year!';
    return date;
  },
  // Valid File Format
  isValidFileUrl(fileUrl, varName) {
    // validates input as string
    fileUrl = this.isValidString(fileUrl, varName || 'fileUrl');
    // define correct format of file Url
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
  // Valid Movie
  isValidUser(username, password, role, projects, companyId) {
    // checks if all fields have values
    if (!username || !password || !role || !projects || !companyId)
      throw 'Error: All fields need to have values!';

    // validates each field accordingly
    username = this.isValidString(username, 'username');
    password = this.isValidString(password, 'password');
    role = this.isValidString(role, 'role');
    projects.forEach(projectId => this.isValidId(projectId, `${projectId}`));
    companyId = this.isValidId(companyId);

    return { username, password, role, projects, companyId };
  },
  isValidProject(title, description, budget, status, teamMembers, tasks, blueprints, reports, companyId) {
    // checks if all fields have values
    if (!title || !description || !budget || !status || !teamMembers || !tasks || !blueprints || !reports || !companyId)
      throw 'Error: All fields have to have values!';

    // validates each field accordingly
    title = this.isValidString(title, 'title');
    description = this.isValidString(description, 'description');
    budget = this.isValidNumber(budget, 'budget');
    status = this.isValidStatus(status, ['Pending', 'In Proress', 'Completed']);
    teamMembers.forEach(userId => this.isValidId(userId, `${userId}`));
    tasks.forEach(taskId => this.isValidId(taskId, `${taskId}`));
    blueprints.forEach(blueprintId => this.isValidId(blueprintId, `${blueprintId}`));
    reports.forEach(reportId => this.isValidId(reportId, `${reportId}`));
    companyId = this.isValidId(companyId, 'companyId');

    return { title, description, budget, status, teamMembers, tasks, blueprints, reports, companyId };
  },
  isValidTask(title, description, cost, status, assignedTo, projectId) {
    // checks if all fields have values
    if (!title || !description || !cost || !status || !assignedTo || !projectId)
      throw 'Error: All fields have to have values!';

    // validates each field accordingly
    title = this.isValidString(title, 'title');
    description = this.isValidString(description, 'description');
    cost = this.isValidNumber(cost, 'cost');
    status = this.isValidStatus(status, ['Pending', 'In Proress', 'Completed']);
    teamMembers.forEach(userId => this.isValidId(userId, `${userId}`));
    companyId = this.isValidId(companyId, 'companyId');

    return { title, description, cost, tasks, blueprints, reports, teamMembers, companyId };
  },
  isValidBlueprint(title, fileUrl, tags, uploadedBy, projectId) {
    // checks if all fields have values
    if (!title || !fileUrl || !tags || !uploadedBy || !projectId)
      throw 'Error: All fields have to have values!';

    // validates each field accordingly
    title = this.isValidString(title, 'title');
    fileUrl = this.isValidFileUrl(fileUrl, 'fileUrl');
    tags.forEach(tag => this.isValidString(tag, `${tag}`));
    uploadedBy = this.isValidId(uploadedBy, 'uploadedBy');
    projectId = this.isValidId(projectId, 'projectId');

    return { title, fileUrl, tags, uploadedBy, projectId };
  },
  isValidReport(title, description, fileUrl, tags, uploadedBy, projectId) {
    // checks if all fields have values
    if (!title || !description || !fileUrl || !tags || !uploadedBy || !projectId)
      throw 'Error: All fields have to have values!';

    // validates each field accordingly
    title = this.isValidString(title, 'title');
    description = this.isValidString(description, 'description');
    fileUrl = this.isValidFileUrl(fileUrl, 'fileUrl');
    tags.forEach(tag => this.isValidString(tag, `${tag}`));
    uploadedBy = this.isValidId(uploadedBy, 'uploadedBy');
    projectId = this.isValidId(projectId, 'projectId');

    return { title, description, fileUrl, tags, uploadedBy, projectId };
  },
};

export default exportedMethods;
