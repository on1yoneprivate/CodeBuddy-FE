import axios from 'axios';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // 서버 URL을 절대 경로로 설정
  timeout: 10000, // 요청 타임아웃 설정 (예: 10초)
});

export default apiClient;