import { useEffect, useRef, useState } from "react";
import RecipeList from "./../components/RecipeList";
import { supabase } from "../utils/supabaseClient";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "../context/AuthProvider";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const RESULTS_PER_PAGE = 24;
const SORT_OPTIONS = {
  createdAt: "Most Recent",
  viewCount: "Most Popular",
  cookTime: "Cooking Time",
};

export default function Favourites() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const sectionRef = useRef(null);
  const { user, loading: userLoading } = useAuth();
  const [favRecipes, setFavRecipes] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const navigate = useNavigate();

  const handleReorder = (newOrder) => {
    setFavRecipes(newOrder);
  };

  useEffect(() => {
    if (!user) {
      navigate("/unauthorized");
      return;
    }
  }, [user, navigate]);

  const handleRemove = async (recipeId) => {
    if (!user?.id) return;

    console.log("Deleting favourite:", {
      userId: user.id,
      recipeId: recipeId,
      typeofUserId: typeof user.id,
      typeofRecipeId: typeof recipeId,
    });

    const { data, error } = await supabase
      .from("recipe_favourites")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId);

    console.log("Delete result:", { data, error });

    if (error) {
      console.error("Failed to remove favourite:", error.message);
      return;
    }

    // Update UI
    const updatedList = favRecipes.filter((r) => r.id !== recipeId);
    setFavRecipes(updatedList);
    setTotalElements(updatedList.length);
    setTotalPages(Math.ceil(updatedList.length / RESULTS_PER_PAGE));
  };

  useEffect(() => {
    if (userLoading) return;
    if (!user?.id) {
      console.log("user doesn't exist");
      return;
    }

    async function fetchFav() {
      console.log("fetching user: ", user.id);
      setLoading(true);

      const { data: favData, error: favError } = await supabase
        .from("recipe_favourites")
        .select("recipe_id")
        .eq("user_id", user.id);

      if (favError) {
        console.log("Error fetching favourites:", favError);
        setLoading(false);
        return;
      }

      const favRecipeIds = favData.map((item) => item.recipe_id);

      if (!favRecipeIds || favRecipeIds.length === 0) {
        console.log("No favourites found.");
        setFavRecipes([]);
        setTotalElements(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const { data: recipeData, error: recipeErr } = await supabase
        .from("recipe")
        .select("*")
        .in("id", favRecipeIds);

      if (recipeErr) {
        console.log("Error fetching recipes: ", recipeErr);
      } else {
        const sorted = recipeData.sort(
          (a, b) => favRecipeIds.indexOf(a.id) - favRecipeIds.indexOf(b.id)
        );
        setFavRecipes(
          sorted.map((r) => ({
            ...r,
            cookingTime: r.time,
          }))
        );
        setTotalElements(sorted.length);
        setTotalPages(Math.ceil(sorted.length / RESULTS_PER_PAGE));
      }

      setLoading(false);
    }

    fetchFav();
  }, [user, userLoading]);

  // useEffect(() => {
  //   if (sectionRef.current) {
  //     sectionRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [page]);

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

  return (
    <section className="all-recipes-section" ref={sectionRef}>
      <div className="all-recipes-bg" />
      <div className="layout-wrapper">
        <div className="favourites-header">
          <h3>My Favourites</h3>
          <FaEdit
            size={24}
            className={`edit-icon ${editMode ? "active" : ""}`}
            title={editMode ? "Exit Edit Mode" : "Edit Favourites"}
            onClick={() => setEditMode(!editMode)}
          />
        </div>

        <br />
        <div className="all-recipes-desc"></div>

        <>
          <RecipeList
            recipes={favRecipes}
            editMode={editMode}
            onRemove={handleRemove}
            onReorder={handleReorder}
          />

          <br />

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
