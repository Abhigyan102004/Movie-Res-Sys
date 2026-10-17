const express = require('express');
const router = express.Router();
const theatreController = require('../controllers/theatre.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const { createTheatreSchema, updateTheatreSchema, createScreenSchema } = require('../validators/theatre.validator');


router.get('/', theatreController.getAllTheatres);
router.get('/:id', theatreController.getTheatreById);

router.post('/', authenticate, authorize('ADMIN'), validate(createTheatreSchema), theatreController.createTheatre);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateTheatreSchema), theatreController.updateTheatre);
router.delete('/:id', authenticate, authorize('ADMIN'), theatreController.deleteTheatre);

router.post('/:theatreId/screens', authenticate, authorize('ADMIN'), validate(createScreenSchema), theatreController.createScreen);
router.delete('/:theatreId/screens/:screenId', authenticate, authorize('ADMIN'), theatreController.deleteScreen);

module.exports = router;
