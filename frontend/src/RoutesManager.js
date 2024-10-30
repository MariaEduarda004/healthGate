// src/RoutesManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoutesManager = () => {
  const [routes, setRoutes] = useState([]);
  const [newRoute, setNewRoute] = useState({ path: '', target: '' });

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
      await axios.post('/api/routes', newRoute);
      setNewRoute({ path: '', target: '' });
      loadRoutes(); // Recarregar as rotas após adicionar
    } catch (error) {
      console.error('Erro ao adicionar rota:', error);
    }
  };

  // Função para deletar uma rota
  const deleteRoute = async (path) => {
    try {
      await axios.delete(`/api/routes/${path}`);
      loadRoutes();
    } catch (error) {
      console.error('Erro ao deletar rota:', error);
    }
  };

  return (
    <div>
      <h1>Gerenciamento de Rotas</h1>
      <form onSubmit={addRoute}>
        <label>
          Caminho:
          <input
            type="text"
            value={newRoute.path}
            onChange={(e) => setNewRoute({ ...newRoute, path: e.target.value })}
            required
          />
        </label>
        <label>
          Destino:
          <input
            type="text"
            value={newRoute.target}
            onChange={(e) => setNewRoute({ ...newRoute, target: e.target.value })}
            required
          />
        </label>
        <button type="submit">Adicionar Rota</button>
      </form>

      <h2>Rotas Cadastradas</h2>
      <ul>
        {routes.map((route) => (
          <li key={route.path}>
            {`${route.path} => ${route.target}`} 
            <button onClick={() => deleteRoute(route.path)}>Deletar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoutesManager;
