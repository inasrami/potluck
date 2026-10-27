import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { GuestRoute, PrivateRoute } from './components/Guards';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Details from './pages/Details';
import Create from './pages/Create';
import Edit from './pages/Edit';
import MyRecipes from './pages/MyRecipes';
import AuthPage from './pages/AuthPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="recipes" element={<Catalog />} />
        <Route path="recipes/:recipeId" element={<Details />} />
        <Route element={<PrivateRoute />}>
          <Route path="create" element={<Create />} />
          <Route path="recipes/:recipeId/edit" element={<Edit />} />
          <Route path="my-recipes" element={<MyRecipes />} />
        </Route>
        <Route element={<GuestRoute />}>
          <Route path="login" element={<AuthPage mode="login" />} />
          <Route path="register" element={<AuthPage mode="register" />} />
        </Route>
        <Route path="*" element={<><h1>Page not found</h1><Link to="/">Go home</Link></>} />
      </Route>
    </Routes>
  );
}
