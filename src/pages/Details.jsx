import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { addComment, deleteRecipe, getComments, getRecipe } from '../api';
import { Loader, ErrorBox, Empty } from '../components/Bits';

export default function Details() {
  const { recipeId } = useParams();
  const { user, name } = useAuth();
  const nav = useNavigate();
  const rec = useFetch((s) => getRecipe(recipeId, s), [recipeId]);
  const com = useFetch((s) => getComments(recipeId, s), [recipeId]);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');

  if (rec.loading) return <Loader />;
  if (rec.error) return <ErrorBox message={rec.error} retry={rec.reload} />;
  const r = rec.data;
  if (!r) return <Empty text="This recipe does not exist or was deleted." to="/recipes" cta="Back to recipes" />;
  const mine = user?.id === r.owner_id;

  async function remove() {
    if (!window.confirm('Delete this recipe and its comments?')) return;
    try { await deleteRecipe(r.id); nav('/my-recipes'); } catch (e) { setMsg(e.message); }
  }
  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return setMsg('Write a comment first.');
    try { await addComment({ recipe_id: r.id, comment: text.trim(), author_name: name }); setText(''); setMsg(''); com.reload(); }
    catch (err) { setMsg(err.message); }
  }
  return (
    <article>
      <h1>{r.title}</h1>
      <p className="note">{r.category} · {r.cook_time_minutes} min · by {r.author_name}</p>
      {r.image_url && <img className="cover" src={r.image_url} alt={r.title} />}
      <p>{r.description}</p>
      {mine && <div className="row"><Link className="btn" to={`/recipes/${r.id}/edit`}>Edit recipe</Link><button className="btn danger" onClick={remove}>Delete recipe</button></div>}
      <h2>Ingredients</h2>
      <ul>{r.ingredients.split('\n').filter(Boolean).map((i, n) => <li key={n}>{i}</li>)}</ul>
      <h2>Method</h2>
      <p className="pre">{r.instructions}</p>
      <h2>Comments</h2>
      {com.loading ? <Loader /> : com.error ? <ErrorBox message={com.error} retry={com.reload} /> :
        com.data.length ? com.data.map((c) => <div key={c.id} className="comment"><strong>{c.author_name}</strong><p>{c.comment}</p></div>)
          : <p className="note">No comments yet.</p>}
      {user ? (
        <form onSubmit={send} className="form"><label className="field">Add a comment
          <textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} /></label>
          {msg && <div className="error" role="alert">{msg}</div>}<button className="btn">Post comment</button></form>
      ) : <p className="note"><Link to="/login">Log in</Link> to comment.</p>}
    </article>
  );
}
