const Joi = require('@hapi/joi');


exports.postBiddingSession = Joi.object({
    'itemname': Joi
    .string()
    .required(),
    'categoriesid': Joi
    .string()
    .required(),
    'itemdescription': Joi
    .string()
    .required(),
    'itemcondition': Joi
    .string()
    .alphanum()
    .required(),
    'startdate': Joi
    .string()
    .required(),
    'enddate': Joi
    .string()
    .required(),
    'startprice': Joi
    .number()
    .required(),
    'minimumincreasebid': Joi
    .number()
    .required(),
}).unknown();
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
exports.postPayment = Joi.object({
    'sessionid': Joi
    .string()
    .required(),
})