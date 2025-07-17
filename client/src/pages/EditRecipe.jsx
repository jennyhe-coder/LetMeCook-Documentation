import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../utils/supabaseClient';
import Modal from '../components/Modal';
import { useNavigate, useParams } from 'react-router-dom';
import { debounce } from 'lodash';
import Select from 'react-select';
import './EditRecipe.css'; 


const UNITS = [
  'teaspoon', 'cup', 'ounce', 'pound', 'pinch',
  'Tbsps', 'serving', 'kilo', 'cloves', 'package',
  'box', 'sprigs', 'mediums'
];

export default function EditRecipe() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { id: recipeId } = useParams();

  const [form, setForm] = useState({
    title: '',
    description: '',
    servings: 0,
    is_public: false,
    image_url: '',
    directions: '',
    time: 0,
  });

  const [recipeIngredients, setRecipeIngredients] = useState([
    { name: '', ingredient_id: null, quantity: '', unit: '' }
  ]);

  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [dietaryOpt, setDietaryOpt] = useState([]);
  const [cuisineOpt, setCuisineOpt] = useState([]);
  const [categoryOpt, setCategoryOpt] = useState([]);

  const [dietaryPref, setDietaryPref] = useState([]);
  const [cuisine, setCuisine] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchRecipeData = async () => {
      const [
        { data: dietaryOptions },
        { data: cuisineOptions },
        { data: categoryOptions },
      ] = await Promise.all([
        supabase.from('dietary_pref').select('*'),
        supabase.from('cuisines').select('*'),
        supabase.from('categories').select('*')
      ]);

      setDietaryOpt(dietaryOptions || []);
      setCuisineOpt(cuisineOptions || []);
      setCategoryOpt(categoryOptions || []);

      const { data, error } = await supabase
        .from("recipe")
        .select("*")
        .eq("id", recipeId)
        .single();

      if (error) {
        setError("Failed to fetch recipe: " + error.message);
        return;
      }

      setForm({
        title: data.title,
        description: data.description,
        servings: data.servings,
        is_public: data.is_public,
        image_url: data.image_url,
        directions: data.directions,
        time: data.time,
      });

      const { data: ingredientsData } = await supabase
        .from("recipe_ingredients")
        .select(`ingredient_id, quantity, unit, ingredients(name)`)
        .eq("recipe_id", recipeId);

      setRecipeIngredients(
        (ingredientsData || []).map(item => ({
          name: item.ingredients?.name || '',
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          unit: item.unit
        }))
      );

      const { data: dietaryData } = await supabase
        .from("recipe_dietary_pref")
        .select("*")
        .eq("recipe_id", recipeId);

      const mappedDietaryPref = (dietaryData || []).map(item => {
        const found = dietaryOptions?.find(opt => opt.id === item.preference_id);
        return found ? { value: found.id, label: found.name } : null;
      }).filter(Boolean);
      setDietaryPref(mappedDietaryPref);

      const { data: cuisineData } = await supabase
        .from("recipe_cuisines")
        .select("cuisine_id")
        .eq("recipe_id", recipeId);

      setCuisine((cuisineData || []).map(item => {
        const found = cuisineOptions?.find(opt => opt.id === item.cuisine_id);
        return found ? { value: found.id, label: found.name } : null;
      }).filter(Boolean));

      const { data: categoryData } = await supabase
        .from("recipe_categories")
        .select("category_id")
        .eq("recipe_id", recipeId);

      setCategories((categoryData || []).map(item => {
        const found = categoryOptions?.find(opt => opt.id === item.category_id);
        return found ? { value: found.id, label: found.name } : null;
      }).filter(Boolean));
    };

    if (recipeId) fetchRecipeData();
  }, [recipeId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addIngredientRow = () => {
    setRecipeIngredients([
      ...recipeIngredients,
      { name: '', ingredient_id: null, quantity: '', unit: '' }
    ]);
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...recipeIngredients];
    updated[index][field] = value;
    updated[index]['ingredient_id'] = null;
    setRecipeIngredients(updated);
  };

  const handleImgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const filepath = `${user.id}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filepath, file, {
        cacheControl: '3600',
        upsert: true,
        metadata: { owner: user.id }
      });

    if (uploadError) {
      setError("Upload image error: " + uploadError.message);
      return;
    }

    const { data: publicURLData, error: publicErr } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(filepath);

    if (publicErr) {
      setError("Error generating public URL: " + publicErr.message);
      return;
    }

    setError(null);
    setForm((prev) => ({ ...prev, image_url: publicURLData.publicUrl }));
  };

  const debouncedSearch = useRef(
    debounce(async (input) => {
      if (!input) return;

      const { data } = await supabase
        .from('ingredients')
        .select('*')
        .ilike('name', `%${input}%`)
        .limit(10);

      setIngredientSuggestions(data || []);
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(ingredientSearch);
  }, [ingredientSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error: recipeError } = await supabase
      .from("recipe")
      .update({
        ...form,
        author_id: user.id,
      })
      .eq("id", recipeId);

    if (recipeError) {
      setError("Update recipe error: " + recipeError.message);
      return;
    }

    const linkedIngredients = [];

    for (let ri of recipeIngredients) {
      if (!ri.name || !ri.quantity || !ri.unit) continue;

      let ingredientId = ri.ingredient_id;

      if (!ingredientId) {
        const { data: existing } = await supabase
          .from("ingredients")
          .select("*")
          .ilike("name", ri.name)
          .maybeSingle();

        if (existing) {
          ingredientId = existing.id;
        } else {
          const { data: newIngredient } = await supabase
            .from("ingredients")
            .insert({ name: ri.name })
            .select()
            .single();

          ingredientId = newIngredient.id;
        }
      }

      linkedIngredients.push({
        recipe_id: recipeId,
        ingredient_id: ingredientId,
        quantity: ri.quantity,
        unit: ri.unit,
      });
    }

    await supabase
      .from("recipe_ingredients")
      .delete()
      .eq("recipe_id", recipeId);

    await supabase
      .from("recipe_ingredients")
      .insert(linkedIngredients);

    if (dietaryPref.length > 0) {
      await supabase.from("recipe_dietary_pref").delete().eq("recipe_id", recipeId);
      await supabase.from("recipe_dietary_pref").upsert(
        dietaryPref.map(item => ({
          recipe_id: recipeId,
          preference_id: item.value
        }))
      );
    }

    if (cuisine.length > 0) {
      await supabase.from("recipe_cuisines").delete().eq("recipe_id", recipeId);
      await supabase.from("recipe_cuisines").upsert(
        cuisine.map(item => ({
          recipe_id: recipeId,
          cuisine_id: item.value
        }))
      );
    }

    if (categories.length > 0) {
      await supabase.from("recipe_categories").delete().eq("recipe_id", recipeId);
      await supabase.from("recipe_categories").upsert(
        categories.map(item => ({
          recipe_id: recipeId,
          category_id: item.value
        }))
      );
    }

    setShowModal(true);
  };

  const removeIngredientRow = (index) => {
    setRecipeIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="edit-recipe-container">
      <h2>Edit Recipe</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImgUpload}
        />
        {form.image_url && (
          <img src={form.image_url} alt="food-image" />
        )}

        <h4>Title</h4>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />

        <h4>Dietary Preference</h4>
        <Select
          isMulti
          value={dietaryPref}
          options={dietaryOpt.map((opt) => ({
            value: opt.id,
            label: opt.name
          }))}
          onChange={setDietaryPref}
        />

        <h4>Cuisines</h4>
        <Select
          isMulti
          value={cuisine}
          options={cuisineOpt.map((opt) => ({
            value: opt.id,
            label: opt.name
          }))}
          onChange={setCuisine}
        />

        <h4>Categories</h4>
        <Select
          isMulti
          value={categories}
          options={categoryOpt.map((opt) => ({
            value: opt.id,
            label: opt.name
          }))}
          onChange={setCategories}
        />

        <h4>Description</h4>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
        />

        <h4>Servings</h4>
        <input
          type="number"
          name="servings"
          value={form.servings}
          onChange={handleChange}
          placeholder="Servings"
          min={1}
        />

        <h4>Cooking Time</h4>
        <input
          type="number"
          name="time"
          value={form.time}
          onChange={handleChange}
          placeholder="Time (min)"
          min={1}
        />

        <h4>Direction</h4>
        <textarea
          name="directions"
          value={form.directions}
          onChange={handleChange}
          placeholder="Directions"
        />

        <label>
          <input
            type="checkbox"
            name="is_public"
            checked={form.is_public}
            onChange={handleChange}
          />
          Make this recipe public
        </label>

        <h3>Ingredients</h3>
        {recipeIngredients.map((ri, index) => (
          <div key={index} className="ingredient-row">
            <input
              type="text"
              placeholder="Ingredient name"
              value={ri.name}
              onChange={(e) => {
                handleIngredientChange(index, 'name', e.target.value);
                setIngredientSearch(e.target.value);
              }}
              list={`suggestions-${index}`}
            />
            <datalist id={`suggestions-${index}`}>
              {ingredientSuggestions.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>

            <input
              type="number"
              step="0.1"
              placeholder="Quantity"
              value={ri.quantity}
              onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
            />

            <select
              name="unit"
              value={ri.unit}
              onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
            >
              <option value="">Select Unit</option>
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => removeIngredientRow(index)}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addIngredientRow}
          className="update-btn"
        >
          Add Ingredient
        </button>

        <br /><br />
        <button type="submit" className="update-btn">
          Update Recipe
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>

      {showModal && (
        <Modal
          isOpen={showModal}
          message="Recipe updated successfully!"
          onClose={() => {
            setShowModal(false);
            navigate("/user-recipe");
          }}
        />
      )}
    </div>
  );
}