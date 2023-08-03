import React, { Component, useState } from "react";
import MindMap from "./components/Canvas/MindMap";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import UserVideoComponent from "./components/Audio/UserVideoComponent";

import LoadingBox from "./components/LoadingScreen/LoadingBox";

import "./App.css";
import "./Fonts/Font.css";

const APPLICATION_SERVER_URL =
    process.env.NODE_ENV === "production" ? "" : "https://somethink.online/";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
        };

        // These properties are in the state's component in order to re-render the HTML whenever their values change
        this.state = {
            mySessionId: "RoomA",
            myUserName: "User" + Math.floor(Math.random() * 200),
            session: undefined,
            mainStreamManager: undefined,
            publisher: undefined,
            subscribers: [],
            audioEnabled: false,
            speakingUserName: [],
        };

        this.joinSession = this.joinSession.bind(this);
        this.leaveSession = this.leaveSession.bind(this);
        this.toggleAudio = this.toggleAudio.bind(this);
        this.handleChangeSessionId = this.handleChangeSessionId.bind(this);
        this.handleChangeUserName = this.handleChangeUserName.bind(this);
        this.handleMainVideoStream = this.handleMainVideoStream.bind(this);
        this.onbeforeunload = this.onbeforeunload.bind(this);
    }

    componentDidMount() {
        window.addEventListener("beforeunload", this.onbeforeunload);
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onbeforeunload);
    }

    onbeforeunload(event) {
        this.leaveSession();
    }

    handleChangeSessionId(e) {
        this.setState({
            mySessionId: e.target.value,
        });
    }

    handleChangeUserName(e) {
        this.setState({
            myUserName: e.target.value,
        });
    }

    handleMainVideoStream(stream) {
        if (this.state.mainStreamManager !== stream) {
            this.setState({
                mainStreamManager: stream,
            });
        }
    }

    deleteSubscriber(streamManager) {
        let subscribers = this.state.subscribers;
        let index = subscribers.indexOf(streamManager, 0);
        if (index > -1) {
            subscribers.splice(index, 1);
            this.setState({
                subscribers: subscribers,
            });
        }
    }

    handleSessionJoin() {
        this.setState({
            sessionJoined: true,
        });

        this.setState({
            isLoading: false,
        });
    }

    handleSpeakingUser(userName) {
        const speakingUserName = this.state.speakingUserName;
        speakingUserName.push(userName);
        this.setState({
            speakingUserName: speakingUserName,
        });
    }

    handleDeleteSpeakingUser(userName) {
        const speakingUserName = this.state.speakingUserName;
        const index = speakingUserName.indexOf(userName);
        if (index > -1) {
            speakingUserName.splice(index, 1);
            this.setState({
                speakingUserName: speakingUserName,
            });
        }
    }

    joinSession() {
        // --- 1) Get an OpenVidu object ---

        this.OV = new OpenVidu();

        this.OV.setAdvancedConfiguration({
            publisherSpeakingEventsOptions: {
                interval: 20,
                threshold: -25,
            },
        });

        // --- 2) Init a session ---
        document.body.style.backgroundColor = "white";
        this.setState(
            {
                session: this.OV.initSession(),
            },
            () => {
                var mySession = this.state.session;

                // --- 3) Specify the actions when events take place in the session ---

                // On every new Stream received...
                mySession.on("streamCreated", (event) => {
                    // Subscribe to the Stream to receive it. Second parameter is undefined
                    // so OpenVidu doesn't create an HTML video by its own
                    var subscriber = mySession.subscribe(event.stream, undefined);
                    var subscribers = this.state.subscribers;
                    subscribers.push(subscriber);

                    // Update the state with the new subscribers
                    this.setState({
                        subscribers: subscribers,
                    });
                });

                // On every Stream destroyed...
                mySession.on("streamDestroyed", (event) => {
                    // Remove the stream from 'subscribers' array
                    this.deleteSubscriber(event.stream.streamManager);
                });

                // On every asynchronous exception...
                mySession.on("exception", (exception) => {
                    console.warn(exception);
                });

                mySession.on("publisherStartSpeaking", (event) => {
                    // console.log(event.connection.connectionId + " start speaking");
                    const userName = JSON.parse(event.connection.data).clientData;
                    this.handleSpeakingUser(userName);
                });

                mySession.on("publisherStopSpeaking", (event) => {
                    // console.log(event.connection.connectionId + " stop speaking");
                    const userName = JSON.parse(event.connection.data).clientData;
                    this.handleDeleteSpeakingUser(userName);
                });

                // --- 4) Connect to the session with a valid user token ---

                // Get a token from the OpenVidu deployment
                this.getToken().then((token) => {
                    // First param is the token got from the OpenVidu deployment. Second param can be retrieved by every user on event
                    // 'streamCreated' (property Stream.connection.data), and will be appended to DOM as the user's nickname
                    mySession
                        .connect(token, { clientData: this.state.myUserName })
                        .then(async () => {
                            // --- 5) Get your own camera stream ---

                            // Init a publisher passing undefined as targetElement (we don't want OpenVidu to insert a video
                            // element: we will manage it on our own) and with the desired properties
                            let publisher = await this.OV.initPublisherAsync(undefined, {
                                audioSource: undefined, // The source of audio. If undefined default microphone
                                videoSource: false, // The source of video. If undefined default webcam
                                publishAudio: false, // Whether you want to start publishing with your audio unmuted or not
                                publishVideo: false, // Whether you want to start publishing with your video enabled or not
                            });

                            // --- 6) Publish your stream ---

                            mySession.publish(publisher);

                            // Set the main video in the page to display our webcam and store our Publisher
                            this.setState({
                                mainStreamManager: publisher,
                                publisher: publisher,
                            });
                            this.handleSessionJoin();
                        })
                        .catch((error) => {
                            console.log(
                                "There was an error connecting to the session:",
                                error.code,
                                error.message
                            );
                        });
                });
            }
        );
    }

    leaveSession() {
        // --- 7) Leave the session by calling 'disconnect' method over the Session object ---

        const mySession = this.state.session;
        document.body.style.backgroundColor = "#fbd85d";
        if (mySession) {
            mySession.disconnect();
        }

        const { myUserName, mySessionId } = this.state;
        axios
            .post(APPLICATION_SERVER_URL + "api/leavesession", {
                userName: myUserName,
                sessionId: mySessionId,
            })
            .then(() => {
                console.log("User left the session on the server.");
            })
            .catch((error) => {
                console.error("Error leaving the session on the server:", error);
            });

        window.location.reload();

        // Empty all properties...
        this.OV = null;
        this.setState({
            session: undefined,
            subscribers: [],
            mySessionId: "RoomA",
            myUserName: "User" + Math.floor(Math.random() * 200),
            mainStreamManager: undefined,
            publisher: undefined,
        });
    }

    toggleAudio() {
        const { publisher, audioEnabled } = this.state;

        if (publisher) {
            publisher.publishAudio(!audioEnabled);

            this.setState({
                audioEnabled: !audioEnabled,
            });
        }
    }

    render() {
        const { isLoading } = this.state;
        const mySessionId = this.state.mySessionId;
        const myUserName = this.state.myUserName;
        const audioEnabled = this.state.audioEnabled;
        return (
            <div className="container">
                {this.state.session === undefined ? (
                    <div id="join">
                        <div className="big-circles" style={{ pointerEvents: "none" }}>
                            <div className="big-circle"></div>
                            <div className="big-circle"></div>
                            <div className="big-circle"></div>
                        </div>
                        <section id="home">
                            <div className="slide-wrapper">
                                <div className="smallcircles" style={{ pointerEvents: "none" }}>
                                    <div className="small-circle"></div>
                                    <div className="small-circle"></div>
                                    <div className="small-circle"></div>
                                    <div className="small-circle"></div>
                                    <div className="small-circle"></div>
                                    <div className="small-circle"></div>
                                </div>
                                <div id="join-dialog" className="jumbotron vertical-center">
                                    <h1 className="logo"></h1>
                                    <form className="form-group" onSubmit={this.joinSession}>
                                        <p>
                                            <label>Name </label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                id="userName"
                                                value={myUserName}
                                                onChange={this.handleChangeUserName}
                                                required
                                            />
                                        </p>
                                        <p>
                                            <label> Room </label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                id="sessionId"
                                                value={mySessionId}
                                                onChange={this.handleChangeSessionId}
                                                style={{ pointerEvents: "auto" }}
                                                pattern="[0-9A-Za-z]+"
                                                title="영어나 숫자만 입력해주세요"
                                                required
                                            />
                                        </p>
                                        <p className="text-center">
                                            <input
                                                onClick={() => {
                                                    this.setState(
                                                        {
                                                            isLoading: true,
                                                        },
                                                        () => {
                                                            this.forceUpdate();
                                                        }
                                                    );
                                                }}
                                                className="btn btn-lg btn-success"
                                                name="commit"
                                                type="submit"
                                                value="JOIN"
                                            />
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </section>
                    </div>
                ) : null}

                {this.state.session !== undefined ? (
                    <div id="session">
                        <div id="session-header">
                            <MindMap
                                sessionId={mySessionId}
                                leaveSession={this.leaveSession}
                                toggleAudio={this.toggleAudio}
                                audioEnabled={audioEnabled}
                                userName={myUserName}
                                onSessionJoin={this.handleSessionJoin}
                                speakingUserName={this.state.speakingUserName}
                                isLoading={isLoading}
                            />
                        </div>

                        <div id="video-container">
                            {this.state.publisher !== undefined ? (
                                <div>
                                    <UserVideoComponent streamManager={this.state.publisher} />
                                </div>
                            ) : null}
                            {this.state.subscribers.map((sub, i) => (
                                <div>
                                    <UserVideoComponent streamManager={sub} />
                                </div>
                            ))}
                        </div>
                        {isLoading && <LoadingBox roomNumb={mySessionId} />}
                    </div>
                ) : null}
            </div>
        );
    }

    /**
     * --------------------------------------------
     * GETTING A TOKEN FROM YOUR APPLICATION SERVER
     * --------------------------------------------
     * The methods below request the creation of a Session and a Token to
     * your application server. This keeps your OpenVidu deployment secure.
     *
     * In this sample code, there is no user control at all. Anybody could
     * access your application server endpoints! In a real production
     * environment, your application server must identify the user to allow
     * access to the endpoints.
     *
     * Visit https://docs.openvidu.io/en/stable/application-server to learn
     * more about the integration of OpenVidu in your application server.
     */
    async getToken() {
        const sessionId = await this.createSession(this.state.mySessionId);
        return await this.createToken(sessionId);
    }

    async createSession(sessionId) {
        const response = await axios.post(
            APPLICATION_SERVER_URL + "api/sessions",
            { customSessionId: sessionId },
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return response.data; // The sessionId
    }

    async createToken(sessionId) {
        const response = await axios.post(
            APPLICATION_SERVER_URL + "api/sessions/" + sessionId + "/connections",
            {},
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return response.data; // The token
    }
}

// Apply CSS to prevent scrolling
document.body.style.overflow = "hidden";

export default App;
