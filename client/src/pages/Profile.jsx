import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import { Link } from 'react-router-dom';


export default function  Profile () {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allergyNames, setAllergyNames] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if(!user) {
                setLoading(false);
                setProfile(null);
                return;
            }
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(data);
            setLoading(false);
            setError(error ? error.message : null);

            if (data && data.user_allergy && data.user_allergy.length > 0) {
                const { data: ingredients, error: ingredientsError } = await supabase
                    .from('ingredients')
                    .select('id, name')
                    .in('id', data.user_allergy);
                if (ingredientsError) {
                    setError(ingredientsError.message);
                } else {
                    setAllergyNames(ingredients);
                }
            }
        };
        fetchProfile();
    }, [user]);

    if (!user) return <p>Please log in.</p>;
    if (loading) return <p>Loading profile...</p>;
    if (error) return <p>Error loading profile: {error}</p>;
    if (!profile) return <p>No profile found.</p>;


    return (
    <div>
        <p>{profile.full_name}</p>
        <p>Email: {profile.email}</p>
        <p>Cooking Skill: {profile.cooking_skill}</p>
        <p>About Me: {profile.about_me}</p>
        <p>Dietary Preference: {(profile.dietary_pref || ['No preference']).map(pref => <span key={pref}>{pref}</span>)}</p>
        <p>
            Allergies:&nbsp;
            {allergyNames.length > 0
                ? allergyNames.map(a => a.name).join(', ')
                : 'None'}
        </p>
        <img src={profile.image_url} alt="Profile" style={{ width: 150, borderRadius: '50%' }} />        
        <Link to="/edit-profile" className="btn btn-primary">
            <button>Edit Profile</button>
        </Link>
    </div>
  );
}
