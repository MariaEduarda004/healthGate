const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    method: String,
    path: String,
    headers: Object,
    body: Object,
    query: Object,
    statusCode: Number,
    responseBody: Object,
    timestamp: { type: Date, default: Date.now },
    projectName: String 
});

module.exports = mongoose.model('Log', logSchema);
