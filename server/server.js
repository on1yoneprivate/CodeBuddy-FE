const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { METHODS } = require('http');
const { prototype } = require('events');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const app = express();


app.use(cors({
  origin: process.env.REACT_APP_CLIENT_IP, // 클라이언트 도메인
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const users = []; // 간단한 사용자 데이터 저장을 위한 배열
let chatrooms = {};

const chatroomData = {
  "test": {
    "test-chatroom": [
      {
        category: "plan",
        historyTitle: "Test Chatroom Title",
        history: [
          {
            historyPrompt: "question1",
            historyOutput: "answer1"
          },
          {
            historyPrompt: "question2",
            historyOutput: "answer2"
          }
        ]
      },
      {
        category: "plan",
        historyTitle: "Another Test Chatroom Title",
        history: [
          {
            historyPrompt: "question3",
            historyOutput: "answer3"
          },
          {
            historyPrompt: "question4",
            historyOutput: "answer4"
          }
        ]
      }
    ]
  }
};

const posts = []; // 사용자 입력 데이터 저장을 위한 배열

// 회원가입 엔드포인트
app.post('/users/signup', (req, res) => {
  const { loginId, email, password, username } = req.body;
  if (!loginId || !email || !password || !username) {
    return res.status(400).send('All fields are required');
  }
  // 이메일 중복 확인
  const existingUserByEmail = users.find(user => user.email === email);
  if (existingUserByEmail) {
    return res.status(400).send('Email already exists');
  }
  // 사용자 이름 중복 확인
  const existingUserByUsername = users.find(user => user.username === loginId);
  if (existingUserByUsername) {
    return res.status(400).send('loginId already exists');
  }
  // 사용자 저장
  users.push({ loginId, email, password });
  res.status(201).send('회원가입 성공');
});

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET
let refreshTokens = [];

// 로그인 엔드포인트
app.post('/users/login', (req, res) => {
  const { loginId, password } = req.body;
  const user = users.find(u => u.loginId === loginId && u.password === password);

  if (user) {
    const accessToken = jwt.sign({ loginId: user.loginId }, accessTokenSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ loginId: user.loginId }, refreshTokenSecret, { expiresIn: '7d' });

    refreshTokens.push(refreshToken);

    res.json({
      success: true,
      message: '로그인 성공',
      data: {
        grantType: 'Bearer',
        accessToken,
        refreshToken
      }
    });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.post('/users/reissue', (req, res) => {
  const { loginId, refreshToken } = req.body;

  // 저장된 Refresh token 확인
  const storedRefreshToken = refreshTokens[loginId];

  if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 Refresh Token 입니다'
    });
  }

  // Refresh token 검증
  jwt.verify(refreshToken, refreshTokenSecret, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 Refresh Token 입니다'
      });
    }

    // 새로운 Access Token과 Refresh Token 발급
    const newAccessToken = jwt.sign({ loginId }, accessTokenSecret, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ loginId }, refreshTokenSecret, { expiresIn: '7d' });

    // Refresh token 저장 (단순 예제이므로 메모리에 저장)
    refreshTokens[loginId] = newRefreshToken;

    res.json({
      success: true,
      message: '토큰 재발급 성공',
      data: {
        grantType: 'Bearer',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  });
});

let chatroomCounter = 0;

app.post('/main/ask/:chatroomId', (req, res) => {
  const {chatroomId } = req.params;
  const { question } = req.body;
  const category = req.query.categoryType;
  const authorization = req.headers['authorization'];

  if (!authorization) {
    return res.status(401).json({ success: false, message: '인증에 필요한 JWT가 없습니다' });
  }

  const token = authorization.split(' ')[1];
  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '유효하지 않은 토큰입니다' });
    }

    // 질문 처리 로직
    const output = `질문: ${question}, 카테고리: ${category}`;
    res.json({ success: true, output });
  });
});

// 카테고리별 채팅방 리스트 가져오기
app.get('/chatrooms/titles', (req, res) => {
  const { userId, categoryType } = req.query;

  if (!userId || !categoryType) {
      return res.status(400).send({
      success: false,
      message: 'userId와 categoryType이 필요합니다.'
      });
  }

  const userChatrooms = chatroomData[userId];

  if (!userChatrooms) {
      return res.status(404).send({
      success: false,
      message: '사용자를 찾을 수 없습니다.'
      });
  }

  const filteredChatrooms = Object.entries(userChatrooms).reduce((result, [chatroomId, chatrooms]) => {
      const matchedChatrooms = chatrooms.filter(chatroom => chatroom.category === categoryType);
      if (matchedChatrooms.length > 0) {
      result[chatroomId] = matchedChatrooms[0].historyTitle; // assuming all have the same title for a chatroomId
      }
      return result;
  }, {});

  res.status(200).send({
      success: true,
      message: '채팅방의 목록을 불러왔습니다.',
      data: filteredChatrooms,
  });
});

// 채팅 상세 내역 가져오기
app.get('/chats/:chatroomId', (req, res) => {
  const chatroomId = req.params.chatroomId;
  const userId = req.query.loginId;
  const data = chatrooms[chatroomId];
  
  console.log(`User ID : ${userId}, ChatroomID: ${chatroomId}`);

  if (data) {
    res.status(200).json({ success: true, data: { questions : data } });
  } else {
    res.status(400).json({ success: false, error : 'Bad Request'});
  }
})

