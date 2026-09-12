import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthController } from '@/controllers/auth.controller';
import App from './App';
import './styles/global.css';
import './styles/royal.css';
import './styles/bonus.css';
import './styles/accessibility.css';

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><AuthController><App /></AuthController></BrowserRouter></StrictMode>);
