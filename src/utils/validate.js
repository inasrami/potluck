export const CATEGORIES = ['Breakfast', 'Soup', 'Main', 'Salad', 'Dessert', 'Snack'];

export function validateRecipe(f) {
  const e = {};
  const t = f.title.trim();
  if (t.length < 3 || t.length > 80) e.title = 'Title must be 3–80 characters.';
  if (f.description.trim().length < 10 || f.description.length > 300) e.description = 'Description must be 10–300 characters.';
  if (!CATEGORIES.includes(f.category)) e.category = 'Choose a category.';
  const n = Number(f.cook_time_minutes);
  if (!Number.isInteger(n) || n < 1 || n > 600) e.cook_time_minutes = 'Cooking time must be a whole number from 1 to 600.';
  if (f.ingredients.trim().split('\n').filter(Boolean).length < 2) e.ingredients = 'List at least two ingredients, one per line.';
  if (f.instructions.trim().length < 20) e.instructions = 'Instructions need at least 20 characters.';
  if (f.image_url.trim() && !/^https?:\/\/\S+$/.test(f.image_url.trim())) e.image_url = 'Image must be a link starting with http:// or https://.';
  return e;
}
export function validateAuth(f, register) {
  const e = {};
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (f.password.length < 6) e.password = 'Password must be at least 6 characters.';
  if (register && f.repeat !== f.password) e.repeat = 'Passwords do not match.';
  return e;
}
