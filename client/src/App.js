import React, { Component } from "react";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/Page/HomePage";
import SessionPage from "./components/Page/SessionPage";

import "./App.css";
import "./Fonts/Font.css";

const APPLICATION_SERVER_URL = "http://localhost:5050/";
// process.env.NODE_ENV === "production" ? "" : "https://somethink.online/";

class App extends Component {
    constructor(props) {
        super(props);

        // These properties are in the state's component in order to re-render the HTML whenever their values change
        this.state = {
            mySessionId: undefined,
            myUserName: "User" + Math.floor(Math.random() * 200),
            session: undefined,
            mainStreamManager: undefined,
            publisher: undefined,
            subscribers: [],
            audioEnabled: false,
            speakingUserName: [],
            isLoading: false,
        };

        this.joinSession = this.joinSession.bind(this);
        this.leaveSession = this.leaveSession.bind(this);
        this.toggleAudio = this.toggleAudio.bind(this);
        this.handleChangeSessionId = this.handleChangeSessionId.bind(this);
        this.handleChangeUserName = this.handleChangeUserName.bind(this);
        this.handleMainVideoStream = this.handleMainVideoStream.bind(this);
        this.onbeforeunload = this.onbeforeunload.bind(this);
        this.handleCreateSession = this.handleCreateSession.bind(this);
        this.handleJoinSession = this.handleJoinSession.bind(this);
    }

    // handleSetisLoading(bln) {
    //     this.setState({
    //         isLoading: bln,
    //     });
    // }

    onbeforeunload(event) {}

    componentDidMount() {
        const storedSessionId = sessionStorage.getItem("sessionId");
        const storedUserName = sessionStorage.getItem("userName");
        if (storedSessionId) {
            this.setState({ mySessionId: storedSessionId, myUserName: storedUserName }, () => {
                this.joinSession();
            });
        } else {
            // window.location.href = "/";
            // this.handleCreateSession();
        }
        window.addEventListener("beforeunload", this.onbeforeunload);
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onbeforeunload);
    }

    handleChangeSessionId(e) {
        const sessionId = e.target.value.replace(/#/g, "");
        if (sessionId.match(/^[a-zA-Z0-9]+$/)) {
            this.setState({
                mySessionId: sessionId,
            });
        }
    }

    makeid(length) {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    handleCreateSession() {
        this.setState({
            mySessionId: this.makeid(8),
        });
        this.joinSession();
    }

    handleJoinSession(callback) {
        const mySessionId = this.state.mySessionId;
        if (mySessionId === undefined || mySessionId === "") {
            alert("존재하지 않는 방입니다.");
            callback(false);
        }

        this.validateSessionId(mySessionId).then((response) => {
            if (response === true) {
                this.joinSession();
                callback(true);
            } else {
                alert("존재하지 않는 방입니다.");
                callback(false);
            }
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
                threshold: -50,
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
                    const userName = JSON.parse(event.connection.data).clientData;
                    this.handleSpeakingUser(userName);
                });

                mySession.on("publisherStopSpeaking", (event) => {
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
                            // --- 5) Get your own audio stream ---
                            let publisher = await this.OV.initPublisherAsync(undefined, {
                                audioSource: undefined,
                                videoSource: false,
                                publishAudio: false,
                                publishVideo: false,
                            });

                            // --- 6) Publish your stream ---

                            mySession.publish(publisher);

                            this.setState({
                                mainStreamManager: publisher,
                                publisher: publisher,
                            });
                            sessionStorage.setItem("sessionId", this.state.mySessionId);
                            sessionStorage.setItem("userName", this.state.myUserName);
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

        // Empty all properties...
        this.OV = null;
        this.setState({
            session: undefined,
            subscribers: [],
            mySessionId: undefined,
            myUserName: "User" + Math.floor(Math.random() * 200),
            mainStreamManager: undefined,
            publisher: undefined,
        });
        sessionStorage.removeItem("sessionId");
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
            <Router>
                <Routes>
                    <Route
                        exact
                        path="/"
                        element={
                            <HomePage
                                myUserName={myUserName}
                                handleChangeUserName={this.handleChangeUserName}
                                handleCreateSession={this.handleCreateSession}
                                handleJoinSession={this.handleJoinSession}
                                isLoading={isLoading}
                                mySessionId={mySessionId}
                                handleChangeSessionId={this.handleChangeSessionId}
                                // handleSetisLoading={this.handleSetisLoading}
                            />
                        }
                    />
                    <Route
                        exact
                        path="/session"
                        element={
                            <SessionPage
                                session={this.state.session}
                                mySessionId={mySessionId}
                                myUserName={myUserName}
                                audioEnabled={audioEnabled}
                                handleMainVideoStream={this.handleMainVideoStream}
                                subscribers={this.state.subscribers}
                                publisher={this.state.publisher}
                                leaveSession={this.leaveSession}
                                toggleAudio={this.toggleAudio}
                                speakingUserName={this.state.speakingUserName}
                                isLoading={isLoading}
                                handleSessionJoin={this.handleSessionJoin}
                            />
                        }
                    />
                </Routes>
            </Router>
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
        console.log("세션 아이디 : " + sessionId);
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

    async validateSessionId(sessionId) {
        const response = await axios.get(
            APPLICATION_SERVER_URL + "api/sessions/" + sessionId + "/validate",
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return response.data;
    }
}

// Apply CSS to prevent scrolling
document.body.style.overflow = "hidden";

export default App;
