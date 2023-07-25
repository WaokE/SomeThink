// Timer.js
import { useState, useEffect } from "react";
import "./Timer.css";

const getSeconds = (time) => {
    const seconds = Number(time % 60);
    if (seconds < 10) {
        return "0" + String(seconds);
    } else {
        return String(seconds);
    }
};

const Timer = () => {
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [time, setTime] = useState(0); // 남은 시간 (단위: 초)
    const [isRunning, setIsRunning] = useState(false); // 타이머 실행 여부 상태

    useEffect(() => {
        setTime(minutes * 60 + seconds);
    }, [minutes, seconds]);

    useEffect(() => {
        let timer;
        if (isRunning && time > 0) {
            timer = setInterval(() => {
                setTime((prev) => prev - 1);
            }, 1000);
        } else if (isRunning && time === 0) {
            alert("Time OVER!");
            setIsRunning(false);
        }

        return () => clearInterval(timer);
    }, [isRunning, time]);

    const handleStart = () => {
        if (time > 0) {
            setIsRunning(true);
        }
    };

    const handleStop = () => {
        setIsRunning(false);
        setTime(0);
        setMinutes(0);
        setSeconds(0);
    };

    return (
        <div className={`timer ${isRunning && time <= 10 ? "red" : ""}`}>
            {!isRunning && (
                <div>
                    <input
                        className="timer-input"
                        type="number"
                        min="0"
                        max="59"
                        value={minutes}
                        onChange={(e) => setMinutes(parseInt(e.target.value))}
                    />
                    <span>분</span>
                    <input
                        className="timer-input"
                        type="number"
                        min="0"
                        max="59"
                        value={seconds}
                        onChange={(e) => setSeconds(parseInt(e.target.value))}
                    />
                    <span>초</span>
                </div>
            )}
            {isRunning && (
                <div>
                    <span>{parseInt(time / 60)}</span>
                    <span> : </span>
                    <span>{getSeconds(time)}</span>
                </div>
            )}
            {!isRunning && <button onClick={handleStart}>시작</button>}
            {isRunning && <button onClick={handleStop}>중지</button>}
        </div>
    );
};

export default Timer;
