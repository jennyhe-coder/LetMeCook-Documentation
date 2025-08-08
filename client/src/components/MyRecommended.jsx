import { useEffect, useRef, useState } from "react";
import RecipeList from "./../components/RecipeList";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

gsap.registerPlugin(ScrollTrigger);

const RESULTS_PER_PAGE = 6;

export default function MyRecommended() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const sectionRef = useRef(null);
  const { user, loading: userLoading } = useAuth();
  const [recommended, setRecommended] = useState([]);

  const navigate = useNavigate();

  // Use a ref to cache data between renders and tab switches
  const cachedRecommendations = useRef(null);

  useEffect(() => {
    if (!user && !userLoading) {
      navigate("/unauthorized");
    }
  }, [user, userLoading, navigate]);

  useEffect(() => {
    if (userLoading || !user?.id) return;

    // If cached, just use cached data, skip fetch
    if (cachedRecommendations.current) {
      setRecommended(cachedRecommendations.current);
      setTotalElements(cachedRecommendations.current.length);
      setTotalPages(
        Math.ceil(cachedRecommendations.current.length / RESULTS_PER_PAGE)
      );
      return;
    }

    async function fetchRecommendations() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://letmecook.ca/api/recipes/recommend?userid=${user.id}`
        );
        const data = await res.json();
        console.log("API response:", data);

        const recipes = Array.isArray(data.content) ? data.content : [];

        if (recipes.length > 0) {
          const formatted = recipes.map((r) => ({
            ...r,
            cookingTime: r.time ?? r.cookingTime,
          }));

          cachedRecommendations.current = formatted;
          setRecommended(formatted);
          setTotalElements(formatted.length);
          setTotalPages(Math.ceil(formatted.length / RESULTS_PER_PAGE));
        } else {
          // Fallback to latest picks
          const fallbackRes = await fetch(
            `https://letmecook.ca/api/recipes?sort=createdAt&size=20`
          );
          const fallbackData = await fallbackRes.json();
          const fallbackRecipes = Array.isArray(fallbackData.content)
            ? fallbackData.content
            : [];

          const formattedFallback = fallbackRecipes.map((r) => ({
            ...r,
            cookingTime: r.time ?? r.cookingTime,
          }));

          cachedRecommendations.current = formattedFallback;
          setRecommended(formattedFallback);
          setTotalElements(formattedFallback.length);
          setTotalPages(Math.ceil(formattedFallback.length / RESULTS_PER_PAGE));
        }
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [user, userLoading]);

  useEffect(() => {
    setPage(1);
  }, [recommended]);

  useEffect(() => {
    const el = sectionRef.current;
    if (el) {
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
            start: "top 100%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, []);

  const handleDislike = async (recipeId) => {
    try {
      const { error } = await supabase
        .from("recipe_disliked")
        .insert({ user_id: user.id, recipe_id: recipeId });

      if (error) throw error;

      // remove the disliked recipe from view
      const updated = recommended.filter((r) => r.id !== recipeId);
      cachedRecommendations.current = updated;
      setRecommended(updated);
      setTotalElements(updated.length);
      setTotalPages(Math.ceil(updated.length / RESULTS_PER_PAGE));
    } catch (err) {
      console.error("Failed to dislike recipe:", err.message);
    }
  };

  return (
    <section className="recommended-section" ref={sectionRef}>
      <div className="all-recipes-bg" />
      <div className="layout-wrapper">
        <div className="recommended-header">
          <h3 style={{ paddingBottom: "16px" }}>Recommended For You</h3>
        </div>

        <br />

        {loading ? (
          <div className="loading-message">Loading...</div>
        ) : (
          <>
            <RecipeList
              recipes={recommended.slice(
                (page - 1) * RESULTS_PER_PAGE,
                page * RESULTS_PER_PAGE
              )}
              onDislike={handleDislike}
            />

            <br />

            {recommended.length > 0 && (
              <div className="pagination-wrapper-recommended">
                <div className="pagination-meta">
                  <span>
                    <b>
                      {(page - 1) * RESULTS_PER_PAGE + 1} -{" "}
                      {Math.min(page * RESULTS_PER_PAGE, totalElements)}
                    </b>{" "}
                    of <b>{totalElements}</b> recipes
                  </span>
                </div>

                <div className="pagination-numbers">
                  <span
                    className={`page-prev ${page === 1 ? "disabled" : ""}`}
                    onClick={() => page > 1 && setPage(page - 1)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="8"
                      height="14"
                    >
                      <path d="M0 7L8 14L8 0L0 7Z" fill="#1E1E1E" />
                    </svg>
                  </span>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (totalPages <= 7) return true;
                      if (p === 1 || p === totalPages) return true;
                      if (Math.abs(p - page) <= 1) return true;
                      if (page <= 3 && p <= 3) return true;
                      if (page >= totalPages - 2 && p >= totalPages - 2)
                        return true;
                      return false;
                    })
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showDots = prev && p - prev > 1;

                      return (
                        <span key={p} className="pagination-item">
                          {showDots && <span className="ellipsis">...</span>}
                          <span
                            className={`page-number ${
                              p === page ? "current" : ""
                            }`}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </span>
                        </span>
                      );
                    })}

                  <span
                    className={`page-next ${
                      page === totalPages ? "disabled" : ""
                    }`}
                    onClick={() => page < totalPages && setPage(page + 1)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="8"
                      height="14"
                    >
                      <path d="M8 7L0 14L0 0L8 7Z" fill="#1E1E1E" />
                    </svg>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
