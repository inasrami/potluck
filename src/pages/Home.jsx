import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { getRecipes } from '../api';
import { Loader, ErrorBox, RecipeCard, Empty } from '../components/Bits';

export default function Home() {
  const { data, loading, error, reload } = useFetch((s) => getRecipes(s, '&limit=3'), []);
  return (<>
    <section className="hero">
      <h1>Bring a dish. Take a recipe.</h1>
      <p>PotLuck is a shared recipe table. Browse what people cook, then add your own.</p>
      <Link className="btn" to="/recipes">Browse recipes</Link>
    </section>
    <h2>Newest at the table</h2>
    {loading ? <Loader /> : error ? <ErrorBox message={error} retry={reload} /> :
      data.length ? <div className="grid">{data.map((r) => <RecipeCard key={r.id} r={r} />)}</div>
        : <Empty text="No recipes yet. Be the first to share one." to="/create" cta="Share a recipe" />}
  </>);
}
