import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthProvider'
import { supabase } from '../utils/supabaseClient'
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';


const DIETARY_OPTIONS  = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Halal',
    'Kosher',
    'Paleo',
    'Keto',
    'Low-Carb',
].map(option => ({label: option, value: option}));

const COOKING_SKILL = [
    'beginner',
    'home cook',
    'skilled',
    'chef',
    'master chef'
];

export default function EditProfile() {
    const {user} = useAuth();
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        cooking_skill: '',
        about_me: '',
        dietary_pref: [],
        user_allergy: [],
        image_url: ''
    });
    const [error, setError] = useState(null);
    const [ingredientSearch, setIngredientSearch] = useState([]);
    const [ingredientsResults, setIngredientsResults] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();


    useEffect(() => {
        if (!user) {
            setProfile(null);
            return;
        }
        (async () => {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();
            if (data) {
                let allergiesArr = [];
                if (data.user_allergy && data.user_allergy.length > 0) {
                    const {data: allergyData } = await supabase
                        .from('ingredients')
                        .select('id, name')
                        .in('id', data.user_allergy);
                    allergiesArr = (allergyData || []).map(a => ({
                        id: a.id,
                        name: a.name
                    }));
                };
                setForm({ ...data, 
                    user_allergy: allergiesArr, 
                    dietary_pref: data.dietary_pref || [] });
                setProfile(data);
            } else {
                setError(error ? error.message : "No profile found");
            }
        })();
    }, [user]);

    
    useEffect(() => {
        if (!ingredientSearch) return;

        const fetchIngredients = async () => {
            try {
                const { data, error } = await supabase
                    .from('ingredients')
                    .select('*')
                    .ilike('name', `%${ingredientSearch}%`)
                    .limit(10);

                if (error) throw error;

                setIngredientsResults((data || []).map(ingredient => ({
                    id: ingredient.id,
                    name: ingredient.name,
                    ...ingredient
                })));
                
            } catch (error) {
                console.error("Error fetching ingredients:", error);
            }
        };

        fetchIngredients();
    },[ingredientSearch]);

    const handleChange = (e) => {
        const { name, value} = e.target;

        setForm({ ...form, [name]: value });
  
    };

    function handleCookingLvl(e) {
        setForm({ ...form, cooking_skill: e.target.value });
    }
     const handleDietaryPreference = (selected) => {
        setForm({...form, 
            dietary_pref: selected? selected.map(s => s.value)
            : [] });
     }

     const handleAllergies = (selected) => {
        setForm({ ...form, user_allergy: selected.map(s => ({ id: s.value, name: s.label })) });
     }


     const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Trying to update user with id:", user.id);

        const {data,error} = await supabase
        .from("users")
        .update({
            first_name: form.first_name,
            last_name: form.last_name,
            dietary_pref: (form.dietary_pref || []),
            cooking_skill: form.cooking_skill,
            about_me: form.about_me,
            user_allergy: (form.user_allergy || []).map((a)=> a.id),
        })
        .eq("id", user.id)
        .select();

        if (error) {
            setError(error.message);
            return;
        }
        console.log({data,error})
        setError(null);
        alert("Profile updated successfully!");
        setProfile({ ...profile, ...form });
     }

     const handleImgUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const filepath = `${user.id}_${Date.now()}.${fileExt}`;

        const {error} = await supabase.storage
            .from('user-profile-images')
            .upload(filepath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            setUploading(false);
            setError(error.message);
            return;
        }
        const { data: publicURLData } = supabase.storage
            .from('user-profile-images')
            .getPublicUrl(filepath);

        const { error: updateError } = await supabase
        .from('users')
        .update({ image_url: publicURLData.publicUrl })
        .eq('id', user.id);

        if (updateError) {
            console.error("Error updating user image URL:", updateError);
            setUploading(false);
            setError(updateError.message);
            return;
        }
        setForm({ ...form, image_url: publicURLData.publicUrl });
        setUploading(false);
        navigate('/profile');
     }


  return (
    <>
    <h1>Edit Profile</h1>
    <form onSubmit={handleSubmit}>
        {form.image_url && (
        <img src={form.image_url} alt="Profile" style={{ width: 100, borderRadius: '50%' }} />
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "block", margin: "8px 0" }}
        onChange={handleImgUpload}
        disabled={uploading}
      />
      {uploading && <span>Uploading...</span>}
        <input
            type="text"
            name="first_name"
            value={form.first_name || ''}
            onChange={handleChange}
            placeholder="First Name"
        />
        <input
            type="text"
            name="last_name"
            value={form.last_name || ''}
            onChange={handleChange}
            placeholder="Last Name"
        />
        <textarea
            name="about_me"
            value={form.about_me || ''}
            onChange={handleChange}
            placeholder="About Me"
        />
        <label>Dietary Preferences</label>
        <Select
            name="dietary_pref"
            value={DIETARY_OPTIONS.filter(opt =>
                    (form.dietary_pref || []).includes(opt.value)
            )}
            onChange={handleDietaryPreference}
            isMulti
            closeMenuOnSelect={false}
            options={DIETARY_OPTIONS}
            placeholder="Select Dietary Preferences"
            />
        <label>Cooking Skill Level</label>
        <select
            name="cooking_skill"
            value={form.cooking_skill}
            onChange={handleCookingLvl}
        >
            <option value="">Select Skill Level</option>
            {COOKING_SKILL.map((skill) => (
                <option key={skill} value={skill}>
                    {skill}
                </option>
            ))}
        </select>
        <label>Allergies</label>
        <Select
            name="allergies"
            value={(Array.isArray(form.user_allergy) ? form.user_allergy : [])
                .filter(a => a && a.id && a.name)
                .map(a => ({
                value: a.id,
                label: a.name
            }))}
            onChange={handleAllergies}
            onInputChange={inputVal => setIngredientSearch(inputVal)}
            isMulti
            closeMenuOnSelect={false}
            placeholder="Search for allergies..."
            noOptionsMessage={() => 
                ingredientSearch ? "No allergies found" : "Type to search for allergies"
            }
            options = {ingredientsResults.map(ingredient => ({
                value: ingredient.id,
                label: ingredient.name
            }))} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" >
            Update Profile
        </button>
    </form>
    </>
  )
}
