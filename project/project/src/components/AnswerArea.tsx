import React from 'react';
import './AnswerArea.css';

interface AnswerAreaProps {
  messages: string[];
}

const AnswerArea: React.FC<AnswerAreaProps> = ({ messages }) => {
  return (
    <div className="answer-area">
      {/* 
      {messages.map((msg, index) => (
        <div key={index} className="message">
          {msg}
        </div>
      ))}
      */}
      <p>답변창 (추후 구현 예정) </p>
    </div>
  );
}

export default AnswerArea;
