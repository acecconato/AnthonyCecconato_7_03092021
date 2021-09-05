const express = require('express');

const router = express.Router();

const attachmentsController = require('../controllers/attachments.controller');

router.get('/', attachmentsController.getAllAttachments);
router.get('/:uuid', attachmentsController.getAttachmentByUUID);

router.put('/:uuid', attachmentsController.updateAttachment);

router.delete('/:uuid', attachmentsController.deleteAttachment);

module.exports = router;
