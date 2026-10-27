import { Navigate, useNavigate, useParams } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { getRecipe, updateRecipe } from '../api';
import { Loader, ErrorBox, Empty } from '../components/Bits';

export default function Edit() {
  const { recipeId } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const { data, loading, error, reload } = useFetch((s) => getRecipe(recipeId, s), [recipeId]);
  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (!data) return <Empty text="This recipe does not exist." to="/recipes" cta="Back to recipes" />;
  if (data.owner_id !== user.id) return <Navigate to={`/recipes/${recipeId}`} replace />;
  return (<><h1>Edit recipe</h1>
    <RecipeForm initial={{ ...data, image_url: data.image_url || '' }} submitLabel="Save changes"
      onSubmit={async (r) => { await updateRecipe(recipeId, r); nav(`/recipes/${recipeId}`); }} /></>);
}
