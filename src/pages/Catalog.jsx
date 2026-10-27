import { useSearchParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { getRecipes } from '../api';
import { Loader, ErrorBox, RecipeCard, Empty } from '../components/Bits';
import { CATEGORIES } from '../utils/validate';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '', cat = params.get('cat') || '', sort = params.get('sort') || 'new';
  const { data, loading, error, reload } = useFetch((s) => getRecipes(s), []);
  const set = (k, v) => { const p = new URLSearchParams(params); v ? p.set(k, v) : p.delete(k); setParams(p); };
  let list = (data || []).filter((r) => (!cat || r.category === cat) && r.title.toLowerCase().includes(q.toLowerCase()));
  if (sort === 'quick') list = [...list].sort((a, b) => a.cook_time_minutes - b.cook_time_minutes);
  return (<>
    <h1>Recipes</h1>
    <div className="filters">
      <input aria-label="Search by title" placeholder="Search by title" value={q} onChange={(e) => set('q', e.target.value)} />
      <select aria-label="Category" value={cat} onChange={(e) => set('cat', e.target.value)}>
        <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      <select aria-label="Sort" value={sort} onChange={(e) => set('sort', e.target.value)}>
        <option value="new">Newest first</option><option value="quick">Quickest first</option></select>
    </div>
    {loading ? <Loader /> : error ? <ErrorBox message={error} retry={reload} /> :
      list.length ? <div className="grid">{list.map((r) => <RecipeCard key={r.id} r={r} />)}</div>
        : <Empty text="No recipes match. Try another search or share your own." to="/create" cta="Share a recipe" />}
  </>);
}
