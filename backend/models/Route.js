const mongoose = require('mongoose');
const RouteSchema = new mongoose.Schema({
  nameProject: { type: String, required: true },
  sourcePath: { type: String, required: true },
  routeParams: { type: Map, of: String },
  queryParams: { type: Map, of: String },
  targetUrl: { type: String, required: true },
  method: { type: String, required: true, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
  headers: { type: Map, of: String }, // Usando Map para armazenar pares chave-valor de headers
  description: { type: String }
});


const Route = mongoose.model('Route', RouteSchema);
module.exports = Route;
