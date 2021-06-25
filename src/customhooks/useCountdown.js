import { useCallback, useEffect, useState } from 'react';

function useCountdown(seconds, runOnMount, onTimerZero) {
    const [timer, setTimer] = useState(seconds);
    const [running, setRunning] = useState(runOnMount);
    
    useEffect(() => {
        let interval;

        if (running) {
            interval = setInterval(() => {
                setTimer(prevState => {
                    if (prevState === 1) {
                        clearInterval(interval);
                        onTimerZero();
                    }
                    return prevState - 1;
                });
            }, 1000);;
        }
        else {
            clearInterval(interval);
        }

        return () => clearInterval(interval);

    }, [running, onTimerZero]);

    // Resets the countdown timer to initial seconds value.
    const reset = useCallback(() => {
        setRunning(false);
        setTimer(seconds);
        setRunning(true);
    }, [seconds]);

    return { timer, running, setRunning, reset };
}

export default useCountdown;