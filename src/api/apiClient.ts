import axios from 'axios';

// Axios를 사용하여 API와 통신할 수 있는 클라이언트를 생성.
export const apiClient = axios.create({
  // API 요청을 보낼 때 기본적으로 사용할 URL.
  // 이전 버전처럼 이 부분이 하드코딩되어있을 경우 배포 환경에서 기능이 정상동작하지 않을 수 있다.
  // 
  baseURL: process.env.REACT_APP_Server_IP,
  headers: {
      // CORS(Cross-Origin Resource Sharing) 정책을 우회하기 위해 모든 출처(origin)에서의 요청을 허용합니다. 이렇게 하면 브라우저에서의 클라이언트 사이드 호출에 제한을 두지 않습니다. 이 헤더를 서버 측에서 설정해야 실제로 CORS를 허용할 수 있다.
      'Access-Control-Allow-Origin': '*',
      // 요청 데이터의 타입을 JSON으로 지정합니다. API 서버에 JSON 형식의 데이터를 전달할 때 유용합니다. 이 헤더를 설정하면 서버가 요청 본문을 JSON으로 파싱할 수 있게 된다.
      'Content-Type': 'application/json',
  },
});

// 요청을 인터셉트하고 수정하는 함수.
// 요청이 실행되기 '전'에 호출.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // Axios 인스턴스의 인터셉터를 이용하여 요청 전에 헤더에 Authorization 필드를 추가.
  // 로컬 스토리지에 access_token이 있고 요청 객체에 헤더가 설정되어 있을 때만 코드가 실행되도록 한다.
  if (token && config.headers) {

      // 요청 헤더에 Authorization 필드를 추가.
      // 액세스 토큰이 포함되며, 액세스 토큰은 Bearer 스키마를 사용하여 설정.
      // Bearer? HTTP 인증 헤더에서 사용되는 일반적인 방법.
      config.headers['Authorization'] = `Bearer ${token}`;
  };

  // 이렇게 설정된 헤더는 해당 Axios 인스턴스를 사용하여 API 요청을 보낼 때마다 자동으로 요청에 추가되어 서버로 전달.
  // API 서버는 이를 통해 클라이언트가 인증된 사용자인지 확인.
  // 사용자가 로그인한 상태에서 API 요청을 보낼 때, 이 코드를 통해 액세스 토큰이 포함된 헤더가 자동으로 생성되어 인증이 이루어지게 된다.

  return config;
});

export default apiClient;