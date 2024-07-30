import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import LayoutCenter from '../../components/LayoutCenter';
import axios from 'axios';

const serverIP = process.env.REACT_APP_Server_IP;
const apiUrl = `${serverIP}/users/login`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cookies, setCookie] = useCookies(['token']);

  const handleLogin = async () => {
    try {
      console.log('Starting login process...');
      const loginData = { loginId: username, password };
      console.log('Login data:', loginData);
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
        credentials: 'include', // 쿠키 포함
      });
  
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      const data = await response.json();
      const token = data.token;
      console.log('Token received:', token);
  
      setMessage('로그인 성공!');
      console.log('Login success');
      localStorage.setItem('token', token);
      navigate('/home');
    } catch (error) {
      setMessage('로그인 실패!');
      console.error('Error during login:', error);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Form submitted');
    handleLogin();
  };

  return (
    <LayoutCenter>
      <div className="styled-form">
        <form onSubmit={handleSubmit}>
          <input
            className="styled-input"
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="styled-input"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="styled-button" type="submit">로그인</button>
          <Link className="styled-link" to="/forgot">아이디 / 비밀번호 찾기</Link>
        </form>
        {message && <div className="message">{message}</div>}
      </div>
    </LayoutCenter>
  );
};

export default Login;
