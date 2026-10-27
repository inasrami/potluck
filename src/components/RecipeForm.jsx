import { useState } from 'react';
import { CATEGORIES, validateRecipe } from '../utils/validate';

const blank = { title: '', description: '', category: 'Main', cook_time_minutes: '', ingredients: '', instructions: '', image_url: '' };

export default function RecipeForm({ initial, submitLabel, onSubmit }) {
  const [f, setF] = useState({ ...blank, ...initial });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const errs = validateRecipe(f);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setFailure('');
    try {
      await onSubmit({ title: f.title.trim(), description: f.description.trim(), category: f.category,
        cook_time_minutes: Number(f.cook_time_minutes), ingredients: f.ingredients.trim(),
        instructions: f.instructions.trim(), image_url: f.image_url.trim() || null });
    } catch (err) { setFailure(err.message); setBusy(false); }
  }
  const field = (name, label, el) => (
    <label className="field">{label}{el}{errors[name] && <span className="err">{errors[name]}</span>}</label>
  );
  return (
    <form onSubmit={submit} noValidate className="form">
      {field('title', 'Title', <input name="title" value={f.title} onChange={set} />)}
      {field('description', 'Short description', <textarea name="description" rows="2" value={f.description} onChange={set} />)}
      {field('category', 'Category', <select name="category" value={f.category} onChange={set}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>)}
      {field('cook_time_minutes', 'Cooking time (minutes)', <input name="cook_time_minutes" type="number" value={f.cook_time_minutes} onChange={set} />)}
      {field('ingredients', 'Ingredients (one per line)', <textarea name="ingredients" rows="6" value={f.ingredients} onChange={set} />)}
      {field('instructions', 'Instructions', <textarea name="instructions" rows="7" value={f.instructions} onChange={set} />)}
      {field('image_url', 'Image link (optional)', <input name="image_url" value={f.image_url} onChange={set} />)}
      {failure && <div className="error" role="alert">{failure}</div>}
      <button className="btn" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
    </form>
  );
}
