const express = require('express');
const router = express.Router()
const kanbanController = require('../controllers/kanbanController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(kanbanController.getAllKanban)
    .post(kanbanController.createNewKanban)
    .patch(kanbanController.updateKanban)

router.route('/:id')
    .delete(kanbanController.deleteKanban)

module.exports = router