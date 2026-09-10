import {Link} from 'react-router-dom';

function Navbar(){
    return (
        <nav className='navbar'>
            <Link to="/" className="logo">INKrush</Link>
            <div className='nav-links'>
                <Link to='/'>Home</Link>
                <Link to='/game'>Game</Link>
                <Link to='/lobby'>Lobby</Link>
                <Link to='/results'>Results</Link>
            </div>

        </nav>
    )
}
export default Navbar;