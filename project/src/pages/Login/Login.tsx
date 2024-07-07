import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import LayoutCenter from '../../components/LayoutCenter';
import axios from 'axios';

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cookies, setCookie] = useCookies(['token']);

  const apiUrl = `http://localhost:4000/users/login`; // 로그인 엔드포인트

  const handleLogin = async () => {
    try {
      console.log('로그인 요청 시작:', { email, password });
      const response = await axios.post(apiUrl, { email, password });
      console.log('서버 응답:', response);

      if (response.status === 200) {
        const token = response.data.token;
        if (rememberMe) {
          setCookie('token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7일 동안 유지
        } else {
          setCookie('token', token, { path: '/' });
        }
        setMessage('로그인 성공!');
        console.log('로그인 성공, 홈으로 이동');
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        navigate('/home');
      } else {
        setMessage('로그인 실패. 다시 시도해주세요.');
        console.log('로그인 실패:', response.data);
      }
    } catch (error) {
      setMessage('로그인 실패했습니다. 관리자에게 문의해주세요.');
      console.error('로그인 중 오류 발생:', error);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleLogin();
  };

  return (
    <LayoutCenter>
      <div className="styled-form">
        <form onSubmit={handleSubmit}>
          <input
            className="styled-input"
            type="email"
            placeholder="아이디(이메일)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <div className="styled-checkbox">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>로그인 유지하기</span>
          </div>
          <Link className="styled-link" to="/forgot">아이디 / 비밀번호 찾기</Link>
        </form>
        {message && <div className="message">{message}</div>}
      </div>
    </LayoutCenter>
  );
};

export default Login;
