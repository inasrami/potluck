# PotLuck

A shared recipe site built with React (Vite) and Supabase. Anyone can browse recipes; registered users can share their own, edit or delete their recipes, and comment on others.

**Live site:** `<ADD YOUR DEPLOYED LINK HERE>`

## Install and run

1. `npm install`
2. Create a Supabase project, then in **SQL Editor** run `supabase/schema.sql` once. Optional sample data: register a user first, then run `supabase/seed.sql`.
3. In **Authentication**, enable Email sign-in. For development, turn **Confirm email** off. Set **Site URL** to `http://localhost:5173`.
4. Copy `.env.example` to `.env.local` and fill in your Project URL and Publishable key (never use secret keys or the database password).
5. `npm run dev`, then open http://localhost:5173. Build with `npm run build`.

## Architecture

- **Frontend:** React 18, React Router 6, Vite. No UI library; styling is plain external CSS (`src/index.css`).
- **Backend:** Supabase (hosted Postgres, Auth and auto-generated REST API), called with `fetch` from `src/api/index.js`.
- **Security:** Row Level Security is enabled on both tables. Guests can read; only a recipe's author can edit or delete it; signed-in users can comment. Route guards and hidden buttons only affect navigation; the database policies enforce access.
- **Structure:** `api/` (all requests), `context/` (AuthContext), `hooks/` (useFetch), `components/` (Layout, guards, RecipeForm, shared pieces), `pages/` (routed pages), `utils/` (validation).

---

# Functional Guide

## 1. Project Overview

**Application name:** PotLuck
**Category / topic:** Recipe sharing community
**Main purpose:** PotLuck lets home cooks publish recipes and discover what others cook. Users can search and filter the catalog, read full recipes, and discuss them in comments. It solves the problem of scattered recipes by giving one shared place with clear ownership: you manage your own recipes and everyone can read them.

## 2. User Access & Permissions

**Guest (not authenticated)**
- Pages: Home (`/`), Catalog (`/recipes`), Details (`/recipes/:recipeId`), Login, Register.
- Public data: all recipes and all comments (read-only).

**Authenticated user**
- Main sections: Catalog, My recipes (`/my-recipes`), Create (`/create`).
- Details page: same as guests, plus a comment form. The recipe's author also sees Edit and Delete buttons.
- Create / Edit / Delete: any user can create a recipe; only the author can edit (`/recipes/:recipeId/edit`) or delete their own recipes. Any user can add comments.

## 3. Authentication & Session Handling

**Flow**
1. When the app loads, `AuthProvider` reads any saved session from `localStorage`.
2. Auth status is `Boolean(user)` from `AuthContext`; guards and the navbar read it with `useAuth()`.
3. On login or registration, the app calls Supabase Auth (`/auth/v1/token?grant_type=password` or `/auth/v1/signup`), saves the session and redirects to `/recipes`. If email confirmation is enabled, registration shows a "check your inbox" message instead.
4. On logout, the app calls `/auth/v1/logout?scope=local`, clears Context and `localStorage`, and returns to Home.

**Session persistence**
- The session (access token, refresh token, expiry, user id and email) is held in Context and stored in `localStorage` under `potluck_session`. The password is never stored.
- After a refresh, the session is restored from storage. Before each authenticated request, the token is refreshed with the refresh token if it expires within a minute. If refreshing fails, the session is cleared and the user is logged out.

## 4. Routing Structure

**Route guards:** `PrivateRoute` redirects guests to `/login`. `GuestRoute` redirects logged-in users to `/recipes`. Both are layout routes that render `<Outlet />`.

**Main routes (9):** `/` Home, `/recipes` Catalog, `/recipes/:recipeId` Details, `/create`, `/recipes/:recipeId/edit`, `/my-recipes`, `/login`, `/register`, and `*` Not found.

