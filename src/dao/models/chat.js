const mongoose = require('mongoose')

const chatCollection = 'messages';

const chatSchema = new mongoose.Schema({
    user: String,
    message: String,
});

module.exports = mongoose.model(chatCollection, chatSchema);