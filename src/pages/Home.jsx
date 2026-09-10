import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

import "./Home.css";

function Home() {

    const [username, setUsername] = useState("");
    const [nameConfirmed, setNameConfirmed] = useState(false);
    const [roomCode, setRoomCode] = useState("");

    const navigate = useNavigate();


    const handleContinue = () => {

        if (username.trim() === "") {
            return;
        }

        socket.emit(
            "setUsername",
            username.trim()
        );

        setNameConfirmed(true);
    };


    const handleCreateRoom = () => {

        socket.emit(
            "createRoom",
            (response) => {

                if (!response.success) {
                    alert(response.message);
                    return;
                }

                navigate(
                    "/lobby",
                    {
                        state: {
                            roomCode: response.roomCode,
                            players: response.players
                        }
                    }
                );
            }
        );
    };


    const handleJoinRoom = () => {

        if (roomCode.trim() === "") {
            return;
        }

        socket.emit(
            "joinRoom",

            roomCode.trim().toUpperCase(),

            (response) => {

                if (!response.success) {
                    alert(response.message);
                    return;
                }

                navigate(
                    "/lobby",
                    {
                        state: {
                            roomCode: response.roomCode,
                            players: response.players
                        }
                    }
                );
            }
        );
    };


    return (

        <main className="home">

            <section className="home-content">

                <h1>
                    INK<span>rush</span>
                </h1>


                {!nameConfirmed ? (

                    <>
                        <p className="subtitle">
                            Pick a name to start playing.
                        </p>

                        <input
                            type="text"
                            placeholder="Your name"
                            value={username}
                            maxLength={16}
                            autoFocus

                            onChange={(e) =>
                                setUsername(e.target.value)
                            }

                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleContinue();
                                }
                            }}
                        />

                        <button
                            className="main-button"
                            onClick={handleContinue}
                        >
                            Continue
                        </button>
                    </>

                ) : (

                    <>

                        <div className="player-name">

                            <span>
                                Playing as
                            </span>

                            <strong>
                                {username}
                            </strong>

                            <button
                                onClick={() =>
                                    setNameConfirmed(false)
                                }
                            >
                                change
                            </button>

                        </div>


                        <button
                            className="main-button"
                            onClick={handleCreateRoom}
                        >
                            Create room
                        </button>


                        <div className="divider">
                            <span></span>
                            <p>or</p>
                            <span></span>
                        </div>


                        <div className="join-room">

                            <input
                                type="text"
                                placeholder="Room code"
                                value={roomCode}
                                maxLength={6}

                                onChange={(e) =>
                                    setRoomCode(
                                        e.target.value.toUpperCase()
                                    )
                                }

                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleJoinRoom();
                                    }
                                }}
                            />

                            <button
                                onClick={handleJoinRoom}
                            >
                                Join
                            </button>

                        </div>

                    </>

                )}

            </section>

        </main>
    );
}

export default Home;