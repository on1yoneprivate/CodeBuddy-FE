const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const users = []; // 간단한 사용자 데이터 저장을 위한 배열

app.post('/users/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }
  // 이메일 중복 확인
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).send('Email already exists');
  }
  // 사용자 저장
  users.push({ email, password });
  res.status(201).send('회원가입 성공');
});

app.post('/users/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }
  // 사용자 인증
  const user = users.find(user => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).send('Invalid email or password');
  }
  // 토큰 반환 (여기서는 간단히 더미 토큰 사용)
  res.status(200).send({ token: 'dummy-token' });
});

app.listen(4000, () => console.log('Server running on port 4000'));
