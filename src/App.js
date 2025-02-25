import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Calendar from './pages/calendar';
import Upload from './pages/upload';
import Login from './pages/login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/GBPS-Calendar" element={<Calendar />} />
                    <Route path="/GBPS-Calendar/login" element={<Login />} />
                    <Route path="/GBPS-Calendar/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                </Routes>
            </div>
        </Router>
    );
}
export default App;