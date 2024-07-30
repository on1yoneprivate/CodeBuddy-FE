import React, { useState, ReactElement, useRef } from 'react';
import "./ChatInterface.css";
import axios from 'axios';

interface ChatInterfaceProps {
    handleResponse: (input: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ handleResponse }): ReactElement => {
    const [input, setInput] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null); // 성공 또는 에러 메시지 상태
    const inputRef = useRef<HTMLInputElement>(null);        // // 입력 필드에 포커스를 맞추기 위한 ref

    const apiHost = process.env.REACT_APP_API_HOST || 'localhost';
    const apiPort = process.env.REACT_APP_API_PORT || '3001';
    const apiUrl = `http://${apiHost}:${apiPort}/posts`;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // 사용자가 입력란에 아무 것도 입력하지 않았을 경우
        if (input.trim() === "") {
            // setMessage('Input cannot be empty');
            inputRef.current?.focus(); // 입력 필드에 포커스 설정
            return;
        }

        // handleResponse를 통해 부모 컴포넌트에 값 전달
        handleResponse(input);

         // body 텍스트 내용의 앞 10글자를 title로 설정
        const title = input.trim().substring(0, 10);

        try {
            await axios.post(apiUrl, { title, body: input });
            console.log('Data saved successfully!');
        } catch (error) {
            console.error('There was an error saving the data:', error);
        }
        setInput('');  // 입력 필드 초기화
    };

    return (
        <div className="chat-interface">
            <form onSubmit={handleSubmit}>
                <input
                    ref={inputRef} // 입력 필드에 ref 속성 추가
                    type="text"
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="요구 사항을 입력하세요."
                />
                <button type="submit" className="send-button">Send</button>
            </form>
            {message && <div className="message">{message}</div>}
        </div>
    );
};

export default ChatInterface;