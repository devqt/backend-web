const Joi = require('@hapi/joi');


exports.postCategory = Joi.object({
    'name': Joi
    .string()
    .alphanum()
    .required(),
})
exports.putCategory = Joi.object({
    'name': Joi
    .string()
    .alphanum()
    .required(),
})