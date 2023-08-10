// SessionPage.js
import React from "react";
import UserVideoComponent from "../Audio/UserVideoComponent";
import LoadingBox from "../LoadingScreen/LoadingBox";
import MindMap from "../Canvas/MindMap";

function SessionPage(props) {
    const {
        mySessionId,
        myUserName,
        audioEnabled,
        subscribers,
        publisher,
        leaveSession,
        toggleAudio,
        speakingUserName,
        isLoading,
        handleSessionJoin,
    } = props;

    return (
        <div>
            <div id="session-header">
                <MindMap
                    sessionId={mySessionId}
                    leaveSession={leaveSession}
                    toggleAudio={toggleAudio}
                    audioEnabled={audioEnabled}
                    userName={myUserName}
                    onSessionJoin={handleSessionJoin}
                    speakingUserName={speakingUserName}
                    isLoading={isLoading}
                />
            </div>
            <div id="video-container">
                {publisher !== undefined && (
                    <div>
                        <UserVideoComponent streamManager={publisher} />
                    </div>
                )}
                {subscribers.map((sub, i) => (
                    <div key={i}>
                        <UserVideoComponent streamManager={sub} />
                    </div>
                ))}
            </div>
            {isLoading && <LoadingBox roomNumb={mySessionId} />}
        </div>
    );
}

export default SessionPage;
