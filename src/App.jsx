import {
    Routes,
    Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Results from "./pages/Results";


function App() {

    return (

        <>

            <Navbar />

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/lobby"
                    element={<Lobby />}
                />

                <Route
                    path="/results"
                    element={<Results />}
                />

            </Routes>

        </>

    );

}


export default App;