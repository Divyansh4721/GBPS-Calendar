import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Calendar from './pages/calendar';
import Upload from './pages/upload';
import Login from './pages/login';
import Youtube from './pages/youtube';
import MealPLAN from './pages/mealplanner';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Calendar />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/youtube" element={<Youtube />} />
                    <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                    <Route path="/mealplan" element={<MealPLAN />} />
                </Routes>
            </div>
        </Router>
    );
}
export default App;