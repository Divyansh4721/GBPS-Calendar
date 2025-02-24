import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Calendar from './pages/calendar';
import './App.css';
function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="*" element={<Calendar />} />
                </Routes>
            </div>
        </Router>
    );
}
export default App;