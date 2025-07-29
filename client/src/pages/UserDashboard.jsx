import { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom"

import SearchBar from "./../components/SearchBar-Home";
import CarouselSection from "./../components/CarouselSection";
import sunnywelcome from "../assets/sunnywelcome.png";
import hat from "../assets/chef-hat.png";
import eye from "../assets/eye.png";
import heart from "../assets/heart.png";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function UserDashboard() {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [recipeCreations, setRecipeCreations] = useState([]);
  const [firstName, setFirstName] = useState("");

  const navigate = useNavigate();
  const welcomeRef = useRef();

  useEffect(() => {
    const el = welcomeRef.current;

    gsap.fromTo(
      el,
      { opacity: 1, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  useEffect(() => {
    if (user) {
      const getName = async () => {
        const { data, error } = await supabase
          .from("users")
          .select("first_name")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setFirstName(data.first_name);
        }
      };

      getName();
      fetchFavourites(user.id);
      fetchHistory(user.id);
      fetchCreations(user.id);
      //fetch recommendations(user.id) implement this after AI algorithm is done
    } else {
      navigate("/");
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

  //const fetchRecommendation = async (userId) => {}

  return (
    <>
      {user && (
        <div ref={welcomeRef} className="welcome-section">
          <div className="welcome-wrapper">
            <div className="welcome-card layout-wrapper">
              <div className="welcome-text">
                <h1>
                  Welcome back, <span>{firstName || user.email}</span>! 👋
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

              {/* <div className="separator"></div>

              <div className="stat-card">
                <img src={eye} alt="eye" className="icon" />
                <div className="stat-text">
                  <strong>{history.length}</strong>
                  <p>Recently Viewed</p>
                </div>
              </div> */}

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
            <CarouselSection
              title="Recently Viewed"
              sectionClass="section-2"
              dataSource={`https://letmecook.ca/api/recently-viewed/${user?.id}`}
            />
          </section>
          <section>
            <CarouselSection
              title="Trending Now"
              sectionClass="section-3"
              dataSource="https://letmecook.ca/api/recipes?sort=viewCount&size=20"
            />
          </section>
          <section>
            <CarouselSection
              title="Quick & Easy Meals"
              sectionClass="section-4"
              dataSource="https://letmecook.ca/api/recipes?sort=cookTime&size=20"
            />
          </section>
        </div>
      )}
    </>
  );
}
