import React from 'react';
import { BeatLoader, ClipLoader, PropagateLoader } from 'react-spinners';
import './Spinner.css';

const Spinner = () => {
    return (
        <div className="spinner-container">

            <PropagateLoader  color="#007BFF" size={15} />
        </div>
    );
};

export default Spinner;


