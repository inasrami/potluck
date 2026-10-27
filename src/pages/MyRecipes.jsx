import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { getRecipes } from '../api';
import { Loader, ErrorBox, RecipeCard, Empty } from '../components/Bits';

export default function MyRecipes() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch((s) => getRecipes(s, `&owner_id=eq.${user.id}`), [user.id]);
  return (<><h1>My recipes</h1>
    {loading ? <Loader /> : error ? <ErrorBox message={error} retry={reload} /> :
      data.length ? <div className="grid">{data.map((r) => <RecipeCard key={r.id} r={r} />)}</div>
        : <Empty text="You have not shared a recipe yet." to="/create" cta="Share your first recipe" />}</>);
}
