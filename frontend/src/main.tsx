import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'; // Seu CSS com Tailwind

// Importe suas páginas (o .tsx é inferido pelo bundler)
import SelectionPage from './pages/SelectionPage';
import RecommendationsPage from './pages/RecommendationsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <SelectionPage />,
  },
  {
    path: '/recomendacoes',
    element: <RecommendationsPage />,
  },
]);

// Usamos 'as HTMLElement' ou '!' para dizer ao TypeScript que 'root' não é nulo.
// '!' (non-null assertion operator) é mais comum neste caso.
const rootElement = document.getElementById('root')!;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);