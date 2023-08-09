import { useState, useEffect, useRef } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import "./Timer.css";

const Timer = ({ sessionId, isTimerRunning, setIsTimerRunning }) => {
    const ydocRef = useRef(new Y.Doc());
    const ymapRef = useRef(null);

    const [startTime, setStartTime] = useState(Date.now());
    const [duration, setDuration] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);

    const handleDurationChange = (newDuration) => {
        if (!newDuration || isNaN(newDuration)) {
            newDuration = 0;
        }
        ymapRef.current.set("Duration", Number(newDuration));
        setRemainingTime(newDuration);
    };

    const setTimerRunning = (isRunning) => {
        if (ymapRef.current) {
            ymapRef.current.set("TimerRunning", isRunning);
        }
    };

    const calculateRemainingTime = () => {
        const ymap = ymapRef.current;
        if (!ymap) {
            return 0;
        }

        const now = Date.now();
        const startTime = ymapRef.current.get("StartTime") || now;
        const duration = ymapRef.current.get("Duration") || 0;
        const elapsed = now - startTime;
        return Math.max(duration - elapsed, 0);
    };

    useEffect(() => {
        // ydocRef.current = new Y.Doc();
        const storedSessionId = sessionStorage.getItem("sessionId");
        const newSessionId = storedSessionId ? storedSessionId : sessionId;
        sessionStorage.setItem("sessionId", newSessionId);
        const provider = new WebsocketProvider(
            "wss://somethink.online/timer",
            // "ws://localhost:2345",
            newSessionId,
            ydocRef.current
        );

        ymapRef.current = ydocRef.current.getMap("TimerData");

        ymapRef.current.observe((event) => {
            let newStartTime, newDuration, newIsTimerRunning;
            ymapRef.current.forEach((value, key) => {
                if (key === "StartTime") {
                    newStartTime = Number(value);
                } else if (key === "Duration") {
                    newDuration = Number(value);
                } else if (key === "TimerRunning") {
                    newIsTimerRunning = Boolean(value);
                }
            });
            if (newStartTime !== undefined) {
                setStartTime(newStartTime);
            }
            if (newDuration !== undefined) {
                setDuration(newDuration);
                setRemainingTime(newDuration);
            }
            if (newIsTimerRunning !== undefined) {
                setIsTimerRunning(newIsTimerRunning);
            }
        });
    }, []);

    useEffect(() => {
        let timer;
        // let remaining = remainingTime;
        if (isTimerRunning) {
            timer = setInterval(() => {
                const remaining = calculateRemainingTime();
                // remaining -= 1000;
                setRemainingTime(remaining);
                if (remaining <= 0) {
                    setIsTimerRunning(false);
                    ymapRef.current.set("TimerRunning", false);
                    setRemainingTime(0);
                    alert("Time OVER!");
                }
                setCircleDasharray();
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTimerRunning, setIsTimerRunning]);

    const handleStart = () => {
        if (remainingTime > 0) {
            const now = Date.now();
            ymapRef.current.set("StartTime", now);
            ymapRef.current.set("Duration", duration);
            setIsTimerRunning(true);
            ymapRef.current.set("TimerRunning", true);
        }
    };

    const handleStop = () => {
        setIsTimerRunning(false);
        ymapRef.current.set("TimerRunning", false);
        handleDurationChange(remainingTime);
    };

    const handleReset = () => {
        setIsTimerRunning(false);
        ymapRef.current.set("TimerRunning", false);
        handleDurationChange(0);
    };

    const remainingMinutes = Math.trunc(remainingTime / (60 * 1000)) || 0;
    const remainingSeconds = Math.ceil((remainingTime / 1000) % 60) || 0;

    const setCircleDasharray = () => {
        const circle = document.getElementById("base-timer-path-remaining");
        const fraction = remainingTime / duration;
        const dashArray = `${(283 * fraction).toFixed(0)} 283`;
        circle.setAttribute("stroke-dasharray", dashArray);
    };

    useEffect(() => {
        setCircleDasharray();
    }, [remainingTime]);

    const maxLengthCheck = (object) => {
        if (object.target.value.length > object.target.maxLength) {
            object.target.value = object.target.value.slice(0, object.target.maxLength);
        }
    };
    const timerColorClass = isTimerRunning ? (remainingTime <= 10000 ? "red" : "yellow") : "";
    return (
        <div className={`timer ${isTimerRunning && remainingTime <= 10000 ? "red" : ""}`}>
            <div className="base-timer">
                <svg
                    className="base-timer__svg"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g className="base-timer__circle">
                        <circle className="base-timer__path-elapsed" cx="50" cy="50" r="45" />
                        <path
                            id="base-timer-path-remaining"
                            strokeDasharray="283"
                            className={`base-timer__path-remaining ${timerColorClass}`}
                            d="
                    M 50, 50
                    m -45, 0
                    a 45,45 0 1,0 90,0
                    a 45,45 0 1,0 -90,0
                    "
                        />
                    </g>
                </svg>
                {!isTimerRunning ? (
                    <div className="timer-input-container">
                        <input
                            className="timer-input"
                            type="number"
                            min="0"
                            max="99"
                            maxLength={2}
                            value={
                                remainingMinutes < 10 ? "0" + remainingMinutes : remainingMinutes
                            }
                            onChange={(e) =>
                                handleDurationChange(
                                    e.target.value * 60 * 1000 + remainingSeconds * 1000
                                )
                            }
                            onInput={maxLengthCheck}
                        />
                        <span className="timer-input-separator">:</span>
                        <input
                            className="timer-input"
                            type="number"
                            min="0"
                            max="59"
                            maxLength={2}
                            value={
                                remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds
                            }
                            onChange={(e) =>
                                handleDurationChange(
                                    remainingMinutes * 60 * 1000 + e.target.value * 1000
                                )
                            }
                        />
                        <div className="buttons">
                            <button onClick={handleReset} style={{ marginRight: "10px" }}>
                                <svg
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    x="0px"
                                    y="0px"
                                    viewBox="0 0 256 256"
                                    enable-background="new 0 0 256 256"
                                    xmlSpace="preserve"
                                >
                                    <g>
                                        <path
                                            fill="#000000"
                                            d="M132.4,10.6c-1.7,0.7-3.2,2.4-3.9,4.1c-0.3,0.8-0.5,5.8-0.5,13v11.7l-5.4,0.3c-26,1.5-49.2,11.9-67.6,30.2c-15.8,15.8-25.3,34.3-29.1,56.8c-1.3,7.8-1.4,23.5-0.2,31.2c3.6,22.1,12.9,41,27.9,56.6c15.7,16.4,36.2,27,59.4,30.7c7.1,1.1,22.9,1.1,30,0c30.3-4.9,55.5-21.2,72-46.7c7.5-11.6,12.9-25.8,15.3-40.6c1.2-7.7,1.1-23.4-0.2-31.2c-3-17.5-9.2-32.3-19.2-45.5c-5-6.6-6.2-7.7-9.2-7.9c-1.8-0.1-3,0-4.1,0.6c-0.9,0.5-4.3,3.6-7.7,6.9c-8.5,8.7-8.8,10-3.1,17.5c7.3,9.8,11.8,19.9,14,31.9c1.1,6,1.1,19.2-0.1,25.4c-9,48.6-61.1,75-105.3,53.5c-20.5-10-35.4-29.5-40-52.5c-1.5-7.4-1.5-20,0-27.4c6.6-33.4,34.1-57.6,67.8-59.9l4.7-0.3v11.9c0,13,0.1,13.9,2.7,16.1c1.7,1.4,3.9,1.9,6.4,1.5c1.5-0.2,4.2-2.8,21.9-20.4c17.7-17.7,20.2-20.4,20.4-21.9c0.8-4.2,1.3-3.6-20-25c-11.2-11.2-20.4-20-21.2-20.4C136.4,9.8,134.2,9.8,132.4,10.6z"
                                        />
                                    </g>
                                </svg>
                            </button>
                            <button onClick={handleStart}>
                                <svg width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <span id="base-timer-label" className="base-timer__label">
                            {remainingSeconds === 60 ? 1 + remainingMinutes : remainingMinutes}:
                            {remainingSeconds === 60
                                ? "00"
                                : remainingSeconds < 10
                                ? "0" + remainingSeconds
                                : remainingSeconds}
                        </span>
                        <div className="buttons">
                            <button onClick={handleReset} style={{ marginRight: "10px" }}>
                                <svg
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    x="0px"
                                    y="0px"
                                    viewBox="0 0 256 256"
                                    enable-background="new 0 0 256 256"
                                    xmlSpace="preserve"
                                >
                                    <g>
                                        <g>
                                            <g>
                                                <path
                                                    fill="#000000"
                                                    d="M132.4,10.6c-1.7,0.7-3.2,2.4-3.9,4.1c-0.3,0.8-0.5,5.8-0.5,13v11.7l-5.4,0.3c-26,1.5-49.2,11.9-67.6,30.2c-15.8,15.8-25.3,34.3-29.1,56.8c-1.3,7.8-1.4,23.5-0.2,31.2c3.6,22.1,12.9,41,27.9,56.6c15.7,16.4,36.2,27,59.4,30.7c7.1,1.1,22.9,1.1,30,0c30.3-4.9,55.5-21.2,72-46.7c7.5-11.6,12.9-25.8,15.3-40.6c1.2-7.7,1.1-23.4-0.2-31.2c-3-17.5-9.2-32.3-19.2-45.5c-5-6.6-6.2-7.7-9.2-7.9c-1.8-0.1-3,0-4.1,0.6c-0.9,0.5-4.3,3.6-7.7,6.9c-8.5,8.7-8.8,10-3.1,17.5c7.3,9.8,11.8,19.9,14,31.9c1.1,6,1.1,19.2-0.1,25.4c-9,48.6-61.1,75-105.3,53.5c-20.5-10-35.4-29.5-40-52.5c-1.5-7.4-1.5-20,0-27.4c6.6-33.4,34.1-57.6,67.8-59.9l4.7-0.3v11.9c0,13,0.1,13.9,2.7,16.1c1.7,1.4,3.9,1.9,6.4,1.5c1.5-0.2,4.2-2.8,21.9-20.4c17.7-17.7,20.2-20.4,20.4-21.9c0.8-4.2,1.3-3.6-20-25c-11.2-11.2-20.4-20-21.2-20.4C136.4,9.8,134.2,9.8,132.4,10.6z"
                                                />
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                            </button>

                            <button onClick={handleStop}>
                                <svg width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Timer;
