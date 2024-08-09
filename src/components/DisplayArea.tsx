import React from 'react';
import './DisplayArea.css';

interface DisplayAreaProps {
  messages: string[];
}

const DisplayArea: React.FC<DisplayAreaProps> = ({ messages }) => {
  return (
    <div className="display-area">
      {messages.map((msg, index) => (
        <div key={index}>{msg}</div>
      ))}
    </div>
  );
}

export default DisplayArea;
