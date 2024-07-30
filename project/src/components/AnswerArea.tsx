import React from 'react';
import './AnswerArea.css';

interface Message {
  chatroomId: string;
  type: 'text' | 'image';
  input: string;
  output: string;
}

interface AnswerAreaProps {
  messages: Message[];
  onSave: (chatroomId: string) => void;
}

const AnswerArea: React.FC<AnswerAreaProps> = ({ messages, onSave }) => {
  return (
    <div className="answer-area">
      {messages.slice().reverse().map((msg) => (
        <div key={msg.chatroomId} className="message">
          <p><strong>Input:</strong> {msg.input}</p>
          <p><strong>Output:</strong> {msg.output}</p>
          <button onClick={() => onSave(msg.chatroomId)}>Save</button>
        </div>
      ))}
    </div>
  );
}

export default AnswerArea;
