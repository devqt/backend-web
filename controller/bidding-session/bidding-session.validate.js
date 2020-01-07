const Joi = require('@hapi/joi');


exports.postBiddingSession = Joi.object({
    'name': Joi
    .string()
    .alphanum()
    .required(),
})
exports.putBiddingSession = Joi.object({
    'name': Joi
    .string()
    .alphanum()
    .required(),
})
exports.createbidlog = Joi.object({
    'bidamount': Joi
    .number()
    .required(),
    'biddate': Joi
    .string()
    .required(),
    'user': Joi.object()
})