import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DatabaseTools from './pages/DatabaseTools';
import NetworkTools from './pages/NetworkTools';
import SystemTools from './pages/SystemTools';
import Settings from './pages/Settings';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/database" element={<DatabaseTools />} />
        <Route path="/network" element={<NetworkTools />} />
        <Route path="/system" element={<SystemTools />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;