import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import LayoutCenter from '../../components/LayoutCenter';
import axios from 'axios';

const serverIP = process.env.REACT_APP_SERVER_IP; // 환경 변수 이름을 확인하세요
console.log('Server IP:', serverIP); // 환경 변수가 올바르게 로드되었는지 확인

const apiUrl = `/users/login`;
console.log('API URL:', apiUrl); // API URL이 올바르게 설정되었는지 확인

interface LoginProps {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [cookies, setCookie] = useCookies(['token']);

  const handleLogin = async () => {
    try {
      console.log('Starting login process...');
      const loginData = { loginId: username, password };
      console.log('Login data:', loginData);

      const response = await axios.post(apiUrl, loginData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem("login-token"),
        },
        withCredentials: true, // CORS 요청에 쿠키를 포함하려면 설정
      });

      console.log('Response:', response);
      if (response.status == 200) {
        const data = response.data;
        const accessToken = response.data.data.accessToken;
        const refreshToken = response.data.data.refreshToken;
        console.log('Access Token received:', accessToken);
        console.log('Refresh Token received:', refreshToken);

        if (!accessToken || !refreshToken) {
          throw new Error('Tokens not received');
        }

        setMessage('로그인 성공!');
        console.log('Login success');
        localStorage.setItem('loginId', username);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('token', accessToken);

        setIsAuthenticated(true);
        console.log('Setting isAuthenticated to true');

        navigate('/plan');
        console.log('Navigating to home...');
      }
    } catch (error) {
      setMessage('로그인 실패!');
      console.error('Error during login:', error);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Form submitted');
    if (username && password) {
      handleLogin()
    } else {
      setMessage('아이디와 비밀번호를 모두 입력해주세요.');
    }
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


