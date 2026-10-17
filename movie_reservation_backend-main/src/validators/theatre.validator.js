const Joi = require('joi');

const createTheatreSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    address: Joi.string().min(1).max(255).required(),
    city: Joi.string().min(1).max(100).required(),
    phone: Joi.string().min(1).max(15).optional(),
});

const updateTheatreSchema = Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    address: Joi.string().min(1).max(255).optional(),
    city: Joi.string().min(1).max(100).optional(),
    phone: Joi.string().min(1).max(15).optional(),
});

const createScreenSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    totalSeats: Joi.number().min(1).required(),
});

module.exports = { createTheatreSchema, updateTheatreSchema, createScreenSchema };