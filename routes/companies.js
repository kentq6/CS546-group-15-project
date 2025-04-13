import companyData from '../data/companies.js';
import validation from '../validation.js';
import {Router} from 'express';
const router = Router();

router
  .route('/')
  
  // get all companies
  // this function retrieves all the companies from the database and sends them as a response in json format.
  .get(async (req, res) => {
    try {
      const companies = await companyData.getAllCompanies();
      return res.json(companies);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  })

  
  // create a new company
  // this function takes the company details from the request body, validates them, and creates a new company in the database.
  .post(async (req, res) => {
    const { title, ownerId, location, industry, members, projects } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    try {
      const v_title = validation.isValidTitle(title);
      const v_ownerId = validation.isValidId(ownerId, 'owner id');
      const v_location = validation.isValidLocation(location);
      const v_industry = validation.isValidString(industry, 'industry');
      const v_members = validation.isValidArray(members);
      for (let i = 0; i < v_members.length; i++) {
        validation.isValidId(v_members[i], 'member id');
      }
      const v_projects = validation.isValidArray(projects);
      for (let i = 0; i < v_projects.length; i++) {
        validation.isValidId(v_projects[i], 'project id');
      }

      const newCompany = await companyData.createCompany(
        v_title,
        v_ownerId,
        v_location,
        v_industry,
        v_members,
        v_projects
      );
      return res.status(201).json(newCompany);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  });

router
  .route('/:id')
  
  // get a company by id
  // this function retrieves a specific company from the database using its id and sends it as a response in json format.
  .get(async (req, res) => {
    try {
      const id = validation.isValidId(req.params.id, 'company id');
      const company = await companyData.getCompanyById(id);
      return res.json(company);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })

  
  // update a company completely
  // this function replaces all the details of a company with the new details provided in the request body.
  .put(async (req, res) => {
    const { title, location, industry, ownerId, members, projects } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    try {
      const id = validation.isValidId(req.params.id, 'company id');
      const validatedCompany = validation.isValidCompany(
        title,
        location,
        industry,
        ownerId,
        members,
        projects
      );

      const updatedCompany = await companyData.updateCompanyPut(id, validatedCompany);
      return res.json(updatedCompany);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  })

  
  // update a company partially
  // this function updates only the provided fields of a company with the new values from the request body.
  .patch(async (req, res) => {
    const companyInfo = req.body;

    if (!companyInfo || Object.keys(companyInfo).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    try {
      const id = validation.isValidId(req.params.id, 'company id');

      if (companyInfo.title) {
        companyInfo.title = validation.isValidTitle(companyInfo.title);
      }
      if (companyInfo.location) {
        companyInfo.location = validation.isValidLocation(companyInfo.location);
      }
      if (companyInfo.industry) {
        companyInfo.industry = validation.isValidString(companyInfo.industry, 'industry');
      }
      if (companyInfo.ownerId) {
        companyInfo.ownerId = validation.isValidId(companyInfo.ownerId, 'owner id');
      }
      if (companyInfo.members) {
        companyInfo.members = validation.isValidArray(companyInfo.members);
        for (let i = 0; i < companyInfo.members.length; i++) {
          validation.isValidId(companyInfo.members[i], 'member id');
        }
      }
      if (companyInfo.projects) {
        companyInfo.projects = validation.isValidArray(companyInfo.projects);
        for (let i = 0; i < companyInfo.projects.length; i++) {
          validation.isValidId(companyInfo.projects[i], 'project id');
        }
      }

      const updatedCompany = await companyData.updateCompanyPatch(id, companyInfo);
      return res.json(updatedCompany);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  })

  
  // delete a company
  // this function removes a company from the database using its id and sends the deleted company as a response.
  .delete(async (req, res) => {
    try {
      const id = validation.isValidId(req.params.id, 'company id');
      const deletedCompany = await companyData.removeCompany(id);
      return res.json(deletedCompany);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

export default router;