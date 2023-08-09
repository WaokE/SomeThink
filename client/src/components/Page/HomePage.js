import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./HomePage.css";

function HomePage(props) {
    const {
        isLoading,
        handleCreateSession,
        handleChangeUserName,
        myUserName,
        handleJoinSession,
        handleChangeSessionId,
        // handleSetisLoading,
    } = props;
    const [showModal, setShowModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");

    const navigate = useNavigate();

    const redirectToSessionPage = () => {
        // handleSetisLoading(true);
        openCreatePopup();
        if (showModal) {
            handleCreateSession();
            navigate("/session"); // SessionPage로 이동
        }
    };

    const redirectToSessionPage2 = () => {
        handleJoinSession((response) => {
            if (response) {
                // handleSetisLoading(true);
                navigate("/session"); // SessionPage로 이동
            }
        });
    };

    const openCreatePopup = () => {
        setShowModal(true);
    };

    const closeCreatePopup = () => {
        setShowModal(false);
    };

    return (
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
                        <form className="form-group name" onSubmit={redirectToSessionPage}>
                            <p>
                                <label> NAME </label>
                                <input
                                    className="form-control"
                                    type="text"
                                    id="userName"
                                    value={myUserName}
                                    onChange={handleChangeUserName}
                                    required
                                />
                            </p>
                        </form>
                        <div id="join-dialog-content">
                            <div className="first">
                                <p className="create">
                                    <label id="label-create"> NEW ROOM </label>
                                    <input
                                        onClick={redirectToSessionPage}
                                        className="btn btn-lg btn-success create"
                                        name="commit"
                                        type="submit"
                                        value="CREATE"
                                    />
                                </p>
                            </div>
                            <div>
                                <form
                                    className="form-group"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        redirectToSessionPage2();
                                    }}
                                >
                                    <p>
                                        <input
                                            className="form-control"
                                            type="text"
                                            id="sessionId"
                                            onChange={handleChangeSessionId}
                                            style={{ pointerEvents: "auto" }}
                                            placeholder="   # INVITE CODE"
                                        />
                                    </p>
                                    <p className="text-center">
                                        <input
                                            className="btn btn-lg btn-success"
                                            name="commit"
                                            type="submit"
                                            value="JOIN"
                                        />
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeCreatePopup}>
                            &times;
                        </span>
                        <h2>Enter KeyWord</h2>
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                        />
                        <button onClick={handleCreateSession}>Create</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;
