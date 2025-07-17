import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import SearchBar from "./../components/SearchBar-Home";
import Modal from "../components/Modal";
import CarouselSection from "./../components/CarouselSection";
import sunnywelcome from "../assets/sunnywelcome.png";
import hat from "../assets/chef-hat.png";
import eye from "../assets/eye.png";
import heart from "../assets/heart.png";

export default function UserDashboard() {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [recipeCreations, setRecipeCreations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  //const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      fetchFavourites(user.id);
      fetchHistory(user.id);
      fetchCreations(user.id);
      //fetch recommendations(user.id) implement this after AI algorithm is done
    }
  }, [user]);

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
    console.log("Supabase result:", data);
    setHistory(data ?? []);
  };

  const fetchCreations = async (userId) => {
    let { data, error } = await supabase
      .from("recipe")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });
    console.log("history result:", history);
    if (data) {
      setRecipeCreations(data);
    }
    if (error) {
      setError(error.message);
    }
  };

  //const fetchRecommendation = async (userId) => {}

  return (
    <>
      {user && (
        <div className="welcome-section">
          <div className="welcome-wrapper">
            <div className="welcome-card layout-wrapper">
              <div className="welcome-text">
                <h1>
                  Welcome back, <span>{user.first_name || user.email}</span>! 👋
                </h1>
                <p>What’s cooking today? 🍳 Let’s explore something new!</p>
                <p>
                  Your cozy corner for simple, delicious, and homey recipes is
                  always here waiting — whether you’re planning meals for the
                  week or just looking for some quick inspiration.
                </p>
                <div className="search-container">
                  <SearchBar />
                </div>
              </div>
              <img
                src={sunnywelcome}
                alt="sunny the chef welcome"
                className="welcome-icon"
              />
            </div>

            <div className="stat-section">
              <Link to="/favourites" className="stat-card">
                <img src={heart} alt="heart" className="icon" />
                <div className="stat-text">
                  <strong>{favourites.length}</strong>
                  <p>Favourites</p>
                </div>
              </Link>

              <div className="separator"></div>

              <div className="stat-card">
                <img src={eye} alt="eye" className="icon" />
                <div className="stat-text">
                  <strong>{history.length}</strong>
                  <p>Recently Viewed</p>
                </div>
              </div>

              <div className="separator"></div>

              <Link to="/user-recipe" className="stat-card">
                <img src={hat} alt="hat" className="icon" />
                <div className="stat-text">
                  <strong>{recipeCreations.length}</strong>
                  <p>Recipes Created</p>
                </div>
              </Link>
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
            {/* Have to get the data source for this later */}
            <CarouselSection
              title="Recently Viewed"
              sectionClass="section-2"
              dataSource={`https://letmecook.ca/api/recently-viewed/${user?.id}`}
            />
          </section>
          <section>
            {/* Have to get the data source for this later */}
            <CarouselSection
              title="Popular Recipes"
              sectionClass="section-3"
              dataSource="https://letmecook.ca/api/recipes?sort=viewCount&size=20"
            />
          </section>
          <section>
            {/* Have to get the data source for this later */}
            <CarouselSection
              title="Seasonal Favourites"
              sectionClass="section-4"
              dataSource={`https://letmecook.ca/api/recipes/recommend?userid=${user?.id}`}
            />
          </section>
        </div>
      )}
    </>
  );
}
