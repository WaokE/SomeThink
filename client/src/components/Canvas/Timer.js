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
                            className={`base-timer__path-remaining ${
                                remainingTime <= 10000 ? "red" : "yellow"
                            }`}
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
                            value={
                                remainingMinutes < 10 ? "0" + remainingMinutes : remainingMinutes
                            }
                            onChange={(e) =>
                                handleDurationChange(
                                    e.target.value * 60 * 1000 + remainingSeconds * 1000
                                )
                            }
                        />
                        <span className="timer-input-separator">:</span>
                        <input
                            className="timer-input"
                            type="number"
                            min="0"
                            max="59"
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
                                <svg width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h2c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4z" />
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
                                <svg width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h2c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4z" />
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
