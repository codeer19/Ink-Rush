import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">

            <Link
                to="/"
                className="logo"
            >
                INK<span>rush</span>
            </Link>

            <div className="nav-links">

                <Link to="/">
                    Home
                </Link>

                <Link to="/lobby">
                    Lobby
                </Link>

            </div>

        </nav>
    );
}

export default Navbar;