// src/RoutesManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoutesManager = () => {
  const [routes, setRoutes] = useState([]);
  const [newRoute, setNewRoute] = useState({
    nameProject: '',
    sourcePath: '',
    routeParams: '',
    queryParams: '',
    targetUrl: '',
    method: '',
    headers: '',
    description: ''
  });

  // Função para carregar as rotas já cadastradas
  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const response = await axios.get('/api/routes');
      setRoutes(response.data);
    } catch (error) {
      console.error('Erro ao carregar rotas:', error);
    }
  };

  // Função para adicionar uma nova rota
  const addRoute = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nameProject: newRoute.nameProject,
        sourcePath: newRoute.sourcePath,
        routeParams: JSON.parse(newRoute.routeParams || '{}'),
        queryParams: JSON.parse(newRoute.queryParams || '{}'),
        targetUrl: newRoute.targetUrl,
        method: newRoute.method,
        headers: JSON.parse(newRoute.headers || '{}'),
        description: newRoute.description,
      };

      await axios.post('/api/routes', payload);
      setNewRoute({
        nameProject: '',
        sourcePath: '',
        routeParams: '',
        queryParams: '',
        targetUrl: '',
        method: '',
        headers: '',
        description: ''
      });
      loadRoutes(); // Recarregar as rotas após adicionar
    } catch (error) {
      console.error('Erro ao adicionar rota:', error);
    }
  };

  // Função para deletar uma rota
  const deleteRoute = async (sourcePath) => {
    try {
      await axios.delete(`/api/routes/${sourcePath}`);
      loadRoutes();
    } catch (error) {
      console.error('Erro ao deletar rota:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gerenciamento de Rotas</h1>
      
      {/* Formulário de Cadastro de Rota */}
      <form onSubmit={addRoute}>
        <div className="mb-3">
          <label className="form-label">Nome do Projeto</label>
          <input
            type="text"
            className="form-control"
            value={newRoute.nameProject}
            onChange={(e) => setNewRoute({ ...newRoute, nameProject: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Caminho da Fonte</label>
          <input
            type="text"
            className="form-control"
            value={newRoute.sourcePath}
            onChange={(e) => setNewRoute({ ...newRoute, sourcePath: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Parâmetros da Rota (JSON)</label>
          <textarea
            className="form-control"
            value={newRoute.routeParams}
            onChange={(e) => setNewRoute({ ...newRoute, routeParams: e.target.value })}
            placeholder='Exemplo: {"id": 123}'
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Parâmetros da Query (JSON)</label>
          <textarea
            className="form-control"
            value={newRoute.queryParams}
            onChange={(e) => setNewRoute({ ...newRoute, queryParams: e.target.value })}
            placeholder='Exemplo: {"key": "value"}'
          />
        </div>

        <div className="mb-3">
          <label className="form-label">URL de Destino</label>
          <input
            type="text"
            className="form-control"
            value={newRoute.targetUrl}
            onChange={(e) => setNewRoute({ ...newRoute, targetUrl: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Método HTTP</label>
          <select
            className="form-select"
            value={newRoute.method}
            onChange={(e) => setNewRoute({ ...newRoute, method: e.target.value })}
            required
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Cabeçalhos (JSON)</label>
          <textarea
            className="form-control"
            value={newRoute.headers}
            onChange={(e) => setNewRoute({ ...newRoute, headers: e.target.value })}
            placeholder='Exemplo: {"Authorization": "Bearer token"}'
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Descrição</label>
          <textarea
            className="form-control"
            value={newRoute.description}
            onChange={(e) => setNewRoute({ ...newRoute, description: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Adicionar Rota</button>
      </form>

      <h2 className="mt-5">Rotas Cadastradas</h2>
      <ul className="list-group mt-3">
        {routes.map((route) => (
          <li key={route.sourcePath} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{route.nameProject}</strong>: {route.sourcePath} => {route.targetUrl} <br />
              <small>Método: {route.method}</small><br />
              <small>Descrição: {route.description}</small>
            </div>
            <button onClick={() => deleteRoute(route.sourcePath)} className="btn btn-danger btn-sm">Deletar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoutesManager;
