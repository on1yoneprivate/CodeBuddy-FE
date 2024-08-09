import React, { createContext, useContext, useState, ReactNode } from 'react';

// chatroomId 사용
// Context 타입 정의
interface ChatroomContextProps {
    chatroomCounter: number;
    incrementChatroomCounter: () => number;
    setChatroomCounter: React.Dispatch<React.SetStateAction<number>>;
}

// 초기값 설정
const ChatroomContext = createContext<ChatroomContextProps | undefined>(undefined);

// Context Provider 타입 정의
interface ChatroomProviderProps {
    children: ReactNode;
}

// Context Provider 컴포넌트
export const ChatroomProvider: React.FC<ChatroomProviderProps> = ({ children }) => {
    // chatroomCounter의 초기값을 현재 시간으로 설정
    const [chatroomCounter, setChatroomCounter] = useState(Date.now());

    // 새로운 chatroomId를 현재 시간으로 설정
    const incrementChatroomCounter = () => {
        const newChatroomId = Date.now();
        setChatroomCounter(newChatroomId);
        return newChatroomId;
    };

    return (
        <ChatroomContext.Provider value={{ chatroomCounter, incrementChatroomCounter, setChatroomCounter }}>
            {children}
        </ChatroomContext.Provider>
    );
};

// Context를 사용하는 custom hook
export const useChatroom = (): ChatroomContextProps => {
    const context = useContext(ChatroomContext);
    if (!context) {
        throw new Error('useChatroom must be used within a ChatroomProvider');
    }
    return context;
};
