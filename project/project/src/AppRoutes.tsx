import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import Testcode from './pages/Testcode';
import Plan from './pages/Plan';
import Code from './pages/Code';
import Blueprint from './pages/Blueprint';
import Mypage from './pages/Mypage';
import Version from './pages/Version';
import Home from './pages/Home/Home';
import ChatInterface from './components/ChatInterface';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Init from './pages/Init/init';
import axios from 'axios';

interface AppRoutesProps {
  handleResponse: (input: string) => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ handleResponse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatInterfacePaths = ['/plan', '/code', '/blueprint', '/testcode', '/version'];

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup') {
      navigate('/home');
    }
  }, [loading, isAuthenticated, location, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Init />} />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Init />} />
        <Route path="/plan" element={isAuthenticated ? <Plan /> : <Init />} />
        <Route path="/code" element={isAuthenticated ? <Code /> : <Init />} />
        <Route path="/blueprint" element={isAuthenticated ? <Blueprint /> : <Init />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/mypage" element={isAuthenticated ? <Mypage /> : <Init />} />
        <Route path="/testcode" element={isAuthenticated ? <Testcode /> : <Init />} />
        <Route path="/version" element={isAuthenticated ? <Version /> : <Init />} />
      </Routes>
      {chatInterfacePaths.includes(location.pathname) && isAuthenticated && (
        <ChatInterface handleResponse={handleResponse} />
      )}
    </>
  );
};

export default AppRoutes;
