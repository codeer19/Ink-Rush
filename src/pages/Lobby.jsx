import {
    useEffect,
    useState
} from "react";

import {
    useLocation
} from "react-router-dom";

import socket from "../socket";


function Lobby() {

    const location =
        useLocation();


    const roomCode =
        location.state?.roomCode;


    const [players, setPlayers] =
        useState(
            location.state?.players || []
        );


    useEffect(() => {

        // Function called whenever
        // server sends updated player list
        const handlePlayersUpdated =
            (updatedPlayers) => {

                console.log(
                    "Players updated:",
                    updatedPlayers
                );

                setPlayers(
                    updatedPlayers
                );

            };


        // Listen for player updates
        socket.on(
            "playersUpdated",
            handlePlayersUpdated
        );


        // Cleanup listener when
        // leaving Lobby page
        return () => {

            socket.off(
                "playersUpdated",
                handlePlayersUpdated
            );

        };

    }, []);


    return (

        <div>

            <h1>
                INK RUSH LOBBY
            </h1>


            <h2>
                Room Code: {roomCode}
            </h2>


            <h3>
                Players
            </h3>


            {players.map(
                (player) => (

                    <p
                        key={player.id}
                    >

                        {player.username}

                        {player.isHost
                            ? " - HOST"
                            : ""
                        }

                    </p>

                )
            )}


            <button>

                Start Game

            </button>

        </div>

    );

}


export default Lobby;