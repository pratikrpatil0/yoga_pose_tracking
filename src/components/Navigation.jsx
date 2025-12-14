import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🧘 AI Yoga
        </Link>
        
        <div className="nav-menu">
            <>
              <Link to="/" className={isActive('/')}>
                Home
              </Link>
              <Link to="/sessions" className={isActive('/sessions')}>
                Library
              </Link>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            </>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;