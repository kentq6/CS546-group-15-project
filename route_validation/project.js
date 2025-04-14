
import Joi  from 'joi'


const projectSchema = Joi.object({
    title: Joi.string().pattern(/^[A-Za-z0-9\s]{2,}$/),
    description: Joi.string(),
    budget: Joi.number().min(0),
});

export const validateProjectFromBody = (req, res, next) => {
    // throws ValidationError if does not satisfy the schema
    Joi.assert(req.body, projectSchema, 'incorrect request body')
    next()
}