// 데이터 저장 엔드포인트
app.post('/main/plan/save/:filename', (req, res) => {
  const { filename } = req.params;
  console.log(`filename: ${filename}`); // 디버깅용 콘솔 로그
  const { loginId, category, historyTitle, history } = req.body;
  if (!loginId || !category || !historyTitle || !history) {
    return res.status(400).send('All fields are required');
  }
  // 채팅방 데이터 저장
  if (!chatroomData[loginId]) {
    chatroomData[loginId] = {};
  }
  if (!chatroomData[loginId][filename]) {
    chatroomData[loginId][filename] = [];
  }
  chatroomData[loginId][filename].push({ category, historyTitle, history });
  console.log(`Data saved for ${filename}:`, chatroomData[loginId][filename]); // 디버깅용 콘솔 로그
  res.status(201).send('데이터 저장 성공');
});

// 포스트 데이터 저장 엔드포인트
app.post('/posts', (req, res) => {
  const {title, body} = req.body;
  if (!title || !body) {
    return res.status(400).send('Title and body are required');
  }
  posts.push({title, body});
  res.status(201).send('Post saved successfully');
})

const savedQuestions = [];

// 채팅방 ID를 관리하기 위한 변수
let currentChatroomId = 1;

// 채팅방 입력 넘기기(질문하기)
app.post('/main/ask/chatroomId', (req, res) => {
  const { chatroomId } = req.params;
  const { categoryType } = req.query; // 쿼리 파라미터로 categoryType 가져오기
  const { question } = req.body;
  const authorization = req.headers['authorization'];

  if (!authorization) {
    return res.status(401).json({ success: false, message: '인증에 필요한 JWT가 없습니다' });
  }

  const token = authorization.split(' ')[1];
  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '유효하지 않은 토큰입니다' });
    }

    try {
      // 질문 처리 로직
      let output;
      switch (categoryType.toUpperCase()) {
        case 'PLAN':
          output = `질문: ${question}, 카테고리: ${categoryType}`;
          break;
        case 'DESIGN':
          // Design 카테고리에 대한 처리 로직
          output = `질문: ${question}, 카테고리: ${categoryType}`;
          break;
        case 'CODE':
          // Code 카테고리에 대한 처리 로직
          output = `Code 처리 결과: ${question}`;
          break;
        default:
          throw new Error('Invalid category type');
  }
  res.json({ success: true, output });
    } catch (error) {
      console.error('Error processing question:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
});

app.put('/save/:chatroomId', (req, res) => {
  const { chatroomId } = req.params;
  const { loginId, categoryType, newSavedQuestion } = req.body;

  // Save the chatroom data in the in-memory storage
  chatrooms[chatroomId] = {
    loginId,
    categoryType,
    newSavedQuestion
  };

  res.status(200).json({
    success: true,
    message: '채팅방을 저장합니다.'
  });
});

/*
// 질문 저장 엔드포인트
app.post('/main/:category/save/:chatroomId', (req, res) => {
  const { category, chatroomId } = req.params;
  const { newSavedQuestion } = req.body;

  if (!newSavedQuestion) {
    return res.status(400).json({ error: 'newSavedQuestion is required' });
  }

  console.log(`Saving question for category: ${category}, filename: ${chatroomId}`);
  console.log('Saving question:', newSavedQuestion);

  savedQuestions.push(newSavedQuestion);

  res.status(200).json({ success: true });
});
*/

// 저장된 데이터 가져오기
app.get('/main/plan/saved', (req, res) => {
  const { userId } = req.query;
  console.log(`Fetching saved data for userId: ${userId}`);   // 디버깅용 로그
  if (!userId) {
    return res.status(400).send('userId is required');
  }
  const userChatrooms = chatroomData[userId] || {};
  console.log(`User chatrooms: `, userChatrooms);     // 디버깅용 로그
  const savedQuestions = Object.values(userChatrooms).flat();
  console.log(`Saved questions: `, savedQuestions);     // 디버깅용 로그
  res.status(200).send({ savedQuestions });
});

// 채팅 상세 내역 가져오기
app.get('/main/plan/save/:chatroomid', (req, res) => {
  const { chatroomid } = req.params;
  const { userId } = req.query;
  console.log(`chatroomid: ${chatroomid}, userId: ${userId}`); // 디버깅용 콘솔 로그
  if (!userId) {
    return res.status(400).send('userId is required');
  }
  const userChatrooms = chatroomData[userId];
  if (!userChatrooms || !userChatrooms[chatroomid]) {
    return res.status(404).send('채팅방 데이터를 찾을 수 없습니다');
  }
  const chatHistory = userChatrooms[chatroomid];
  res.status(200).send(chatHistory);
});

// 채팅방 삭제 엔드포인트
app.delete('/delete/:chatroomId', (req, res) => {
  const { chatroomId } = req.params;
  const chatroomIndex = chatrooms.findIndex(c => c.chatroomId === parseInt(chatroomId, 10));
  if (chatroomIndex !== -1) {
    chatrooms.splice(chatroomIndex, 1);
    res.json({ success: true, message: '채팅방이 삭제되었습니다.' });
  } else {
    res.status(404).json({ success: false, message: '채팅방을 찾을 수 없습니다.' });
  }
});

// 서버 실행
// app.listen(8000, () => console.log('Server running on port 8000'));
const PORT = 8080;
const HOST = '52.78.201.133';
app.listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`));