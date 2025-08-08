import { useEffect, useRef, useState } from "react";
import RecipeList from "./../components/RecipeList";
import { supabase } from "../utils/supabaseClient";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

const RESULTS_PER_PAGE = 24;
const SORT_OPTIONS = {
  createdAt: "Most Recent",
  viewCount: "Most Popular",
  cookTime: "Cooking Time",
};

export default function UserRecipe() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const sectionRef = useRef(null);
  const { user, loading: userLoading } = useAuth();
  const [userRecipes, setUserRecipes] = useState([]);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!user && !userLoading) {
      navigate('/unauthorized');
      return;
    }
  }, [user, navigate, userLoading]);

  useEffect(() => {
    if (userLoading) return;
    if (!user?.id) {
      console.warn("user doesn't exist");
      return;
    }

    async function fetchRecipe() {
      setLoading(true);

      const { data: recipeData, error: recipeErr } = await supabase
        .from("recipe")
        .select("*")
        .eq("author_id", user.id);

      if (recipeErr) {
        console.log("Error fetching recipes: ", recipeErr);
      } else {
        setUserRecipes(
          recipeData.map((r) => ({
            ...r,
            cookingTime: r.time,
          }))
        );
        setTotalElements(recipeData.length);
      }
      setLoading(false);
    }
    fetchRecipe();
  }, [user]);

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
            start: "top 100%", // triggers earlier
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, []);

  const handleRemove = async (recipeId) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from("recipe")
      .delete()
      .eq("id", recipeId)
      .eq("author_id", user.id);

    if (error) {
      console.error("Failed to delete recipe:", error.message);
      return;
    }

    const updatedList = userRecipes.filter((r) => r.id !== recipeId);
    setUserRecipes(updatedList);
    setTotalElements(updatedList.length);
    setTotalPages(Math.ceil(updatedList.length / RESULTS_PER_PAGE));
  };

  return (
    <section className="all-recipes-section" ref={sectionRef}>
      <div className="all-recipes-bg" />
      <div className="layout-wrapper">
        <div className="favourites-header">
          <h3>My Recipes</h3>
          <FaEdit
            size={24}
            className={`edit-icon ${editMode ? "active" : ""}`}
            title={editMode ? "Exit Edit Mode" : "Edit Recipes"}
            onClick={() => setEditMode(!editMode)}
          />
        </div>

        <br />
        <div className="all-recipes-desc"></div>
        <br />
        {/* <br /> */}
        <>
          <button
            onClick={() => navigate("/create-recipe")}
            className="create-button"
          >
            + Create New Recipe
          </button>
          <br />
          {/* <br /> */}
          {/* <br /> */}
          <RecipeList
            recipes={userRecipes}
            editMode={editMode}
            onRemove={handleRemove}
          />

          {!loading && (
            <div className="pagination-wrapper">
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
                    viewBox="0 0 8 14"
                    fill="none"
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
                    viewBox="0 0 8 14"
                    fill="none"
                  >
                    <path d="M8 7L0 14L0 0L8 7Z" fill="#1E1E1E" />
                  </svg>
                </span>
              </div>
            </div>
          )}
        </>
      </div>
    </section>
  );
}
