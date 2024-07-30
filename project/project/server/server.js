const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { METHODS } = require('http');
const { prototype } = require('events');
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const users = []; // 간단한 사용자 데이터 저장을 위한 배열
const savedQuestions = {}; // 간단한 데이터 저장을 위한 객체
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

// 상새 내역 조회하기 위한 임시 데이터
const chatrooms = {
  'test-chatroom': [
    { historyPrompt: 'question1', historyOutput: 'answer1' },
    { historyPrompt: 'question2', historyOutput: 'answer2' }
  ],
  'another-chatroom': [
    { historyPrompt: 'question3', historyOutput: 'answer3' },
    { historyPrompt: 'question4', historyOutput: 'answer4' }
  ]
};

const posts = []; // 사용자 입력 데이터 저장을 위한 배열

// 회원가입 엔드포인트
app.post('/users/signup', (req, res) => {
  const { loginId, email, password, confirmPassword } = req.body;
  if (!loginId || !email || !password || !confirmPassword) {
    return res.status(400).send('All fields are required');
  }
  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
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
app.get('/chatrooms/:chatroomId', (req, res) => {
  const chatroomId = req.params.chatroomId;
  const userId = req.query.loginId;
  const data = chatrooms[chatroomId];
  
  console.log(`User ID : ${userId}, ChatroomID: ${chatroomId}`);

  if (data) {
    res.status(200).json({ success: true, data: { questinos : data } });
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

// plan 페이지 사용자 입력 처리
app.post('/main/plan', async (req, res) => {
  const { input, loginId, categoryType } = req.body;

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
  console.log(`Saving data for user: ${loginId}, category: ${categoryType}`);
  console.log('Saved Question: ', newSavedQuestion);

  // 포스트맨에 기록
  const postmanUrl = 'https://elements.getpostman.com/redirect?entityId=35117926-74ceb443-f0f6-4849-8f8a-e70ae8d7946e&entityType=collection';
  const postmanApiKey = 'ict_test_api_key';

  try {
    // 포스트맨에 기록
    await axios.post(postmanUrl, {
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({ input, loginId, categoryType, output: responseOutput })
        },
        url: {
          raw: 'http://localhost:8000/main/plan',
          protocol: 'http',
          host: ['localhost'],
          port: '8000',
          path: ['main', 'plan']
        }
      }
    }, {
      headers: {
        'X-Api-Key': postmanApiKey
      }
    });

    console.log('Postman record created');
    res.status(200).json({ output: responseOutput });
  } catch (error) {
    console.error('Error creating Postman record:', error);
    res.status(500).send('Error saving data or creating Postman record');
  }
});


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
app.listen(8000, () => console.log('Server running on port 8000'));

