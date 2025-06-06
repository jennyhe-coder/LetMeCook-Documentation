import { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";

export default function  Profile () {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        getAccessTokenSilently()
            .then(token =>  
                fetch("http://localhost:8080/api/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
            )
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Error ${res.status}: ${text}`)
                }
                return res.json();
            })
            .then(data => setProfile(data))
            .catch(err => console.error("Error loading profile", err));
    }, [getAccessTokenSilently, isAuthenticated])

    if (!isAuthenticated) return <p>Please log in.</p>;
    if (!profile) return <p>Loading profile...</p>;

    return (
    <div>
        <p>{profile.full_name}</p>
        <p>Email: {profile.email}</p>
        <p>Cooking Skill: {profile.cooking_skill}</p>
        <p>About Me: {profile.about_me}</p>
        <p>Dietary Preference: {profile.dietary_preg}</p>
        <img src={profile.image_url} alt="Profile" style={{ width: "150px" }} />
    </div>
  );
}