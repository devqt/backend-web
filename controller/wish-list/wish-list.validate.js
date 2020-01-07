const Joi = require('@hapi/joi');


exports.postWishList = Joi.object({
    'createddate': Joi
    .string()
    .required(),
    'sessionid': Joi
    .string()
    .required(),
})
exports.putWishList = Joi.object({
    'name': Joi
    .string()
    .alphanum()
    .required(),
})