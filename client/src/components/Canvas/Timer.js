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
            // "wss://somethink.online/timer",
            "ws://localhost:2345",
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
        return () => {
            provider.disconnect();
        };
    }, []);

    useEffect(() => {
        let timer;
        if (isTimerRunning) {
            timer = setInterval(() => {
                const remaining = calculateRemainingTime();
                setRemainingTime(remaining);
                if (remaining <= 0) {
                    setIsTimerRunning(false);
                    ymapRef.current.set("TimerRunning", false);
                    alert("Time OVER!");
                }
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

    const remainingMinutes = Math.floor(remainingTime / (60 * 1000)) || 0;
    const remainingSeconds = Math.ceil((remainingTime / 1000) % 60) || 0;

    return (
        <div className={`timer ${isTimerRunning && remainingTime <= 10000 ? "red" : ""}`}>
            <div className="timer-controls">
                {!isTimerRunning && (
                    <div>
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
                        <span> : </span>
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
                    </div>
                )}
                {isTimerRunning && (
                    <div>
                        <div className="timer--clock">
                            <div className="minutes-group clock-display-grp">
                                {/* <span> */}
                                {remainingSeconds === 60 ? 1 + remainingMinutes : remainingMinutes}
                                {/* </span> */}
                            </div>
                            {/* <span> : </span> */}
                            <div className="clock-separator">
                                <p>:</p>
                            </div>
                            <div className="seconds-group clock-display-grp">
                                {/* <span> */}
                                {remainingSeconds === 60
                                    ? "00"
                                    : remainingSeconds < 10
                                    ? "0" + remainingSeconds
                                    : remainingSeconds}
                                {/* </span> */}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="buttons">
                <button onClick={handleReset} style={{ marginRight: "10px" }}>
                    초기화
                </button>
                {!isTimerRunning && <button onClick={handleStart}>시작</button>}
                {isTimerRunning && <button onClick={handleStop}>멈춤</button>}
            </div>
        </div>
    );
};

export default Timer;
