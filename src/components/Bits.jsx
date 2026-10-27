import { Link } from 'react-router-dom';

export const Loader = () => <p className="note" role="status">Loading…</p>;
export const ErrorBox = ({ message, retry }) => (
  <div className="error" role="alert">{message}{retry && <button className="link" onClick={retry}> Try again</button>}</div>
);
export const Empty = ({ text, to, cta }) => (
  <div className="empty"><p>{text}</p>{to && <Link className="btn" to={to}>{cta}</Link>}</div>
);
export function RecipeCard({ r }) {
  return (
    <Link to={`/recipes/${r.id}`} className="card">
      {r.image_url ? <img src={r.image_url} alt="" loading="lazy" onError={(e) => (e.target.style.display = 'none')} /> : <div className="ph">{r.category}</div>}
      <div className="card-body"><h3>{r.title}</h3><p>{r.description}</p>
        <small>{r.category} · {r.cook_time_minutes} min · by {r.author_name}</small></div>
    </Link>
  );
}
