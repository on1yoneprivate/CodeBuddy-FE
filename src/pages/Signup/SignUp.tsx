import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import LayoutCenter from '../../components/LayoutCenter';
import axios from 'axios';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const userIdRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  const apiUrl = `/users/signup`; // 프록시 설정을 사용하기 때문에 절대 경로 대신 상대 경로를 사용

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const config = {
        method: 'post',
        url: apiUrl,
        data: {
          loginId: userId,
          email: email,
          password: password,
          username: username,
        },
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true // CORS 요청에 쿠키를 포함하려면 설정
      };

      const response = await axios(config);
      console.log('Response:', response);

      if (response.status === 201) {
        setMessage('회원가입 성공!');
        window.alert('회원가입 성공!');
        navigate('/login');
      } else {
        setMessage('회원가입 실패. 다시 시도해주세요.');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // 서버 응답이 있는 경우
        setMessage(`회원가입 실패: ${error.response.data}`);
      } else {
        // 서버 응답이 없는 경우
        setMessage('회원가입 실패했습니다. 관리자에게 문의해주세요.');
      }
      console.error('회원가입 중 오류 발생:', error);
    }
  };

  return (
    <LayoutCenter>
      <div className="styled-form">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="styled-input"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            ref={userIdRef}
            required
          />
          <input
            type="email"
            className="styled-input"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            ref={emailRef}
            required
          />
          <input
            type="text"
            className="styled-input"
            placeholder="사용자 이름"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            ref={usernameRef}
            required
          />
          <input
            type="password"
            className="styled-input"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            ref={passwordRef}
            required
          />
          <button type="submit" className="styled-button">회원가입</button>
        </form>
        {message && <div className="message">{message}</div>}
      </div>
    </LayoutCenter>
  );
};

export default SignUp;
