// SessionPage.js
import React from "react";
import UserVideoComponent from "../Audio/UserVideoComponent";
import LoadingBox from "../LoadingScreen/LoadingBox";
import MindMap from "../Canvas/MindMap";

function SessionPage(props) {
    const {
        session,
        mySessionId,
        myUserName,
        audioEnabled,
        handleMainVideoStream,
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
                {/* SessionPage에서 사용할 UI 컴포넌트 (예: MindMap 컴포넌트 등) */}
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
            {/* 세션 페이지 내용 및 로직 작성 */}
        </div>
    );
}

export default SessionPage;
