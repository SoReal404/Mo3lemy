import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = document.getElementById('chemistry-root');
if (!root) throw new Error('The chemistry lab root element was not found.');
createRoot(root).render(<StrictMode><App /></StrictMode>);
