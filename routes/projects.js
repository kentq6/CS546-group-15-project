import projectData from '../data/projects.js';
import companyData from '../data/companies.js';
import validation from '../validation.js';
import { Router } from 'express';
const router = Router();

router
  .route('/')
  
  // this gets all the projects from the database and sends them as a response
  .get(async (req, res) => {
    try {
      const projects = await projectData.getAllProjects();
      return res.json(projects);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  })

  
  // this creates a new project with the data provided in the request body
  .post(async (req, res) => {
    const { companyId, title, description, budget, status } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    try {
      const v_companyId = validation.isValidId(companyId, 'company id');
      const company = await companyData.getCompanyById(v_companyId);
      if (!company) throw `Error: Company with id ${v_companyId} does not exist!`;

      const v_title = validation.isValidTitle(title);
      const v_description = validation.isValidString(description, 'description');
      const v_budget = validation.isValidNumber(budget, 'budget');
      const v_status = validation.isValidStatus(status, ['Pending', 'In Progress', 'Completed']);

      const newProject = await projectData.createProject(
        v_title,
        v_description,
        v_budget,
        v_status,
        [], // members        (These 4 fields can be optionally empty because we will have buttons in Frontend that will handle adding them)
        [], // tasks
        [], // blueprints
        [], // reports
        v_companyId
      );

      return res.status(201).json(newProject);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  });

router
  .route('/:id')
  
  // this gets a specific project by its id and sends it as a response
  .get(async (req, res) => {
    try {
      const id = validation.isValidId(req.params.id, 'project id');
      const project = await projectData.getProjectById(id);
      return res.json(project);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })

  
  // this updates a project completely (all fields) using the data provided in the request body
  .put(async (req, res) => {
    try {
      console.log('Request Body:', req.body); // Log the entire request body
      const id = validation.isValidId(req.params.id, 'project id');
      const { title, description, budget, status, members, tasks, blueprints, reports, companyId } = req.body;

      console.log('CompanyId before validation:', companyId); // Log companyId before validation

      const validatedProject = validation.isValidProject(
        title,
        description,
        budget,
        status,
        members || [],
        tasks || [],
        blueprints || [],
        reports || [],
        companyId
      );

      console.log('Validated Project:', validatedProject); // Log the validated project

      const updatedProject = await projectData.updateProjectPut(id, validatedProject);
      return res.json(updatedProject);
    } catch (e) {
      console.error(e); // Log the error
      return res.status(400).json({ error: e });
    }
  })

  
  // this updates only specific fields of a project using the data provided in the request body
  .patch(async (req, res) => {
    const projectInfo = req.body;

    if (!projectInfo || Object.keys(projectInfo).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    try {
      const id = validation.isValidId(req.params.id, 'project id');

      if (projectInfo.title) {
        projectInfo.title = validation.isValidTitle(projectInfo.title);
      }
      if (projectInfo.description) {
        projectInfo.description = validation.isValidString(projectInfo.description, 'description');
      }
      if (projectInfo.budget) {
        projectInfo.budget = validation.isValidNumber(projectInfo.budget, 'budget');
      }
      if (projectInfo.status) {
        projectInfo.status = validation.isValidStatus(projectInfo.status, ['Pending', 'In Progress', 'Completed']);
      }
      if (projectInfo.members) {
        projectInfo.members = validation.isValidArray(projectInfo.members);
        for (let i = 0; i < projectInfo.members.length; i++) {
          validation.isValidId(projectInfo.members[i], 'member id');
        }
      }
      if (projectInfo.tasks) {
        projectInfo.tasks = validation.isValidArray(projectInfo.tasks);
        for (let i = 0; i < projectInfo.tasks.length; i++) {
          validation.isValidId(projectInfo.tasks[i], 'task id');
        }
      }
      if (projectInfo.blueprints) {
        projectInfo.blueprints = validation.isValidArray(projectInfo.blueprints);
        for (let i = 0; i < projectInfo.blueprints.length; i++) {
          validation.isValidId(projectInfo.blueprints[i], 'blueprint id');
        }
      }
      if (projectInfo.reports) {
        projectInfo.reports = validation.isValidArray(projectInfo.reports);
        for (let i = 0; i < projectInfo.reports.length; i++) {
          validation.isValidId(projectInfo.reports[i], 'report id');
        }
      }

      const updatedProject = await projectData.updateProjectPatch(id, projectInfo);
      return res.json(updatedProject);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  })

  
  // this deletes a specific project by its id
  .delete(async (req, res) => {
    try {
      const id = validation.isValidId(req.params.id, 'project id');
      const deletedProject = await projectData.removeProject(id);
      return res.json(deletedProject);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

export default router;
