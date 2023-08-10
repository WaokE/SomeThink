import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Slide } from "@mui/material";
import "./HomePage.css";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

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
    const [rootWord, setRootWord] = useState("");

    const navigate = useNavigate();

    const redirectToSessionPage = () => {
        if (!rootWord) {
            alert("Please enter a keyword."); // 또는 원하는 경고 메시지를 표시
            return;
        }

        openCreatePopup();
        if (showModal) {
            handleCreateSession();
            navigate("/session", { state: { keyword: rootWord } });
        }
    };

    const redirectToSessionPage2 = () => {
        handleJoinSession((response) => {
            if (response) {
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
                                        onClick={openCreatePopup}
                                        className="btn btn-lg btn-success create"
                                        name="commit"
                                        type="button"
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
                <Dialog
                    open={showModal}
                    onClose={closeCreatePopup}
                    TransitionComponent={Transition}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                    BackdropProps={{
                        onClick: (event) => {
                            event.stopPropagation(); // 이벤트 전파 중지
                        },
                    }}
                >
                    <DialogTitle id="modal-title">새로운 주제를 생성하세요</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="keyword"
                            variant="outlined"
                            value={rootWord}
                            onChange={(e) => setRootWord(e.target.value)}
                            size="small"
                            margin="dense"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    redirectToSessionPage();
                                }
                            }}
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "16px",
                            }}
                        >
                            <Button onClick={redirectToSessionPage} variant="outlined">
                                start
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default HomePage;
