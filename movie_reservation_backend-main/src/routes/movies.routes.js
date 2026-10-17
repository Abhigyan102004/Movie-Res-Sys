const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const { createMovieSchema, updateMovieSchema } = require('../validators/movie.validator');


router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

router.post('/', authenticate, authorize('ADMIN'), validate(createMovieSchema), movieController.createMovie);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateMovieSchema), movieController.updateMovie);
router.delete('/:id', authenticate, authorize('ADMIN'), movieController.deleteMovie);

module.exports = router;
