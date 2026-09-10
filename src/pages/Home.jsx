import { useState } from "react";
import { useNavigate } from "react-router-dom";

import socket from "../socket";


function Home() {

    const [username, setUsername] =
        useState("");

    const [roomCode, setRoomCode] =
        useState("");

    const navigate =
        useNavigate();


    // ===================================
    // CREATE ROOM
    // ===================================

    const handleCreateRoom = () => {

        if (username.trim() === "") {

            alert(
                "Please enter your name"
            );

            return;
        }


        // Send username to server
        socket.emit(
            "setUsername",
            username.trim()
        );


        // Ask server to create room
        socket.emit(
            "createRoom",

            (response) => {

                console.log(
                    "Create response:",
                    response
                );


                if (response.success) {

                    navigate(
                        "/lobby",

                        {
                            state: {

                                roomCode:
                                    response.roomCode,

                                username:
                                    username.trim(),

                                players:
                                    response.players

                            }
                        }
                    );

                }

                else {

                    alert(
                        response.message
                    );

                }

            }
        );

    };


    // ===================================
    // JOIN ROOM
    // ===================================

    const handleJoinRoom = () => {

        if (username.trim() === "") {

            alert(
                "Please enter your name"
            );

            return;
        }


        if (roomCode.trim() === "") {

            alert(
                "Please enter room code"
            );

            return;
        }


        // Send username first
        socket.emit(
            "setUsername",
            username.trim()
        );


        console.log(
            "Trying to join:",
            roomCode
        );


        // Ask server to join room
        socket.emit(
            "joinRoom",

            roomCode
                .trim()
                .toUpperCase(),

            (response) => {

                console.log(
                    "Join response:",
                    response
                );


                if (response.success) {

                    navigate(
                        "/lobby",

                        {
                            state: {

                                roomCode:
                                    response.roomCode,

                                username:
                                    username.trim(),

                                players:
                                    response.players

                            }
                        }
                    );

                }

                else {

                    alert(
                        response.message
                    );

                }

            }
        );

    };


    return (

        <div>

            <h1>
                INK RUSH
            </h1>


            <h3>
                Enter your name
            </h3>


            <input

                type="text"

                placeholder="Username"

                value={username}

                onChange={(e) => {

                    setUsername(
                        e.target.value
                    );

                }}

            />


            <br />
            <br />


            <button
                onClick={
                    handleCreateRoom
                }
            >

                Create Room

            </button>


            <hr />


            <h3>
                Join existing room
            </h3>


            <input

                type="text"

                placeholder="Room Code"

                maxLength={6}

                value={roomCode}

                onChange={(e) => {

                    setRoomCode(
                        e.target.value
                            .toUpperCase()
                    );

                }}

            />


            <br />
            <br />


            <button
                onClick={
                    handleJoinRoom
                }
            >

                Join Room

            </button>

        </div>

    );

}


export default Home;