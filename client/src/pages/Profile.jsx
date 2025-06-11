import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { AuthProvider, useAuth } from '../context/AuthProvider';

export default function  Profile () {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
       if(!user) {
           setLoading(false);
           setProfile(null);
           return;
       }
       setLoading(true);
       supabase
       .from('users')
       .select('*')
       .eq('id', user.id)
       .single()
       .then(({data, error}) => {
        setProfile(data);
        setLoading(false);
        setError(error ? error.message : null);
       })
    }, [user])

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
        <p>Dietary Preference: {profile.dietary_preference}</p>
        <img src={profile.image_url} alt="Profile" style={{ width: "150px" }} />
    </div>
  );
}