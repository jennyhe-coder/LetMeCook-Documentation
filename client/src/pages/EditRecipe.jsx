import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../utils/supabaseClient';
import Modal from '../components/Modal';
import { useNavigate, useParams } from 'react-router-dom';
import { debounce } from 'lodash';
import Select from 'react-select';
import './RecipeForm.css';

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

  const removeIngredientRow = (index) => {
    setRecipeIngredients((prev) => prev.filter((_, i) => i !== index));
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

    const { error: updateError } = await supabase
      .from('recipe')
      .update({
        title: form.title,
        description: form.description,
        servings: form.servings,
        is_public: form.is_public,
        image_url: form.image_url,
        directions: form.directions,
        time: form.time
      })
      .eq('id', recipeId);

    if (updateError) {
      setError("Update failed: " + updateError.message);
      return;
    }

    setShowModal(true);
  };

 return (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 1rem' }}>
    <div
      style={{
        maxWidth: '700px',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '2.5rem',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#333',
      }}
    >
      <h2>Edit Recipe</h2>
      <form onSubmit={handleSubmit}>
        {/* KEEP ALL YOUR INPUTS HERE EXACTLY AS YOU HAD THEM */}

        <div className="form-group">
          <label>Recipe Image</label>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImgUpload} />
          {form.image_url && <img src={form.image_url} alt="food preview" />}
        </div>

        <div className="form-group">
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Dietary Preference</label>
          <Select isMulti options={dietaryOpt.map(opt => ({ value: opt.id, label: opt.name }))} value={dietaryPref} onChange={setDietaryPref} />
        </div>

        <div className="form-group">
          <label>Cuisines</label>
          <Select isMulti options={cuisineOpt.map(opt => ({ value: opt.id, label: opt.name }))} value={cuisine} onChange={setCuisine} />
        </div>

        <div className="form-group">
          <label>Categories</label>
          <Select isMulti options={categoryOpt.map(opt => ({ value: opt.id, label: opt.name }))} value={categories} onChange={setCategories} />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Servings</label>
          <input type="number" name="servings" min={1} value={form.servings} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Cooking Time (minutes)</label>
          <input type="number" name="time" min={1} value={form.time} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Directions</label>
          <textarea name="directions" value={form.directions} onChange={handleChange} />
        </div>

        <div className="checkbox-group">
          <input type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange} />
          <label>Make this recipe public</label>
        </div>

        <h3 className="ingredients-title">Ingredients</h3>
        {recipeIngredients.map((ri, index) => (
          <div className="ingredient-row" key={index}>
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
              type="text"
              placeholder="Quantity"
              value={ri.quantity}
              onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
            />

            <select
              name="unit"
              value={ri.unit}
              onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
            >
              <option value=''>Select Unit</option>
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>

            <button
              type="button"
              className="delete-ingredient-btn"
              onClick={() => removeIngredientRow(index)}
            >
              Delete
            </button>
          </div>
        ))}

        <button type="button" className="add-ingredient-btn" onClick={addIngredientRow}>
          Add Ingredient
        </button>

        <br /><br />
        <button type="submit" className="btn btn-success">Update Recipe</button>
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
  </div>
);

}
