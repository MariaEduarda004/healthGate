// Route.js
const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true,
    },
    target: {
        type: String,
        required: true,
    },
});

const Route = mongoose.model('Route', RouteSchema);
module.exports = Route;
