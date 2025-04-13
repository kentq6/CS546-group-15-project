import userData from '../data/users.js';
import validation from '../validation.js';
import {Router} from 'express';
const router = Router();

router
  .route('/')


  
  // this function gets all the users from the database and sends them back as a response
  .get(async (req, res) => {
    try {
      const users = await userData.getAllUsers();
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: e });
    }
  })



  // this function creates a new user with the data provided in the request body
  .post(async (req, res) => {
    const { username, password, role, projects = [], companyId = null } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    try {
      const v_username = validation.isValidUsername(username);
      const v_password = validation.isValidPassword(password);
      const v_role = validation.isValidString(role, 'role');
      const v_projects = validation.isValidArray(projects);
      v_projects.forEach((projectId) => validation.isValidId(projectId, 'projectId'));
      const v_companyId = companyId ? validation.isValidId(companyId, 'companyId') : null;

      const newUser = await userData.createUser(v_username, v_password, v_role, v_projects, v_companyId);
      res.status(201).json(newUser);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  });



router
  .route('/:id')



  // this function gets a specific user by their id and sends it back as a response
  .get(async (req, res) => {
    try {
      const id = validation.isValidId(req.params.id, 'user id');
      const user = await userData.getUserById(id);
      res.json(user);
    } catch (e) {
      res.status(404).json({ error: e });
    }
  })



  // this function updates all the fields of a specific user by their id
  .put(async (req, res) => {
    const { username, password, role, projects = [], companyId = null } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    try {
      const id = validation.isValidId(req.params.id, 'user id');
      const v_username = validation.isValidUsername(username);
      const v_password = validation.isValidPassword(password);
      const v_role = validation.isValidString(role, 'role');
      const v_projects = validation.isValidArray(projects);
      v_projects.forEach((projectId) => validation.isValidId(projectId, 'projectId'));
      const v_companyId = companyId ? validation.isValidId(companyId, 'companyId') : null;

      const validatedUser = {
        username: v_username,
        password: v_password,
        role: v_role,
        projects: v_projects,
        companyId: v_companyId,
      };

      const updatedUser = await userData.updateUserPut(id, validatedUser);
      res.json(updatedUser);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  })



  // this function updates only the provided fields of a specific user by their id
  .patch(async (req, res) => {
    const userInfo = req.body;

    if (!userInfo || Object.keys(userInfo).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    try {
      const id = validation.isValidId(req.params.id, 'user id');

      if (userInfo.username) {
        userInfo.username = validation.isValidUsername(userInfo.username);
      }
      if (userInfo.password) {
        userInfo.password = validation.isValidPassword(userInfo.password);
      }
      if (userInfo.role) {
        userInfo.role = validation.isValidString(userInfo.role, 'role');
      }
      if (userInfo.projects) {
        userInfo.projects = validation.isValidArray(userInfo.projects);
        userInfo.projects.forEach((projectId) =>
          validation.isValidId(projectId, 'projectId')
        );
      }
      if (userInfo.companyId) {
        userInfo.companyId = validation.isValidId(userInfo.companyId, 'companyId');
        await companyData.getCompanyById(userInfo.companyId); 
      }

      const updatedUser = await userData.updateUserPatch(id, userInfo);
      res.json(updatedUser);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  })



  // this function deletes a specific user by their id
  .delete(async (req, res) => {
    try {
      const userId = validation.isValidId(req.params.id, 'user id');
      const deletedUser = await userData.removeUser(userId);
      res.json(deletedUser);
    } catch (e) {
      return res.status(400).json({ error: e.message || e });
    }
  });

export default router;