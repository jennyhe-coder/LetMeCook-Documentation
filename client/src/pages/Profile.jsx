import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import "../Profile.css";
import { set } from "lodash";

export default function Profile() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [allergyNames, setAllergyNames] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
      if (!user && !loading) {
        setProfile(null);
        navigate('/unauthorized');
        return;
      } 
    
    if (user) {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setError(error ? error.message : null);

      if (data?.user_allergy?.length > 0) {
        const { data: ingredients, error: ingredientsError } = await supabase
          .from("ingredients")
          .select("id, name")
          .in("id", data.user_allergy);

        if (ingredientsError) {
          setError(ingredientsError.message);
        } else {
          setAllergyNames(ingredients);
        }
      }
    };

    fetchProfile();
  }
  }, [loading, navigate, user]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error loading profile: {error}</p>;
  if (!profile) return <p>No profile found.</p>;

  return (
    <>
      <div className="height-padding-profile"></div>
      <div className="profile-container">
        <h1>My Profile</h1>
        {profile.image_url && (
          <img
            src={profile.image_url}
            alt="Profile"
            className="profile-image"
          />
        )}
        <div className="profile-info">
          <p>
            <strong>Full Name:</strong>{" "}
            {`${profile.first_name || ""} ${profile.last_name || ""}`.trim()}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Cooking Skill:</strong> {profile.cooking_skill}
          </p>
          <p>
            <strong>About Me:</strong> {profile.about_me}
          </p>
          <p>
            <strong>Dietary Preference:</strong>{" "}
            {(profile.dietary_pref || ["No preference"]).join(", ")}
          </p>
          <p>
            <strong>Allergies:</strong>{" "}
            {allergyNames.length > 0
              ? allergyNames.map((a) => a.name).join(", ")
              : "None"}
          </p>
        </div>
        <Link to="/edit-profile" className="edit-btn">
          <button>Edit Profile</button>
        </Link>
      </div>

      <div className="height-padding"></div>
    </>
  );
}