**Nested and parameterized routes**
- All pages are nested inside a `Layout` route (navbar, footer, `<Outlet />`).
- URL parameters: `/recipes/:recipeId` and `/recipes/:recipeId/edit`.
- Dynamic pages: Details, Edit, and My recipes (filtered by the current user's id).

## 5. List → Details Flow

**Catalog page:** shows recipe cards (image or category tile, title, description, category, cooking time, author). Users can search by title, filter by category and sort by newest or quickest. These filters are stored in the URL query string with `useSearchParams`, so they survive a refresh.

**Details page:** each card is a `<Link>` to `/recipes/{id}`. The page reads `recipeId` with `useParams`, fetches that recipe and its comments, and shows a "does not exist" state if no row matches. Edit and Delete use `useNavigate` after saving or deleting.

## 6. Data Source & Backend

**Backend type:** a real hosted backend, Supabase (Postgres, Auth and REST API), with tables `recipes` and `comments`. `comments.recipe_id` is a foreign key to `recipes.id` with `ON DELETE CASCADE`. Data persists between visits; nothing is hardcoded.

## 7. Data Operations (CRUD)

**Create (POST):** the Create page renders `RecipeForm`. On a valid submit, `createRecipe` sends `POST /rest/v1/recipes` with the user's token; the database fills `id`, `owner_id` and `created_at`. The user is then taken to the new recipe's page. Comments are created with `POST /rest/v1/comments`.

**Read (GET):** the Home, Catalog and My recipes pages fetch lists with `GET /rest/v1/recipes`; Details fetches one recipe by `id=eq.{id}` and its comments by `recipe_id=eq.{id}`. All reads go through the `useFetch` hook.

**Update (PATCH):** the author opens the Edit page, which loads the recipe into `RecipeForm`. Saving sends `PATCH /rest/v1/recipes?id=eq.{id}`. If the response is an empty array (not the owner), an error is shown. After success the user returns to Details, which refetches the updated data.

**Delete:** on Details, the author clicks Delete and confirms. The app sends `DELETE /rest/v1/recipes?id=eq.{id}`, then navigates to My recipes, which refetches the list. The recipe's comments are removed by the cascade.

## 8. Forms & Validation

**Forms used:** Login, Register, Create/Edit recipe (shared `RecipeForm`), and the comment form. All inputs are controlled components using `onChange` and `onSubmit`.

**Validation rules (validated before any request; errors are shown under each field)**
- Title: required, 3–80 characters.
- Cooking time: whole number from 1 to 600.
- Ingredients: at least two non-empty lines.
- Email: must match a valid email format.
- Password: at least 6 characters. Register also requires the repeated password to match (the repeat is not sent to the API).
- Also: description 10–300 characters, instructions at least 20 characters, image link optional but must start with http:// or https://, comment must not be empty.

## 9. React-Specific Techniques

**Hooks and lifecycle:** `useState`, `useEffect`, `useContext`, `useParams`, `useNavigate`, `useSearchParams`, and the custom hook `useFetch`.
*Lifecycle example:* when the Details page mounts, `useFetch` starts a request with an `AbortController`. If `recipeId` changes, the effect cleanup aborts the old request and a new one starts. On unmount, the cleanup aborts any pending request.

**Context API:** `AuthContext` shares `user`, `name`, `login`, `register` and `logout`. It is used by the Layout (navbar), the route guards, the Details, Create, Edit and My recipes pages, and the auth forms.

**Styling:** a single external stylesheet, `src/index.css`, with CSS variables for the colour palette.

## 10. Typical User Flow

1. A visitor opens the site, browses the Catalog and searches for "soup".
2. They open a recipe, read it, and click Join to register.
3. After registering, they click "Share a recipe", fill in the form and publish; they land on their new recipe page.
4. They open My recipes, edit a recipe to fix a typo, and later leave a comment on another user's recipe.
5. They log out; the navbar returns to the guest state.

## 11. Error & Edge Case Handling

- **Authentication errors:** invalid login, existing email or an expired session show a clear message above the form; an expired session logs the user out.
- **Network or data errors:** every data view shows a loading state, and on failure an error message with a "Try again" button.
- **Empty or missing data:** empty lists show a message with a call to action (for example, "Share a recipe"); an unknown recipe id shows "This recipe does not exist"; unknown URLs show a "Page not found" page. A user who opens another user's Edit URL is redirected to the Details page.
