//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.
import moment from 'moment';
import { ObjectId } from 'mongodb';

const exportedMethods = {
  // INPUT VALIDATION: Valid String
  isValidString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces!`;

    return strVal;
  },
  // INPUT VALIDATION: Valid ID Format
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
  // INPUT VALIDATION: Valid Date
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
  // INPUT VALIDATION: Valid String Array
  isValidStringArray(arr) {
    if (!Array.isArray(arr) || arr.length < 1)
      throw `Error: '${arr || 'Provided input'}' is not a valid string array!`;

    // checks if each elem. is a valid string
    arr.forEach((elem, index, array) => {
      this.isValidString(elem, elem);
      
      // trims each name
      array[index] = elem.trim();
    });

    return arr; 
  },
  // INPUT VALIDATION: Valid Movie
  isValidUser(username, password, role, projects, companyId) {
    // checks if all fields have valid values
    if (!username || !password || !role || !projects || !companyId)
      throw 'Error: all fields need to have values!';

    // checks if username is a string
    username = this.isValidString(username, 'username');
    // checks if password is a string
    password = this.isValidString(password, 'password');
    // checks if role is a string
    role = this.isValidString(role, 'role');
    // checks if projects is a string array of valid ObjectIDs
    projects = this.isValidStringArray(projects);
    projects.forEach(project => this.isValidId(project));
    // checks if companyId is a valid ObjectID
    companyId = this.isValidString(companyId, 'companyId');
    companyId = this.isValidId(companyId);

    return { username, password, role, projects, companyId };
  },
};

export default exportedMethods;
