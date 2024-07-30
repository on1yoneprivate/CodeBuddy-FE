const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { METHODS } = require('http');
const { prototype } = require('events');
const axios = require('axios');
const app = express();
require('dotenv').config(); // dotenv 패키지 로드

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 환경 변수에서 클라이언트 도메인 가져오기
const clientDomain = process.env.REACT_APP_CLIENT_IP;

const corsOptions = {
  origin: 'clientDomain', // 환경 변수에서 가져온 클라이언트 도메인
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // 자격 증명(쿠키, 인증 정보 등)을 포함하도록 설정합니다.
};

app.use(cors(corsOptions)); // CORS 미들웨어 추가
app.use(express.json());

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

app.use(cors(corsOptions));
// CORS 설정 추가
app.use(cors({
  origin: process.env.REACT_APP_CLIENT_IP, // 클라이언트 도메인
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

const posts = []; // 사용자 입력 데이터 저장을 위한 배열

// 회원가입 엔드포인트
app.post('/users/signup', (req, res) => {
  const { loginId, password, username, email } = req.body;

  if (!loginId || !password || !username || !email) {
    return res.status(400).send('All fields are required');
  }
  // 이메일 중복 확인
  const existingUserByEmail = users.find(user => user.email === email);
  if (existingUserByEmail) {
    return res.status(400).send('Email already exists');
  }
  // 사용자 이름 중복 확인
  const existingUserByUsername = users.find(user => user.loginId === loginId);
  if (existingUserByUsername) {
    return res.status(400).send('LoginId already exists');
  }
  // 사용자 저장
  users.push({ loginId, password, username, email });
  res.status(201).send('회원가입 성공');
});

// 로그인 엔드포인트
app.post('/users/login', (req, res) => {
  const { loginId, password } = req.body;
  if (!loginId || !password) {
    return res.status(400).send('loginId and password are required');
  }
  // 사용자 인증
  const user = users.find(user => user.loginId === loginId && user.password === password);
  if (!user) {
    return res.status(401).send('Invalid loginId or password');
  }
  // 로그인 성공 시 채팅방 데이터 반환
  const userChatrooms = chatroomData[loginId] || {};
  res.status(200).send({ token: 'dummy-token', loginId, chatrooms: userChatrooms });
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

/*
// plan 페이지 사용자 입력 처리
app.post(`/main/ask/:chatroomId/:categoryType`, async (req, res) => {
  const { chatroomId, categoryType } = req.params;
  const { input, loginId } = req.body;

  // 필수 파라미터가 비어있는지 검사
  if (!input) {
    return res.status(400).json({ error: 'Input is required' });
  }
  if (!loginId) {
    return res.status(400).json({ error: 'LoginId is required' });
  }
  if (!categoryType) {
    return res.status(400).json({ error: 'CategoryType is required' });
  }

  // 요청을 로그에 기록
  console.log(`userId: ${loginId}, input: ${input}, categoryType: ${categoryType}`);

  // 적절한 응답을 생성
  const responseOutput = `${input}에 적절한 답변 출력`;

  // 데이터 저장 로직
  const newSavedQuestion = {
    historyPrompt: input,
    historyOutput: responseOutput,
  };
  console.log(`Saving data for user: ${loginId}, category: ${categoryType}`);
  console.log('Saved Question: ', newSavedQuestion);

  // 포스트맨에 기록
  const postmanUrl = 'https://api.postman.com/collections/35117926-74ceb443-f0f6-4849-8f8a-e70ae8d7946e?access_key=PMAT-01J38B5FQ35TJSHVTZ814665Z9';
  const postmanApiKey = 'ict_test_api_key';

  try {
    // 포스트맨에 기록
    await axios.post(postmanUrl, {
      collection: {
        info: {
          name: "User Input Collection",
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        item: [
          {
            name: "User Input Request",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json"
                }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ input, loginId, categoryType, output: responseOutput })
              },
              url: {
                raw: "http://localhost:8000/main/ask",
                protocol: "http",
                host: ["localhost"],
                port: "8000",
                path: ["main", "ask"]
              }
            }
          }
        ]
      }
    }, {
      headers: {
        'X-Api-Key': postmanApiKey,
        'Content-Type' : 'application/json'
      }
    });

    console.log('Postman record created');
    res.status(200).json({ output: responseOutput });
  } catch (error) {
    console.error('Error creating Postman record:', error);
    res.status(500).send('Error saving data or creating Postman record');
  }
});
*/

const savedQuestions = [];

// 채팅방 입력 넘기기(질문하기)
app.post('/main/ask/:chatroomId/:categoryType', (req, res) => {
  const { chatroomId, categoryType } = req.params;
  const { input, loginId } = req.body;

  if (!input) {
      return res.status(400).json({ error: 'Input is required' });
  }
  if (!loginId) {
      return res.status(400).json({ error: 'LoginId is required' });
  }

  console.log(`userId: ${loginId}, input: ${input}, categoryType: ${categoryType}, chatroomId: ${chatroomId}`);

  const responseOutput = `${input}에 적절한 답변 출력`;

  res.status(200).json({ output: responseOutput });
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

// 서버 실행
// app.listen(8080, () => console.log('Server running on port 8080'));

const PORT = 8080;
const HOST = '52.78.201.133';
//app.listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`));
app.listen(8000, () => console.log('Server running on port 8000'));