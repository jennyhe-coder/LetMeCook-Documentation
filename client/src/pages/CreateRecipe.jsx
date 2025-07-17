import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../utils/supabaseClient';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import Select from 'react-select';
import '../pages/CreateRecipe.css';

const UNITS = [
  'teaspoon', 'cup', 'ounce', 'pound', 'pinch',
  'Tbsps', 'serving', 'kilo', 'cloves', 'package',
  'box', 'sprigs', 'mediums'
];

export default function CreateRecipe() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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
    const fetchDropdownOptions = async () => {
      const { data: dietaryData } = await supabase.from('dietary_pref').select('*');
      const { data: cuisineData } = await supabase.from('cuisines').select('*');
      const { data: categoryData } = await supabase.from('categories').select('*');

      setDietaryOpt(dietaryData || []);
      setCuisineOpt(cuisineData || []);
      setCategoryOpt(categoryData || []);
    };
    fetchDropdownOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

  const handleRemoveIngredient = (index) => {
    const updated = [...recipeIngredients];
    updated.splice(index, 1);
    setRecipeIngredients(updated);
  };

  const handleImgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const filepath = `${user.id}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filepath, file);

    if (uploadError) {
      setError("upload image error: " + uploadError.message);
      return;
    }

    const { data: publicURLData, error: publicErr } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(filepath);

    if (publicErr) {
      setError("Error generating public URL: " + publicErr.message);
      return;
    }

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
    // you can keep your original insert logic here
  };

  return (
    <div className="create-recipe-container">
      <h2>Create a Recipe</h2>
      <form onSubmit={handleSubmit}>
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
          <Select isMulti options={dietaryOpt.map(opt => ({ value: opt.id, label: opt.name }))} onChange={setDietaryPref} />
        </div>

        <div className="form-group">
          <label>Cuisines</label>
          <Select isMulti options={cuisineOpt.map(opt => ({ value: opt.id, label: opt.name }))} onChange={setCuisine} />
        </div>

        <div className="form-group">
          <label>Categories</label>
          <Select isMulti options={categoryOpt.map(opt => ({ value: opt.id, label: opt.name }))} onChange={setCategories} />
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
              onClick={() => handleRemoveIngredient(index)}
            >
              Delete
            </button>
          </div>
        ))}

        <button type="button" className="add-ingredient-btn" onClick={addIngredientRow}>
          Add Ingredient
        </button>

        <br /><br />

        <button type="submit">Submit Recipe</button>
        {error && <p className="error-message">{error}</p>}
      </form>

      {showModal && (
        <Modal isOpen={showModal} message="Recipe submitted successfully!" onClose={() => navigate('/user-recipe')} />
      )}
    </div>
  );
}
