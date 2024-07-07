import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import LayoutCenter from '../../components/LayoutCenter';
import axios from 'axios';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  const apiUrl = `http://localhost:4000/users/signup`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      confirmPasswordRef.current?.focus();
      return;
    }

    try {
      const response = await axios.post(apiUrl, {
        email: email,
        password: password,
      });

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
            type="email"
            className="styled-input"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="styled-input"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="styled-input"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
