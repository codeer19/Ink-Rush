import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import socket from "../socket";

import "./Game.css";


const COLORS = [
    "#111111",
    "#e53935",
    "#f57c00",
    "#fbc02d",
    "#43a047",
    "#00a8a8",
    "#1976d2",
    "#6c4cff",
    "#d63384"
];


function Game() {

    const location =
        useLocation();

    const navigate =
        useNavigate();


    const roomCode =
        location.state?.roomCode;


    const [players, setPlayers] =
        useState(
            location.state
                ?.players || []
        );


    const [round, setRound] =
        useState(1);


    const [
        drawerId,
        setDrawerId
    ] = useState(null);


    const [
        drawerUsername,
        setDrawerUsername
    ] = useState("");


    const [
        wordChoices,
        setWordChoices
    ] = useState([]);


    const [
        selectedWord,
        setSelectedWord
    ] = useState("");


    const [
        wordHint,
        setWordHint
    ] = useState("");


    const [
        turnStatus,
        setTurnStatus
    ] = useState(
        "waiting"
    );


    const [
        timeLeft,
        setTimeLeft
    ] = useState(60);


    const [
        guess,
        setGuess
    ] = useState("");


    const [
        messages,
        setMessages
    ] = useState([]);


    const [
        selectedColor,
        setSelectedColor
    ] = useState(
        "#111111"
    );


    const [
        eraser,
        setEraser
    ] = useState(false);


    const [
        hasGuessed,
        setHasGuessed
    ] = useState(false);


    const canvasRef =
        useRef(null);


    const drawingRef =
        useRef(false);


    const lastPointRef =
        useRef({
            x: 0,
            y: 0
        });


    const chatBottomRef =
        useRef(null);


    const amIDrawer =
        socket.id ===
        drawerId;


    // ==================================================
    // CANVAS
    // ==================================================

    const clearCanvas = () => {

        const canvas =
            canvasRef.current;


        if (!canvas) {
            return;
        }


        const ctx =
            canvas.getContext(
                "2d"
            );


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    };


    const drawLine = (
        x1,
        y1,
        x2,
        y2,
        color,
        width
    ) => {

        const canvas =
            canvasRef.current;


        if (!canvas) {
            return;
        }


        const ctx =
            canvas.getContext(
                "2d"
            );


        ctx.beginPath();

        ctx.moveTo(
            x1,
            y1
        );

        ctx.lineTo(
            x2,
            y2
        );

        ctx.strokeStyle =
            color;

        ctx.lineWidth =
            width;

        ctx.lineCap =
            "round";

        ctx.lineJoin =
            "round";

        ctx.stroke();
    };


    const getPosition =
        (event) => {

            const canvas =
                canvasRef.current;


            const rect =
                canvas
                    .getBoundingClientRect();


            return {

                x:
                    (
                        event.clientX -
                        rect.left
                    ) *
                    (
                        canvas.width /
                        rect.width
                    ),

                y:
                    (
                        event.clientY -
                        rect.top
                    ) *
                    (
                        canvas.height /
                        rect.height
                    )

            };
        };


    const startDrawing =
        (event) => {

            if (
                !amIDrawer ||
                turnStatus !==
                    "drawing"
            ) {
                return;
            }


            drawingRef.current =
                true;


            lastPointRef.current =
                getPosition(
                    event
                );
        };


    const draw =
        (event) => {

            if (
                !drawingRef.current ||
                !amIDrawer ||
                turnStatus !==
                    "drawing"
            ) {
                return;
            }


            const newPoint =
                getPosition(
                    event
                );


            const oldPoint =
                lastPointRef.current;


            const color =
                eraser
                    ? "#ffffff"
                    : selectedColor;


            const width =
                eraser
                    ? 28
                    : 5;


            drawLine(
                oldPoint.x,
                oldPoint.y,
                newPoint.x,
                newPoint.y,
                color,
                width
            );


            socket.emit(
                "draw",
                {

                    x1:
                        oldPoint.x,

                    y1:
                        oldPoint.y,

                    x2:
                        newPoint.x,

                    y2:
                        newPoint.y,

                    color,

                    width

                }
            );


            lastPointRef.current =
                newPoint;
        };


    const stopDrawing = () => {

        drawingRef.current =
            false;
    };


    // ==================================================
    // WORD
    // ==================================================

    const chooseWord =
        (word) => {

            socket.emit(
                "chooseWord",
                word
            );


            setWordChoices([]);
        };


    // ==================================================
    // GUESS
    // ==================================================

    const sendGuess = () => {

        if (
            guess.trim() === "" ||
            hasGuessed
        ) {
            return;
        }


        socket.emit(
            "sendGuess",
            guess
        );


        setGuess("");
    };


    // ==================================================
    // SOCKET EVENTS
    // ==================================================

    useEffect(() => {

        const onPlayers =
            (data) =>
                setPlayers(data);


        const onScores =
            (data) =>
                setPlayers(data);


        const onPreparing =
            (data) => {

                setRound(
                    data.round
                );

                setDrawerId(
                    data.drawerId
                );

                setDrawerUsername(
                    data.drawerUsername
                );

                setPlayers(
                    data.players
                );

                setSelectedWord("");

                setWordHint("");

                setWordChoices([]);

                setMessages([]);

                setHasGuessed(
                    false
                );

                setTimeLeft(60);

                setTurnStatus(
                    "choosing"
                );

                setEraser(false);
            };


        const onChoices =
            (choices) => {

                setWordChoices(
                    choices
                );
            };


        const onWordSelected =
            (data) => {

                setSelectedWord(
                    data.word
                );
            };


        const onStarted =
            (data) => {

                setRound(
                    data.round
                );

                setDrawerId(
                    data.drawerId
                );

                setDrawerUsername(
                    data.drawerUsername
                );

                setWordHint(
                    data.hint
                );

                setTimeLeft(
                    data.duration
                );

                setTurnStatus(
                    "drawing"
                );
            };


        const onHint =
            (hint) => {

                setWordHint(
                    hint
                );
            };


        const onTimer =
            (time) => {

                setTimeLeft(
                    time
                );
            };


        const onDraw =
            (data) => {

                drawLine(
                    data.x1,
                    data.y1,
                    data.x2,
                    data.y2,
                    data.color,
                    data.width
                );
            };


        const onClear =
            () => {

                clearCanvas();
            };


        const onMessage =
            (message) => {

                setMessages(
                    (old) => [
                        ...old,
                        message
                    ]
                );
            };


        const onCorrect =
            () => {

                setHasGuessed(
                    true
                );
            };


        const onEnded =
            (data) => {

                setTurnStatus(
                    "ended"
                );


                if (data.word) {

                    setMessages(
                        (old) => [
                            ...old,
                            {
                                system:
                                    true,

                                text:
                                    `The word was "${data.word}"`
                            }
                        ]
                    );
                }
            };


        const onGameOver =
            (data) => {

                navigate(
                    "/results",
                    {
                        state: {
                            roomCode:
                                data.roomCode,

                            players:
                                data.players
                        }
                    }
                );
            };


        socket.on(
            "playersUpdated",
            onPlayers
        );

        socket.on(
            "scoresUpdated",
            onScores
        );

        socket.on(
            "turnPreparing",
            onPreparing
        );

        socket.on(
            "wordChoices",
            onChoices
        );

        socket.on(
            "wordSelected",
            onWordSelected
        );

        socket.on(
            "turnStarted",
            onStarted
        );

        socket.on(
            "wordHint",
            onHint
        );

        socket.on(
            "timerUpdate",
            onTimer
        );

        socket.on(
            "draw",
            onDraw
        );

        socket.on(
            "clearCanvas",
            onClear
        );

        socket.on(
            "chatMessage",
            onMessage
        );

        socket.on(
            "youGuessedCorrectly",
            onCorrect
        );

        socket.on(
            "turnEnded",
            onEnded
        );

        socket.on(
            "gameOver",
            onGameOver
        );


        socket.emit(
            "gameReady"
        );


        return () => {

            socket.off(
                "playersUpdated",
                onPlayers
            );

            socket.off(
                "scoresUpdated",
                onScores
            );

            socket.off(
                "turnPreparing",
                onPreparing
            );

            socket.off(
                "wordChoices",
                onChoices
            );

            socket.off(
                "wordSelected",
                onWordSelected
            );

            socket.off(
                "turnStarted",
                onStarted
            );

            socket.off(
                "wordHint",
                onHint
            );

            socket.off(
                "timerUpdate",
                onTimer
            );

            socket.off(
                "draw",
                onDraw
            );

            socket.off(
                "clearCanvas",
                onClear
            );

            socket.off(
                "chatMessage",
                onMessage
            );

            socket.off(
                "youGuessedCorrectly",
                onCorrect
            );

            socket.off(
                "turnEnded",
                onEnded
            );

            socket.off(
                "gameOver",
                onGameOver
            );
        };

    }, [navigate]);


    useEffect(() => {

        chatBottomRef.current
            ?.scrollIntoView();

    }, [messages]);


    if (!roomCode) {

        return (

            <main className="game-invalid">

                <h2>
                    No active game.
                </h2>

                <button
                    onClick={() =>
                        navigate("/")
                    }
                >
                    Back home
                </button>

            </main>
        );
    }


    const displayHint =
        wordHint
            .split("")
            .map(
                (char) =>
                    char === " "
                        ? "   "
                        : char
            )
            .join(" ");


    return (

        <main className="game-page">

            {/* ====================================
                MATCH INFORMATION
            ==================================== */}

            <header className="game-header">

                <div>

                    <span>
                        Round
                    </span>

                    <strong>
                        {round} / 3
                    </strong>

                </div>


                <div>

                    <span>
                        Time
                    </span>

                    <strong
                        className={
                            timeLeft <= 10
                                ? "time-low"
                                : ""
                        }
                    >
                        {timeLeft}s
                    </strong>

                </div>


                <div>

                    <span>
                        Room
                    </span>

                    <strong>
                        {roomCode}
                    </strong>

                </div>

            </header>


            <section className="game-layout">


                {/* ====================================
                    PLAYERS
                ==================================== */}

                <aside className="players-panel">

                    <h2>
                        Players
                    </h2>


                    <div>

                        {players.map(
                            (
                                player,
                                index
                            ) => (

                                <div
                                    className={
                                        player.id ===
                                        drawerId
                                            ? "game-player active"
                                            : "game-player"
                                    }

                                    key={
                                        player.id
                                    }
                                >

                                    <span className="player-index">
                                        {index + 1}
                                    </span>


                                    <div>

                                        <strong>
                                            {
                                                player.username
                                            }
                                        </strong>

                                        <small>

                                            {
                                                player.id ===
                                                drawerId
                                                    ? "drawing"
                                                    : "guessing"
                                            }

                                        </small>

                                    </div>


                                    <b>
                                        {
                                            player.score
                                        }
                                    </b>

                                </div>

                            )
                        )}

                    </div>

                </aside>


                {/* ====================================
                    DRAWING BOARD
                ==================================== */}

                <section className="board-column">

                    <div className="turn-info">

                        {
                            turnStatus ===
                            "choosing" &&
                            amIDrawer && (

                                <>

                                    <p>
                                        Choose a word
                                    </p>


                                    <div className="word-choice-list">

                                        {
                                            wordChoices.map(
                                                (word) => (

                                                    <button
                                                        key={
                                                            word
                                                        }

                                                        onClick={() =>
                                                            chooseWord(
                                                                word
                                                            )
                                                        }
                                                    >

                                                        {word}

                                                    </button>

                                                )
                                            )
                                        }

                                    </div>

                                </>

                            )
                        }


                        {
                            turnStatus ===
                            "choosing" &&
                            !amIDrawer && (

                                <p>

                                    {
                                        drawerUsername
                                    }

                                    {" "}
                                    is choosing a word...

                                </p>

                            )
                        }


                        {
                            turnStatus ===
                            "drawing" &&
                            amIDrawer && (

                                <p>

                                    Draw:
                                    {" "}

                                    <strong className="actual-word">

                                        {
                                            selectedWord
                                        }

                                    </strong>

                                </p>

                            )
                        }


                        {
                            turnStatus ===
                            "drawing" &&
                            !amIDrawer && (

                                <p className="word-hint">

                                    {
                                        displayHint
                                    }

                                </p>

                            )
                        }


                        {
                            turnStatus ===
                            "ended" && (

                                <p>
                                    Next turn...
                                </p>

                            )
                        }

                    </div>


                    <div className="canvas-wrap">

                        <canvas
                            ref={
                                canvasRef
                            }

                            width={1000}

                            height={600}

                            onMouseDown={
                                startDrawing
                            }

                            onMouseMove={
                                draw
                            }

                            onMouseUp={
                                stopDrawing
                            }

                            onMouseLeave={
                                stopDrawing
                            }
                        />

                    </div>


                    {/* DRAWING TOOLS */}

                    {
                        amIDrawer &&
                        turnStatus ===
                        "drawing" && (

                            <div className="drawing-tools">

                                <span>
                                    Color
                                </span>


                                <div className="colors">

                                    {
                                        COLORS.map(
                                            (color) => (

                                                <button
                                                    key={
                                                        color
                                                    }

                                                    aria-label={
                                                        color
                                                    }

                                                    className={
                                                        !eraser &&
                                                        selectedColor ===
                                                        color
                                                            ? "color selected"
                                                            : "color"
                                                    }

                                                    style={{
                                                        background:
                                                            color
                                                    }}

                                                    onClick={() => {

                                                        setSelectedColor(
                                                            color
                                                        );

                                                        setEraser(
                                                            false
                                                        );

                                                    }}
                                                />

                                            )
                                        )
                                    }

                                </div>


                                <button
                                    className={
                                        eraser
                                            ? "tool-button selected-tool"
                                            : "tool-button"
                                    }

                                    onClick={() =>
                                        setEraser(
                                            true
                                        )
                                    }
                                >
                                    Eraser
                                </button>


                                <button
                                    className="tool-button"

                                    onClick={() =>
                                        socket.emit(
                                            "clearCanvasRequest"
                                        )
                                    }
                                >
                                    Clear
                                </button>

                            </div>

                        )
                    }

                </section>


                {/* ====================================
                    CHAT
                ==================================== */}

                <aside className="chat-panel">

                    <h2>
                        Guesses
                    </h2>


                    <div className="chat-list">

                        {
                            messages.length ===
                                0 && (

                                <span className="no-guesses">
                                    No guesses yet
                                </span>

                            )
                        }


                        {
                            messages.map(
                                (
                                    message,
                                    index
                                ) => (

                                    <div
                                        className={
                                            message.system
                                                ? "message system"
                                                : "message"
                                        }

                                        key={
                                            index
                                        }
                                    >

                                        {
                                            !message.system &&
                                            (
                                                <strong>
                                                    {
                                                        message.username
                                                    }
                                                </strong>
                                            )
                                        }


                                        <span>
                                            {
                                                message.text
                                            }
                                        </span>

                                    </div>

                                )
                            )
                        }


                        <div
                            ref={
                                chatBottomRef
                            }
                        />

                    </div>


                    <div className="guess-controls">

                        {
                            amIDrawer ? (

                                <span>
                                    You're drawing
                                </span>

                            ) :

                            hasGuessed ? (

                                <span className="correct-text">
                                    Correct — waiting for the next turn
                                </span>

                            ) :

                            (

                                <>

                                    <input
                                        value={
                                            guess
                                        }

                                        disabled={
                                            turnStatus !==
                                            "drawing"
                                        }

                                        placeholder="Type a guess"

                                        onChange={
                                            (event) =>
                                                setGuess(
                                                    event
                                                        .target
                                                        .value
                                                )
                                        }

                                        onKeyDown={
                                            (event) => {

                                                if (
                                                    event.key ===
                                                    "Enter"
                                                ) {

                                                    sendGuess();
                                                }
                                            }
                                        }
                                    />


                                    <button
                                        disabled={
                                            turnStatus !==
                                            "drawing"
                                        }

                                        onClick={
                                            sendGuess
                                        }
                                    >
                                        Send
                                    </button>

                                </>

                            )
                        }

                    </div>

                </aside>

            </section>

        </main>
    );
}


export default Game;