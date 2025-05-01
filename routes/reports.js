import reportData from '../data/reports.js';
import projectData from '../data/projects.js';
import validation from '../validation.js';
import issueData from '../data/issues.js';
import { Router } from 'express';
const router = Router();


// this route gets all reports or creates a new report

router
  .route('/')

  .get(async (req, res) => {
    try {
      const reports = await reportData.getAllReports();
      return res.json(reports);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  })



  .post(async (req, res) => {
    const { projectId, title, description, fileUrl, tags, uploadedBy } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'there are no fields in the request body' });
    }

    try {
      const v_projectId = validation.isValidId(projectId, 'project id');
      const project = await projectData.getProjectById(v_projectId);
      if (!project) throw `error: project with id ${v_projectId} does not exist!`;

      const v_title = validation.isValidTitle(title);
      const v_description = validation.isValidString(description, 'description');
      const v_fileUrl = validation.isValidFileUrl(fileUrl, 'file url');
      const v_tags = validation.isValidArray(tags);
      v_tags.forEach((tag) => validation.isValidString(tag, 'tag'));
      const v_uploadedBy = validation.isValidId(uploadedBy, 'uploaded by');

      const newReport = await reportData.createReport(
        v_projectId,
        v_title,
        v_description,
        v_fileUrl,
        v_tags,
        v_uploadedBy
      );
      return res.status(201).json(newReport);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  });



// this route manages a specific report by its id

router
  .route('/:id')

  .get(async (req, res) => {
    try {
      const id = validation.isValidId(req.params.id, 'report id');
      const report = await reportData.getReportById(id);
      return res.json(report);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })



  .put(async (req, res) => {
    const { title, description, fileUrl, tags, uploadedBy } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'there are no fields in the request body' });
    }

    try {
      const id = validation.isValidId(req.params.id, 'report id');
      const validatedReport = validation.isValidReportForPutRQ(
        title,
        description,
        fileUrl,
        tags,
        uploadedBy
      );

      const updatedReport = await reportData.updateReportPut(id, validatedReport);
      return res.json(updatedReport);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  })



  .patch(async (req, res) => {
    const reportInfo = req.body;

    if (!reportInfo || Object.keys(reportInfo).length === 0) {
      return res.status(400).json({ error: 'there are no fields in the request body' });
    }

    try {
      const id = validation.isValidId(req.params.id, 'report id');

      if (reportInfo.title) {
        reportInfo.title = validation.isValidTitle(reportInfo.title);
      }
      if (reportInfo.description) {
        reportInfo.description = validation.isValidString(reportInfo.description, 'description');
      }
      if (reportInfo.fileUrl) {
        reportInfo.fileUrl = validation.isValidFileUrl(reportInfo.fileUrl, 'file url');
      }
      if (reportInfo.tags) {
        reportInfo.tags = validation.isValidArray(reportInfo.tags);
        reportInfo.tags.forEach((tag) => validation.isValidString(tag, 'tag'));
      }
      if (reportInfo.uploadedBy) {
        reportInfo.uploadedBy = validation.isValidId(reportInfo.uploadedBy, 'uploaded by');
      }

      const updatedReport = await reportData.updateReportPatch(id, reportInfo);
      return res.json(updatedReport);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  })



  .delete(async (req, res) => {
    try {
      const id = validation.isValidId(req.params.id, 'report id');
      const deletedReport = await reportData.removeReport(id);
      return res.json(deletedReport);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });



// this route manages issues for a specific report

router
  .route('/:id/issues')

  .get(async (req, res) => {
    try {
      const id = validation.isValidId(req.params.id, 'report id');
      const issues = await issueData.getAllIssues(id);
      return res.json(issues);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })



  .post(async (req, res) => {
    const { title, description, status, raisedBy } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'there are no fields in the request body' });
    }

    try {
      const reportId = validation.isValidId(req.params.id, 'report id');
      const v_title = validation.isValidTitle(title);
      const v_description = validation.isValidString(description, 'description');
      const v_status = validation.isValidStatus(status, ['Unresolved', 'Resolved']);
      const v_raisedBy = validation.isValidId(raisedBy, 'raised by');

      const newIssue = await issueData.createIssue(
        reportId,
        v_title,
        v_description,
        v_status,
        v_raisedBy
      );
      return res.status(201).json(newIssue);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  });



// this route manages a specific issue for a specific report

router
  .route('/:reportId/issues/:issueId')

  .patch(async (req, res) => {
    const issueInfo = req.body;

    if (!issueInfo || Object.keys(issueInfo).length === 0) {
      return res.status(400).json({ error: 'there are no fields in the request body' });
    }

    try {
      const reportId = validation.isValidId(req.params.reportId, 'report id');
      const issueId = validation.isValidId(req.params.issueId, 'issue id');

      if (issueInfo.title) {
        issueInfo.title = validation.isValidTitle(issueInfo.title);
      }
      if (issueInfo.description) {
        issueInfo.description = validation.isValidString(issueInfo.description, 'description');
      }
      if (issueInfo.status) {
        issueInfo.status = validation.isValidStatus(issueInfo.status, ['Unresolved', 'Resolved']);
      }

      const updatedIssue = await issueData.updateIssuePatch(issueId, issueInfo);
      return res.json(updatedIssue);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  })



  .delete(async (req, res) => {
    try {
      const reportId = validation.isValidId(req.params.reportId, 'report id');
      const issueId = validation.isValidId(req.params.issueId, 'issue id');

      const deletedIssue = await issueData.removeIssue(issueId);
      return res.json(deletedIssue);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

export default router;