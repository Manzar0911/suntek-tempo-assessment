import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthView } from '@/views/AuthView';
import { DashboardView } from '@/views/DashboardView';
export default function App() { return <Routes><Route path="/" element={<Navigate to="/app" replace/>}/><Route path="/auth/:mode" element={<AuthView/>}/><Route path="/app" element={<DashboardView/>}/><Route path="*" element={<Navigate to="/app" replace/>}/></Routes>; }
