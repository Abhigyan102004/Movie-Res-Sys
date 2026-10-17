const movieService = require('../services/movie.service');


async function getAllMovies(req, res, next) {
    try {
        const result = await movieService.getAllMovies(req.query);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}


async function getMovieById(req, res, next) {
    try {
        const movie = await movieService.getMovieById(req.params.id);
        res.json({ success: true, data: movie });
    } catch (err) {
        next(err);
    }
}

async function createMovie(req, res, next) {
    try {
        const movie = await movieService.createMovie(req.body);
        res.status(201).json({ success: true, data: movie, message: 'Movie created' });
    } catch (err) {
        next(err);
    }
}

async function updateMovie(req, res, next) {
    try {
        const movie = await movieService.updateMovie(req.params.id, req.body);
        res.json({ success: true, data: movie, message: 'Movie updated' });
    } catch (err) {
        next(err);
    }
}

async function deleteMovie(req, res, next) {
    try {
        const movie = await movieService.deleteMovie(req.params.id);
        res.json({ success: true, data: movie, message: 'Movie deleted' });
    } catch (err) {
        next(err);
    }
}


module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
