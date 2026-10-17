const Joi = require('joi');

const createShowtimeSchema = Joi.object({
    movieId: Joi.number().required(),
    screenId: Joi.number().required(),
    startTime: Joi.date().iso().min('now').required(),
    price: Joi.number().min(0).required(),
});

const updateShowtimeSchema = Joi.object({
    startTime: Joi.date().iso().min('now').optional(),
    price: Joi.number().min(0).optional(),
});

module.exports = { createShowtimeSchema, updateShowtimeSchema };
