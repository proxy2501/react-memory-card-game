import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import './stylesheets/errorscreen.css';

function ErrorScreen(props) {
    const theme = useContext(ThemeContext);
    const buttonStyle = { backgroundColor: theme.buttonColor, color: theme.buttonTextColor, textShadow: theme.textShadow };

    return (
        <div className="error-screen">
            <div className="message" style={{backgroundColor: theme.backgroundBoxColor}}>
                <h1>{props.errorMessage}!</h1>
            </div>
            <div className="buttons">
                <button style={buttonStyle} onClick={() => {props.onClickReturn()}}>Return</button>
            </div>
        </div>
    );
}

export default ErrorScreen;