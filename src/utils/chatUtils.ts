import { Dispatch, SetStateAction } from 'react';
import { Message } from '../types/Message';

interface ChatroomContextType {
  chatroomCounter: number;
  setChatroomCounter: Dispatch<SetStateAction<number>>;
}

export const handleNewChatroom = (
  category: string,
  categoryChatroomIds: { [key: string]: number },
  setCategoryChatroomIds: Dispatch<SetStateAction<{ [key: string]: number }>>,
  chatroomContext: ChatroomContextType,
  setCurrentChatroomId: Dispatch<SetStateAction<number>>,
  setQuestions: Dispatch<SetStateAction<Message[]>>
) => {
  // 현재 시간을 기반으로 새로운 chatroomId를 생성
  const newChatroomId = Date.now(); // 또는 new Date().getTime() 사용 가능
  
  // chatroomCounter를 업데이트 할 필요가 없으므로 이 부분을 생략
  // setChatroomCounter(newChatroomId);

  // category에 따른 chatroomId를 업데이트
  setCategoryChatroomIds(prev => ({ ...prev, [category]: newChatroomId }));
  
  // 현재 chatroomId를 설정
  setCurrentChatroomId(newChatroomId);
  
  // 질문 목록 초기화
  setQuestions([]);

  console.log('새로운 채팅방이 생성되었습니다.', `chatroomId: ${newChatroomId}`);
};
