import React  from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Success from './components/Success';
import VerificationForm from './components/verification';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VerificationForm />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </Router>
  );
};

export default App;
