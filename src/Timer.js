import React from 'react';

function Timer(props) {
    let minutes = Math.floor(props.timeRemaining / 60).toString().padStart(2, '0');
    let seconds = Math.floor(props.timeRemaining % 60).toString().padStart(2, '0');

    return (
        <>
            Timer: {minutes + " : " + seconds}
        </>
    );
}

export default Timer;