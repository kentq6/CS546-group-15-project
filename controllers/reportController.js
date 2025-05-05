import { attatchDocToReqByIdCheckProjectId, getNonRequiredFields, getRequiredFieldsOrThrow} from "../helpers.js";
import { Report } from "../model/model.js";


export const attatchReportToReq = attatchDocToReqByIdCheckProjectId(Report)


/**
 * Gets all reports for a particular project
 * 
 * Assumes project has already been attatched to request
 */
export async function getReportsHandler (req, res, next) {
    try {
        const reports = await Report.find({ project: req.project._id })
        return res.status(200).json(reports)
    } catch(err) {
        next(err)
    }
}

/**
 * Creates a new report from fields in the request body
 * 
 * Assumes  project has already been attatched to request
 */
export async function createReportHandler (req, res, next) {
    try {
        // Since issues appear after a report is created, we dont need them when initially creating a report
        const requiredFieldNames =
            [ 'title'
            , 'description'
            , 'tags'
            , 'fileURL'
            ]
        const requiredFields = getRequiredFieldsOrThrow(requiredFieldNames, req.body)
        const report = await Report.create({
            ...requiredFields,
            project: req.project._id
        })
        return res.status(201).json(report)
    } catch(err) {
        next(err)
    }
}

/**
 * Gets a report by ID
 * 
 * Assumes report has already been attatched to the request
 */
export async function getReportByIdHandler (req, res, next) {
    try {
        return res.status(200).json(req.report)
    } catch(err) {
        next(err)
    }
}

/**
 * Update a report with data in the request body
 * 
 * Assumes report has already been attatched to the request
 */
export async function updateReportHandler (req, res, next) {
    try {
        const updateFieldNames =
            [ 'description'
            , 'tags'
            , 'fileURL'
            ]
        const updates = getNonRequiredFields(updateFieldNames, req.body)
        const updatedReport = await Report.findByIdAndUpdate(req.report._id, updates, { runValidators: true, new: true })
        if (!updatedReport) {
            throw new NotFoundError('Report not found; no updates applied')
        }
        return res.status(200).json(updatedReport)
    } catch(err) {
        next(err)
    }
}

/**
 * Deletes a report
 * 
 * Assumes report has already been attatched to the request
 */
export async function deleteReportHandler (req, res, next) {
    try {
        const deletedReport = await Report.findByIdAndDelete(req.report._id)
        if (!deletedReport) {
            throw new NotFoundError('Report not found; no delete applied')
        }
        return res.status(200).json(deletedReport)
    } catch(err) {
        next(err)
    }
}