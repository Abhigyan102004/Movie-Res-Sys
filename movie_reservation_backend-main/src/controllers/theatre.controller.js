const theatreService = require('../services/theatre.service');


async function getAllTheatres(req, res, next) {
    try {
        const result = await theatreService.getAllTheatres(req.query);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

async function getTheatreById(req, res, next) {
    try {
        const theatre = await theatreService.getTheatreById(req.params.id);
        res.json({ success: true, data: theatre });
    } catch (err) {
        next(err);
    }
}

async function createTheatre(req, res, next) {
    try {
        const theatre = await theatreService.createTheatre(req.body);
        res.status(201).json({ success: true, data: theatre, message: 'theatre created' });
    } catch (err) {
        next(err);
    }
}

async function updateTheatre(req, res, next) {
    try {
        const theatre = await theatreService.updateTheatre(req.params.id, req.body);
        res.json({ success: true, data: theatre, message: 'theatre updated' });
    } catch (err) {
        next(err);
    }
}

async function deleteTheatre(req, res, next) {
    try {
        const theatre = await theatreService.deleteTheatre(req.params.id);
        res.json({ success: true, data: theatre, message: 'theatre deleted' });
    } catch (err) {
        next(err);
    }
}

async function createScreen(req, res, next) {
    try {
        const screen = await theatreService.createScreen(req.params.theatreId, req.body);
        res.status(201).json({ success: true, data: screen, message: 'Screen created' });

    } catch (err) {
        next(err);
    }
}

async function deleteScreen(req, res, next) {
    try {
        const screen = await theatreService.deleteScreen(req.params.screenId);
        res.json({ success: true, data: screen, message: 'Screen deleted' });
    } catch (err) {
        next(err);
    }
}


module.exports = { getAllTheatres, getTheatreById, createTheatre, updateTheatre, deleteTheatre, createScreen,deleteScreen };
