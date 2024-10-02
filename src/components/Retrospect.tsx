import React from 'react';
import './Retrospect.css';
import ReactMarkdown from 'react-markdown';

interface RetrospectProps {
    data: string | null;
}

const Retrospect: React.FC<RetrospectProps> = ({ data }) => {
    return (
        <div className="retrospect-container">
        {/* <div className="retrospect-title">
            생성된 회고록
        </div> */}
        <div className="retrospect-content">
            {data ? (
            <ReactMarkdown>{data}</ReactMarkdown>
            ) : (
            <p>회고록 데이터가 없습니다.</p>
            )}
        </div>
        </div>
    );
};
  
export default Retrospect;