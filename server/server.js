import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
});


// All active rooms will be stored here
const rooms = {};


// Generates a random 6-character room code
function generateRoomCode() {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for (let i = 0; i < 6; i++) {

        const randomIndex =
            Math.floor(
                Math.random() * characters.length
            );

        code += characters[randomIndex];
    }

    return code;
}


// Simple test route
app.get("/", (req, res) => {

    res.send("Ink Rush server is running");

});


// Runs whenever a new player connects
io.on("connection", (socket) => {

    console.log(
        "Player connected:",
        socket.id
    );


    // ===================================
    // SET USERNAME
    // ===================================

    socket.on("setUsername", (username) => {

        socket.data.username =
            username.trim();

        console.log(
            "Username received:",
            socket.data.username
        );

    });


    // ===================================
    // CREATE ROOM
    // ===================================

    socket.on("createRoom", (callback) => {

        // Player must have a username
        if (!socket.data.username) {

            callback({
                success: false,
                message: "Username not set"
            });

            return;
        }


        // Generate room code
        let roomCode =
            generateRoomCode();


        // Make sure room code is unique
        while (rooms[roomCode]) {

            roomCode =
                generateRoomCode();

        }


        // Create room
        rooms[roomCode] = {

            hostId: socket.id,

            players: [
                {
                    id: socket.id,
                    username:
                        socket.data.username,
                    isHost: true
                }
            ]

        };


        // Add creator to Socket.IO room
        socket.join(roomCode);


        // Store room code on this socket
        socket.data.roomCode =
            roomCode;


        console.log(
            "Room created:",
            roomCode
        );

        console.log(
            "Players:",
            rooms[roomCode].players
        );


        // Send room details back to creator
        callback({

            success: true,

            roomCode: roomCode,

            players:
                rooms[roomCode].players

        });

    });


    // ===================================
    // JOIN ROOM
    // ===================================

    socket.on(
        "joinRoom",

        (roomCode, callback) => {

            console.log(
                "joinRoom event received:",
                roomCode
            );


            roomCode =
                roomCode
                    .trim()
                    .toUpperCase();


            // Check username
            if (!socket.data.username) {

                callback({
                    success: false,
                    message:
                        "Username not set"
                });

                return;
            }


            // Check room exists
            if (!rooms[roomCode]) {

                callback({
                    success: false,
                    message:
                        "Room does not exist"
                });

                return;
            }


            // Add player to our room array
            rooms[roomCode].players.push({

                id: socket.id,

                username:
                    socket.data.username,

                isHost: false

            });


            // Add socket to actual Socket.IO room
            socket.join(roomCode);


            // Remember which room this socket belongs to
            socket.data.roomCode =
                roomCode;


            console.log(
                socket.data.username,
                "joined room",
                roomCode
            );

            console.log(
                "Players:",
                rooms[roomCode].players
            );


            // Tell EVERY player in this room
            // about the new player list
            io.to(roomCode).emit(
                "playersUpdated",
                rooms[roomCode].players
            );


            // Tell joining player that join succeeded
            callback({

                success: true,

                roomCode: roomCode,

                players:
                    rooms[roomCode].players

            });

        }
    );


    // ===================================
    // DISCONNECT
    // ===================================

    socket.on("disconnect", () => {

        console.log(
            "Player disconnected:",
            socket.id
        );


        const roomCode =
            socket.data.roomCode;


        // Player wasn't inside any room
        if (!roomCode) {
            return;
        }


        // Room no longer exists
        if (!rooms[roomCode]) {
            return;
        }


        // Remove disconnected player
        rooms[roomCode].players =
            rooms[roomCode].players.filter(
                (player) =>
                    player.id !== socket.id
            );


        // If room becomes empty,
        // delete the whole room
        if (
            rooms[roomCode].players.length === 0
        ) {

            delete rooms[roomCode];

            console.log(
                "Room deleted:",
                roomCode
            );

            return;
        }


        // If host disconnected,
        // first remaining player becomes host
        if (
            rooms[roomCode].hostId ===
            socket.id
        ) {

            const newHost =
                rooms[roomCode].players[0];

            rooms[roomCode].hostId =
                newHost.id;

            newHost.isHost = true;

        }


        // Update remaining players
        io.to(roomCode).emit(
            "playersUpdated",
            rooms[roomCode].players
        );

    });

});


// Start backend server
server.listen(3001, () => {

    console.log(
        "Server running on port 3001"
    );

});