import React from 'react';
import './AnswerArea.css';

interface Message {
  chatroomId: number;
  type: 'text' | 'image';
  input: string;
  output: string;
}

interface AnswerAreaProps {
  messages: Message[];
  onSave: (chatroomId: number) => void;
}

const AnswerArea: React.FC<AnswerAreaProps> = ({ messages, onSave }) => {
  return (
    <div className="answer-area">
      {messages.map((message, index) => (
          <li key={index}>
            <div>Input: {message.input}</div>
            <div>Output: {message.output}</div>
          </li>
        ))}
    </div>
  );
}

export default AnswerArea;
