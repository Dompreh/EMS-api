const express = require('express');
const router = express.Router()
const scheduleController = require('../controllers/scheduleController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(scheduleController.getAllSchedule)
    .post(scheduleController.createNewSchedule)
    .patch(scheduleController.updateSchedule)

router.route('/:id')
    .delete(scheduleController.deleteSchedule)

module.exports = router