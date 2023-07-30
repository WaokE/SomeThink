import { useState, useEffect, useRef } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import "./Timer.css";

const Timer = ({ sessionId, isTimerRunning, setIsTimerRunning }) => {
    const ydocRef = useRef(null);
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
        ydocRef.current = new Y.Doc();
        const provider = new WebsocketProvider(
            "wss://somethink.online/timer",
            sessionId,
            ydocRef.current
        );

        ymapRef.current = ydocRef.current.getMap("MindMap");

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

    const remainingMinutes = Math.ceil(remainingTime / (60 * 1000)) || 0;
    const remainingSeconds = Math.ceil((remainingTime / 1000) % 60) || 0;

    return (
        <div className={`timer ${isTimerRunning && remainingTime <= 10000 ? "red" : ""}`}>
            {!isTimerRunning && (
                <div>
                    <input
                        className="timer-input"
                        type="number"
                        min="0"
                        max="59"
                        value={remainingMinutes}
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
                        value={remainingSeconds}
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
