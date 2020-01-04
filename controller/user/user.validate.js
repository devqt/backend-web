const Joi = require('@hapi/joi');

exports.register = Joi.object({
    'user_id': Joi
    .string()
    .alphanum()
    .required(),
    'password': Joi
    .string()
    .required(),
    'email': Joi.string(),
    'name': Joi
    .string()
    .alphanum(),
    'address': Joi.string(),
})

exports.login = Joi.object({
    'user_id': Joi
    .string()
    .alphanum()
    .required(),
    'password': Joi
    .string()
    .required(),
})