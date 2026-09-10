import {
    useLocation,
    useNavigate
} from "react-router-dom";


function Results() {

    const location =
        useLocation();

    const navigate =
        useNavigate();


    const players =
        location.state?.players ||
        [];


    return (

        <div
            style={{
                padding: "40px"
            }}
        >

            <h1>
                GAME OVER
            </h1>


            {players.length > 0 && (

                <h2>

                    🏆 Winner:
                    {" "}
                    {
                        players[0]
                            .username
                    }

                </h2>
            )}


            <h2>
                Final Scores
            </h2>


            {players.map(
                (
                    player,
                    index
                ) => (

                    <h3
                        key={
                            player.id
                        }
                    >

                        {index + 1}.
                        {" "}

                        {
                            player.username
                        }

                        {" — "}

                        {
                            player.score
                        }

                    </h3>
                )
            )}


            <button
                onClick={() =>
                    navigate("/")
                }
            >

                Back Home

            </button>

        </div>
    );
}


export default Results;