# CS546-group-15-project
# Test instructions
- run `npm install` to install packages
- run `npm run seed` to seed the database
- run `npm run start` to start the server

# Testing It Out!
After running the seed file, view the console log to see all of our demo account credentials. 
Log in either with an:
- owner account
- field manager account
- or engineering account
to see how to view, manage, and update users, projects, or project subcomponents, you can toy with the UI.

# Route Specification
In lieu of an OpenAPI specification, here are some definitions for our routes

```
 *      * GET /projects
 *          * for engineers and field manages, get all projects they are members of 
 *          * for owners get all projects for the company
 *      * POST /projects
 *          * 'field manager' creates a new project
 *          * ensure that only 'field manager' call this. 
 *          * ensure that no user that a 'field manager' is adding to a project
 *              has the owner role
 *          * automatically add 'field manager' to the project 
 *              (get 'field manager' id from param, append it to the list of initial members, then addToSet)
 * 
 *      * GET /projects/:project_id
 *          * gets a singular project
 *          * any memeber of the project or 'owner' of the project's company can call this
 *      * PUT /projects/:project_id 
 *          * updates a singular project
 *          * can only be called by 'field manager' that is a  member of this project
 *          * only 'description', 'status', 'members', 'budget' are updatabalse
 *          * if updating members, ensure that each member in the request is not an owner
 *          * figure out how to add
 *      * DELETE /projects/:project_id 
 *          * deletes a singular project
 *          * must be called by a 'field manager' that is a member of this project
 *          * castcade updates to all subproject compoenents
 * 
 *      
 *      * GET /users
 *          * get all users for a company
 *          * any user part of the same company can do this
 *          * only return non-sensitive details (_id, username, firstname, lastname)
 *          * maybe support query params i.e. find by username
 *      * POST /users
 *          * create a user
 *          * only owner can call this
 *          * only able to create a 'non-owner'
 *          * automatically adds user to their company
 *          * for creating an 'owner' see POST /company
 *      * PUT /users
 *          * update a user
 *          * only user that made the request can call this 
 *          * can only update their 'password', 'firstname' or 'lastname', NOT projects, username, nor role
 * 
 * 
 *      * GET /users/:target_user_id
 *          * gets a specific user
 *          * any user part of the same company as the target can do this
 * 
 *      * DELETE /users/:target_user_id
 *          * only owner can call this
 *          * onwer cannot delete oneself
 *          * owner can only delete users belonging to their company
 *          * for deleting an owner, see DELETE /company
 *          * remove user from all projects they are members of
 * 
 * 
 * 
 *      * POST /company
 *          * creates both a company and an owner
 *          * unprotected route
 *          * make sure to validate all fields for both 
 *              company and user before creating them in DB
 *          * crate company first, then user
 *      * GET /company
 *          * gets company details of the company
 *          * only users of a company can call this
 *      * PUT /company
 *          * only owner can do this
 *          * only 'location' and 'industry' can be changed
 *      * DELETE /company
 *          * only owner can do this
 *          * must castcade deletes for: users, projects, and all
 *               subtasks associated with those projects
 *          * deletes owners account as well
 * 
 *          
 * 
 * 
 *      * GET /projects/:project_id/blueprints
 *          * callable only by any 'member' of the project or 'owner'
 *          * support filtering by 'title' and 'tags'
 *      * POST /projects/:project_id/blueprints
 *          * callable only by any 'member' of the project
 *          * save the uploader id to the db
 * 
 *      * GET /projects/:project_id/blueprints/:blueprint_id
 *          * callable only by any 'member' of the project or 'owner'
 *      * PUT /projects/:project_id/blueprints/:blueprint_id
 *          * callable only by any 'member' of the project
 *          * 'tags' is the only updatable field
 *      * DELETE /projets/:project_id/blueprints/:blueprint_id
 *          * callable only by 'field manager'
 *
 * 
 * 
 * 
 *      * GET /projects/:project_id/tasks
 *          * callable only by any 'member' of the project or 'owner'
 *          * for 'engineer', get all tasks 'assignedTo' them for this project
 *          * for 'field manager' and 'owner', get all tasks for the project
 *          * support filtering by 'title' and 'tags'
 *      * POST /projects/:project_id/tasks
 *          * callable only by 'field manager'
 *          * 'assignedTo' must be any member of this project
 * 
 *      * GET /projects/:project_id/tasks/:task_id
 *          * callable only by 'member' of the project or 'owner'
 *      * PUT /projects/:project_id/tasks/:task_id
 *          * callable by Field Manger or project member task is 'assignedTo' on that project
 *          * only 'status' is updatable
 *      * DELETE /projects/:project_id/tasks/:task_id
 *          * callable only by Field Manager
 * 
 * 
 * 
 *      * GET /projects/:project_id/reports
 *          * callable only by any 'member' of the project or 'owner'
 *          * support filtering via query params by 'title' and 'tags'
 *      * POST /projects/:project_id/reports
 *          * callable only by any 'member' of the project
 *      
 *      * GET /projects/:project_id/reports/:report_id
 *          * callable only by 'member' of the project or 'owner'
 *      * PUT /projects/:project_id/reports/:report_id
 *          * callable only by any 'member' of the project
 *          * only 'tags' can be updated
 *      * DELETE /projects/:project_id/reports/:report_id
 *          * callable only by 'field manager'
 * 
 * 
 *      * GET /projects/:project_id/reports/:report_id/issues/
 *          * see auth scenario for GET /projects/:project_id/reports
 *      * POST /projects/:project_id/reports/:report_id/issues/
 *          * callable only by any 'member' of the project
 *          * ensure the issue uploader is input in 'uploadedBy'
 * 
 *      * GET /projects/:project_id/reports/:report_id/issues/:issue_id
 *          * see GET /projects/:project_id/reports for auth scenario
 *      * PUT /projects/:project_id/reports/:report_id/issues/:issue_id
 *          callable only by any 'member' of the project
 *          only 'status' is updatable
 * 
```