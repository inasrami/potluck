import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, name, logout } = useAuth();
  const nav = useNavigate();
  return (
    <>
      <header className="bar"><nav className="wrap bar-in" aria-label="Main">
        <Link to="/" className="brand">PotLuck</Link>
        <NavLink to="/recipes">Recipes</NavLink>
        {user ? (<>
          <NavLink to="/my-recipes">My recipes</NavLink>
          <NavLink to="/create" className="btn small">Share a recipe</NavLink>
          <span className="who">{name}</span>
          <button className="link" onClick={async () => { await logout(); nav('/'); }}>Log out</button>
        </>) : (<>
          <NavLink to="/login">Log in</NavLink>
          <NavLink to="/register" className="btn small">Join</NavLink>
        </>)}
      </nav></header>
      <main className="wrap"><Outlet /></main>
      <footer className="wrap foot">PotLuck: recipes from people who actually cook them.</footer>
    </>
  );
}
