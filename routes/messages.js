/* jshint node: true */
'use strict';
var express = require('express');
var mongoose = require('mongoose');
var Message = mongoose.model('Message');
var router = express.Router();
var appMessages = require('../lib/messages');

/**
 * @apiDefine MessageNotFoundError
 *
 * @apiError MessageNotFound The id of the Message was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "MessageNotFound"
 *     }
 */


/**
 * @api {get} /messages/ Request all messages
 * @apiName GetMessages
 * @apiGroup Message
 *
 *
 * @apiSuccess {Array} response List of messages
 * @apiSuccess {String} response.text Message text
 * @apiSuccess {boolean} response.isPalindrome True/false value if message is a palindrome
 * 
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * {
 * text: "amor roma",
 * isPalindrome: true},
 * {
 * text: "not a palindrome",
 * isPalindrome: false
 * }
 * ]
 */
router.get('/messages', function (req, res, next) {
    appMessages.getMessages(function (error, results) {
        if (error) {
            return next(error);
        }

        res.json(results);
    });
});

/**
 * @api {get} /messages/:id Request Message information
 * @apiName GetMessage
 * @apiGroup Message
 *
 * @apiParam {Number} id Message unique ID.
 *
 * @apiSuccess {String} text Message text
 * @apiSuccess {boolean} isPalindrome True/false value if message is a palindrome
 * 
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * text: "amor roma",
 * isPalindrome: true
 * }
 * 
 * @apiUse MessageNotFoundError
 */
router.get('/messages/:messageId', function (req, res, next) {
    appMessages.getMessage(req.params.messageId, function (error, results) {
        if (error) {
            return next(error);
        }

        if (!results) {
            return res.sendStatus(404);
        }

        res.json(results);
    });
});

/**
 * @api {delete} /messages/:id Delete specific Message
 * @apiName DeleteMessage
 * @apiGroup Message
 *
 * @apiParam {Number} id Message unique ID.
 *
 * 
 * @apiUse MessageNotFoundError
 */
router.delete('/messages/:messageId', function (req, res, next) {
    appMessages.deleteMessage(req.params.messageId, function (error) {
        if (error) {
            return next(error);
        }
    });
});

/**
 * @api {put} /messages/:id Update Message information
 * @apiName UpdateMessage
 * @apiGroup Message
 *
 * @apiParam {Number} id Message unique ID.
 * @apiParam {String} text new Message text
 *
 * @apiSuccess {String} text Message text
 * @apiSuccess {boolean} isPalindrome True/false value if message is a palindrome
 * 
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * text: "amor roma",
 * isPalindrome: true
 * }
 * 
 * @apiUse MessageNotFoundError
 */
router.put('/messages/:messageId', function (req, res, next) {
    // Remove this or mongoose will throw an error
    // because we would be trying to update the mongo ID
    delete req.body._id;

    req.body.isPalindrome = appMessages.isPalindrome(req.body.text);
    appMessages.updateMessage(req.params.messageId, req.body, function (err, numberAffected, response) {
        if (err) {
            return next(err);
        }

        appMessages.getMessage(req.params.messageId, function (error, results) {
            if (error) {
                return next(error);
            }

            if (!results) {
                return res.sendStatus(404);
            }
            return res.json(results);
        });
    });
});

/**
 * @api {post} /messages/:id Add a new Message
 * @apiName NewMessage
 * @apiGroup Message
 *
 * @apiParam {String} text new Message text
 *
 * @apiSuccess {String} text Message text
 * @apiSuccess {boolean} isPalindrome True/false value if message is a palindrome
 * 
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * text: "amor roma",
 * isPalindrome: true
 * }
 * 
 */
router.post('/messages', function (req, res, next) {
    var newMessage = new Message({
        id: mongoose.Types.ObjectId(),
        text: req.body.text,
        isPalindrome: appMessages.isPalindrome(req.body.text)
    });
    newMessage.save(function (error) {
        if (error) {
            return next(error);
        }
        appMessages.getMessage(newMessage.id, function (error, results) {
            if (error) {
                return next(error);
            }

            if (!results) {
                return res.sendStatus(404);
            }

            return res.json(results);
        });
    });
});

module.exports = router;