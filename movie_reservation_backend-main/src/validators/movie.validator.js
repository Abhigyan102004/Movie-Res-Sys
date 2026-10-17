const Joi = require('joi');

const createMovieSchema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    description: Joi.any().optional().allow(''),
    duration: Joi.number().min(1).required(),
    rating: Joi.number().min(0).max(10).required(),
    posterUrl: Joi.string().uri().optional().allow(''),
    releaseDate: Joi.date().optional(),
    genre: Joi.string().optional(),
    status: Joi.string().valid('COMING_SOON', 'NOW_SHOWING', 'ENDED').optional(),
});

const updateMovieSchema = Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    description: Joi.any().optional(),
    duration: Joi.number().min(1).optional(),
    rating: Joi.number().min(0).max(10).optional(),
    posterUrl: Joi.string().uri().optional().allow(''),
    releaseDate: Joi.date().optional(),
    genre: Joi.string().optional(),
    status: Joi.string().valid('COMING_SOON', 'NOW_SHOWING', 'ENDED').optional(),
});

module.exports = { createMovieSchema, updateMovieSchema };