import { NotFoundError } from "../error/error.js"
import { getNonRequiredFields, getRequiredFieldsOrThrow } from "../helpers.js"


/**
 * Attatches issue to request
 * 
 * Assumes report is attatched to request 
 */
export function attatchIssueToRequest (req, res, next, id) {
    const issue = req.report.issues.id(id)
    if (!issue) {
        throw new NotFoundError('Issue for this report not found')
    }
    req.issue = issue
    next()
}
/**
 * Creates an issue under the report in the request
 * 
 * Assumes report and user have been attatched to request 
 */
export async function createIssueHandler (req, res, next) {
    try {
        const issueFieldNames =
            [ 'title'
            , 'description'
            ]
        const issueFields = getRequiredFieldsOrThrow(issueFieldNames, req.body)
        const report = req.report
        // raisedBy is the user making the request to create this issue
        report.issues.push({
            ...issueFields,
            raisedBy: req.user._id
        })
        await report.save()
        return res.status(201).json(report)
    } catch(err) {
        next(err)
    }
}

/**
 * updates an issue from the request
 * 
 * Assumes issue and report have been attatched to request
 */
export async function updateIssueHandler (req, res, next) {
    try {

        const updates = getNonRequiredFields(['status'], req.body)
        req.issue.status = updates.status
        await req.report.save()
        return res.status(200).json(req.report)
    } catch(err) {
        next(err)
    }
}
