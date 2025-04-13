// import { Router } from 'express';
// import projectData from '../data/projects.js';
// import reportData from '../data/reports.js';
// import issueData from '../data/issues.js';
// import userData from '../data/users.js';
// import taskData from '../data/tasks.js';
// import blueprintData from '../data/blueprints.js';
// import companyData from '../data/companies.js';
// import validation from '../validation.js';

// const router = Router();

// // Dashboard route rendering Handlebars views per role
// router.get('/:companyId/:role/:userId?', async (req, res) => {
//   try {
//     const companyId = validation.isValidId(req.params.companyId, 'company id');
//     const role = req.params.role;
//     const userIdParam = req.params.userId;

//     switch (role) {
//       case 'admin': {
//         const projects = await projectData.getProjectsByCompany(companyId);
//         const reports = await reportData.getReportsByCompany(companyId);
//         const issues = await issueData.getIssuesByCompany(companyId);
//         const employees = await userData.getUsersByCompany(companyId);
//         const company = await companyData.getCompanyById(companyId);
//         const blueprints = await blueprintData.getBlueprintByCompanyID(companyId);

//         res.render('adminDashboard', {
//           layout: 'main',
//           message: 'Admin Dashboard',
//           projects,
//           reports,
//           blueprints,
//           issues,
//           employees,
//           company
//         });
//         return;
//       }

//       case 'pm': {
//         if (!userIdParam) throw 'Missing user id for project manager dashboard';
//         const userId = validation.isValidId(userIdParam, 'user id');
//         const assignedProjects = await projectData.getProjectsByManagerAndCompany(userId, companyId);
//         const assignedTasks = await taskData.getTasksByManagerAndCompany(userId, companyId);
//         const blueprints = await blueprintData.getBlueprintByCompanyID(companyId);

//         res.render('pmDashboard', {
//           layout: 'main',
//           message: 'Project Manager Dashboard',
//           assignedProjects,
//           assignedTasks,
//           blueprints
//         });
//         return;
//       }

//       case 'field-engineer': {
//         if (!userIdParam) throw 'Missing user id for field engineer dashboard';
//         const userId = validation.isValidId(userIdParam, 'user id');
//         const assignedProjects = await projectData.getProjectsByEngineerAndCompany(userId, companyId);
//         const assignedTasks = await taskData.getTasksByEngineerAndCompany(userId, companyId);

//         res.render('feDashboard', {
//           layout: 'main',
//           message: 'Field Engineer Dashboard',
//           assignedProjects,
//           assignedTasks
//         });
//         return;
//       }

//       case 'other': {
//         if (!userIdParam) throw 'Missing user id for custom dashboard';
//         const userId = validation.isValidId(userIdParam, 'user id');

//         res.render('customDashboard', {
//           layout: 'main',
//           message: 'Custom Dashboard for Other Roles',
//           companyId,
//           userId
//         });
//         return;
//       }

//       default: {
//         res.status(400).render('error', { layout: 'main', error: 'Invalid role specified in dashboard route.' });
//         return;
//       }
//     }

//   } catch (e) {
//     res.status(500).render('error', { layout: 'main', error: e.toString() });
//   }
// });

// export default router;





// USE THIS WHEN WE START SETTING UP THE FRONTEND, THIS IS A WORKING EXAMPLE OF HOW TO USE THE DASHBOARD ROUTE
// THE OTHER ROUTES WILL HAVE TO BE CHANGED AS WE DO FRONT END SO I CAN RENDER WHICH PAGES GET WHAT DATA
