import blueprintData from '../data/blueprints.js';
import validation from '../validation.js';
import { Router } from 'express';
const router = Router();

router
  .route('/')
  
  // get all blueprints
  // this function retrieves all the blueprints from the database and sends them back as a JSON response
  .get(async (req, res) => {
    try {
      const blueprints = await blueprintData.getAllBlueprints();
      return res.json(blueprints);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  })

  
  
  // create a new blueprint
  // this function takes blueprint details from the request body, validates them, and creates a new blueprint in the database
  .post(async (req, res) => {
    const { projectId, title, fileUrl, tags, uploadedBy } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    try {
      const validatedProjectId = validation.isValidId(projectId, 'project id');
      const validatedTitle = validation.isValidTitle(title, 'title');
      const validatedFileUrl = validation.isValidFileUrl(fileUrl, 'file url');
      const validatedTags = tags.map((tag) => validation.isValidString(tag, 'tag'));
      const validatedUploadedBy = validation.isValidId(uploadedBy, 'uploaded by');

      const newBlueprint = await blueprintData.createBlueprint(
        validatedProjectId,
        validatedTitle,
        validatedFileUrl,
        validatedTags,
        validatedUploadedBy
      );
      return res.status(201).json(newBlueprint);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  });

router
  .route('/:id')
  
  // get a blueprint by id
  // this function retrieves a specific blueprint using its id and sends it back as a JSON response
  .get(async (req, res) => {
    try {
      const id = validation.isValidId(req.params.id, 'blueprint id');
      const blueprint = await blueprintData.getBlueprintById(id);
      return res.json(blueprint);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })

  
  
  // update a blueprint completely
  // this function replaces the entire blueprint with new data provided in the request body
  .put(async (req, res) => {
    try {
      const id = req.params.id;
      const blueprintInfo = req.body;

      if (!blueprintInfo || Object.keys(blueprintInfo).length === 0) {
        return res.status(400).json({ error: 'There are no fields in the request body' });
      }

      const updatedBlueprint = await blueprintData.updateBlueprintPut(id, blueprintInfo);
      return res.json(updatedBlueprint);
    } catch (e) {
      console.error(e); // Log the error
      return res.status(400).json({ error: e });
    }
  })

  
  
  // update a blueprint partially
  // this function updates only the fields provided in the request body for a specific blueprint
  .patch(async (req, res) => {
    const blueprintInfo = req.body;

    if (!blueprintInfo || Object.keys(blueprintInfo).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    try {
      const id = validation.isValidId(req.params.id, 'blueprint id');
      const updatedBlueprint = await blueprintData.updateBlueprintPatch(id, blueprintInfo);
      return res.json(updatedBlueprint);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  });

router
  .route('/:projectId/:blueprintId')
  
  // delete a blueprint
  // this function deletes a specific blueprint from a project using the project id and blueprint id
  .delete(async (req, res) => {
    try {
      const projectId = validation.isValidId(req.params.projectId, 'project id');
      const blueprintId = validation.isValidId(req.params.blueprintId, 'blueprint id');

      const deletedBlueprint = await blueprintData.removeBlueprint(projectId, blueprintId);
      return res.json(deletedBlueprint);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

export default router;