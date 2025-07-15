import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import CarouselSection from "./../components/CarouselSection";
import hat from "../assets/chef-hat.png";
import eye from "../assets/eye.png";
import heart from "../assets/heart.png";

export default function UserDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [recipeCreations, setRecipeCreations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setShowModal(true);
    } else {
      fetchProfile(user.id);
      fetchFavourites(user.id);
      fetchHistory(user.id);
      fetchCreations(user.id);
    }
  }, [navigate, user]);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
    }
    if (error) {
      console.error(error.message);
    }
  };

  const fetchFavourites = async (userId) => {
    let { data, error } = await supabase
      .from("recipe_favourites")
      .select("recipe_id, recipe(*)")
      .eq("user_id", userId);

    if (data) {
      setFavourites(data.map((r) => r.recipe));
    }
    if (error) {
      setError(error.message);
    }
  };

  const fetchHistory = async (userId) => {
    let { data, error } = await supabase
      .from("recipe_browsing_history")
      .select("recipe_id, recipe(*)")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }
    setHistory(data ?? []);
  };

  const fetchCreations = async (userId) => {
    let { data, error } = await supabase
      .from("recipe")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setRecipeCreations(data);
    }
    if (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <Modal
        isOpen={showModal}
        message={"Please login first."}
        onClose={() => {
          setShowModal(false);
          navigate("/login");
        }}
      />
      {user && (
        <div className="welcome-section">
          <div className="welcome-wrapper">
            <div className="welcome-card">
              <div className="welcome-text">
                <h1>
                  Welcome back,{" "}
                  <span>
                    {profile
                      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                      : user.email}
                  </span>
                  ! 👋
                </h1>
                <p>What’s cooking today? 🍳 Let’s explore something new!</p>
              </div>
              <img src={hat} alt="cooking icon" className="welcome-icon" />
            </div>
            <div className="stat-section">
              <div className="stat-card">
                <img src={heart} alt="heart" className="icon" />
                <div className="stat-text">
                  <strong>{favourites.length}</strong>
                  <p>Favourites</p>
                </div>
              </div>
              <div className="separator"></div>
              <div className="stat-card">
                <img src={eye} alt="eye" className="icon" />
                <div className="stat-text">
                  <strong>{history.length}</strong>
                  <p>Recently Viewed</p>
                </div>
              </div>
              <div className="separator"></div>
              <div className="stat-card">
                <img src={hat} alt="hat" className="icon" />
                <div className="stat-text">
                  <strong>{recipeCreations.length}</strong>
                  <p>Recipes Created</p>
                </div>
              </div>
            </div>
          </div>

          <section>
            <CarouselSection
              title="Recommended For You"
              sectionClass="section-1"
              dataSource={`https://letmecook.ca/api/recipes/recommend?userid=${user?.id}`}
            />
          </section>
          <section>
            <CarouselSection
              title="Recently Viewed"
              sectionClass="section-2"
              dataSource={`https://letmecook.ca/api/recently-viewed/${user?.id}`}
            />
          </section>
          <section>
            <CarouselSection
              title="Popular Recipes"
              sectionClass="section-3"
              dataSource="https://letmecook.ca/api/recipes?sort=viewCount&size=20"
            />
          </section>
          <section>
            <CarouselSection
              title="Seasonal Favourites"
              sectionClass="section-4"
              dataSource={`https://letmecook.ca/api/recipes/recommend?userid=${user?.id}`}
            />
          </section>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}
    </>
  );
}
