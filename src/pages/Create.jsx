import { useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import { useAuth } from '../context/AuthContext';
import { createRecipe } from '../api';

export default function Create() {
  const nav = useNavigate();
  const { name } = useAuth();
  return (<><h1>Share a recipe</h1>
    <RecipeForm submitLabel="Publish recipe" onSubmit={async (r) => { const c = await createRecipe({ ...r, author_name: name }); nav(`/recipes/${c.id}`); }} /></>);
}
