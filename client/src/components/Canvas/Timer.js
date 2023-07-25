import { useState, useEffect, useRef } from "react";
import "./Timer.css";

const Timer = ({ ymapRef, handleStartTimeChange, handleDurationChange, setIsTimerRunning }) => {
    const startTime = ymapRef.current.get("StartTime");
    const duration = ymapRef.current.get("Duration");
    const isTimerRunning = ymapRef.current.get("TimerRunning");

    const calculateRemainingTime = () => {
        const now = Date.now();
        const startTime = ymapRef.current.get("StartTime") || now;
        const duration = ymapRef.current.get("Duration") || 0;
        const elapsed = now - startTime;
        return Math.max(duration - elapsed, 0);
    };

    const [remainingTime, setRemainingTime] = useState(calculateRemainingTime());

    useEffect(() => {
        let timer;
        if (isTimerRunning) {
            timer = setInterval(() => {
                const remaining = calculateRemainingTime();
                setRemainingTime(remaining);
                if (remaining <= 0) {
                    setIsTimerRunning(false);
                    alert("Time OVER!");
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTimerRunning, setIsTimerRunning]);

    const handleStart = (event) => {
        if (remainingTime > 0) {
            const now = Date.now();
            handleStartTimeChange(now);
            handleDurationChange(remainingTime);
            setIsTimerRunning(true);
            ymapRef.current.set("TimerRunning", true);
        }
    };

    const handleStop = () => {
        setIsTimerRunning(false);
        ymapRef.current.set("TimerRunning", false);
    };

    const remainingMinutes = Math.floor(remainingTime / (60 * 1000)) || 0;
    const remainingSeconds = Math.floor((remainingTime / 1000) % 60) || 0;

    return (
        <div className={`timer ${isTimerRunning && remainingTime <= 10 ? "red" : ""}`}>
            {!isTimerRunning && (
                <div>
                    <input
                        className="timer-input"
                        type="number"
                        min="0"
                        max="59"
                        value={remainingMinutes}
                        onChange={(e) => {
                            const newDuration =
                                e.target.value * 60 * 1000 + remainingSeconds * 1000;
                            handleDurationChange(newDuration);
                            setRemainingTime(newDuration);
                        }}
                    />
                    <span> : </span>
                    <input
                        className="timer-input"
                        type="number"
                        min="0"
                        max="59"
                        value={remainingSeconds}
                        onChange={(e) => {
                            const newDuration =
                                remainingMinutes * 60 * 1000 + e.target.value * 1000;
                            handleDurationChange(newDuration);
                            setRemainingTime(newDuration);
                        }}
                    />
                </div>
            )}
            {isTimerRunning && (
                <div>
                    <span>{remainingMinutes}</span>
                    <span> : </span>
                    <span>{remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds}</span>
                </div>
            )}
            {!isTimerRunning && <button onClick={handleStart}>시작</button>}
            {isTimerRunning && <button onClick={handleStop}>중지</button>}
        </div>
    );
};

export default Timer;
