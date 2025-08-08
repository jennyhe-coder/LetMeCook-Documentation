import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import RecipeList from "./../components/RecipeList";
import SortDropdown from "./../components/SortDropdown";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const RESULTS_PER_PAGE = 24;

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");
  const cuisines = searchParams.getAll("cuisines");
  const ingredients = searchParams.getAll("ingredients");
  const allergies = searchParams.getAll("allergies");
  const categories = searchParams.getAll("categories");
  const dietaryPreferences = searchParams.getAll("dietaryPreferences");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sort, setSort] = useState(searchParams.get("sort") || "createdAt");
  const sectionRef = useRef(null);

  const prompt = searchParams.get("prompt");
  const [extracting, setExtracting] = useState(false);
  const [cachedPrompt, setCachedPrompt] = useState(null);

  useEffect(() => {
    const currentPrompt = searchParams.get("prompt");
    if (currentPrompt) {
      setCachedPrompt(currentPrompt);
    }
  }, [searchParams]);

  useEffect(() => {
    const hasPromptOnly =
      prompt &&
      !searchParams.get("keyword") &&
      searchParams.getAll("cuisines").length === 0 &&
      searchParams.getAll("ingredients").length === 0 &&
      searchParams.getAll("allergies").length === 0 &&
      searchParams.getAll("categories").length === 0 &&
      searchParams.getAll("dietaryPreferences").length === 0;

    if (!hasPromptOnly) return;

    const extractFieldsAndUpdateParams = async () => {
      setExtracting(true);
      setResults([]);
      setTotalElements(0);
      try {
        const res = await fetch(
          "https://letmecook.ca/api/opencv/extract_search_fields",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
          }
        );

        if (!res.ok) throw new Error("Failed to extract fields");
        const fields = await res.json();

        const newParams = new URLSearchParams();

        if (fields.keyword) newParams.set("keyword", fields.keyword);
        if (fields.cuisines)
          fields.cuisines.forEach((c) => newParams.append("cuisines", c));
        if (fields.ingredients)
          fields.ingredients.forEach((i) => newParams.append("ingredients", i));
        if (fields.allergies)
          fields.allergies.forEach((a) => newParams.append("allergies", a));
        if (fields.categories)
          fields.categories.forEach((c) => newParams.append("categories", c));
        if (fields.dietaryPreferences)
          fields.dietaryPreferences.forEach((d) =>
            newParams.append("dietaryPreferences", d)
          );

        newParams.set("sort", sort);
        newParams.set("page", "0");
        newParams.set("size", RESULTS_PER_PAGE.toString());

        setSearchParams(newParams);
      } catch (err) {
        console.error("Failed to extract from prompt:", err);
        alert("Sorry! We couldn't understand your search.");
      } finally {
        setExtracting(false);
      }
    };

    extractFieldsAndUpdateParams();
  }, [prompt]);

  useEffect(() => {
    const keyword = searchParams.get("keyword");
    const cuisines = searchParams.getAll("cuisines");
    const ingredients = searchParams.getAll("ingredients");
    const allergies = searchParams.getAll("allergies");
    const categories = searchParams.getAll("categories");
    const dietaryPreferences = searchParams.getAll("dietaryPreferences");

    const shouldFetch =
      keyword ||
      cuisines.length > 0 ||
      ingredients.length > 0 ||
      allergies.length > 0 ||
      categories.length > 0 ||
      dietaryPreferences.length > 0;

    if (!shouldFetch) return;

    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    cuisines.forEach((c) => params.append("cuisines", c));
    ingredients.forEach((i) => params.append("ingredients", i));
    allergies.forEach((a) => params.append("allergies", a));
    categories.forEach((c) => params.append("categories", c));
    dietaryPreferences.forEach((d) => params.append("dietaryPreferences", d));

    params.set("sort", sort);
    params.set("page", page - 1);
    params.set("size", RESULTS_PER_PAGE);

    setSearchParams(params);
    const url = `https://letmecook.ca/api/recipes/search?${params.toString()}`;

    setLoading(true);
    setTotalElements(0);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const recipes = Array.isArray(data.content) ? data.content : [];
        setResults(recipes);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      })
      .catch((err) => {
        console.error("Failed to fetch search results:", err);
        setResults([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams, sort, page]);

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

  return (
    <section className="search-results-section" ref={sectionRef}>
      <div className="search-results-bg" />
      <div className="layout-wrapper">
        <div className="user-prompt">
          {/*raw prompt */}
          {cachedPrompt && <div className="prompt-text">"{cachedPrompt}"</div>}
        </div>

        <br />

        <div className="results-header">
          <h3 style={{ marginLeft: "2px" }}>Results</h3>
          <SortDropdown sort={sort} setSort={setSort} />
        </div>

        {/*extracted filters */}
        {results.length !== 0 && (
          <div className="filter-summary">
            <br />
            {[
              keyword && `Keyword: ${keyword}`,
              cuisines.length > 0 && `Cuisines: ${cuisines.join(", ")}`,
              ingredients.length > 0 &&
                `Ingredients: ${ingredients.join(", ")}`,
              allergies.length > 0 && `Allergies: ${allergies.join(", ")}`,
              categories.length > 0 && `Categories: ${categories.join(", ")}`,
              dietaryPreferences.length > 0 &&
                `Dietary: ${dietaryPreferences.join(", ")}`,
            ]
              .filter(Boolean)
              .join(", ")}
            {totalElements > 0 && !loading && (
              <span className="results-count">&nbsp;&nbsp;{totalElements}</span>
            )}
          </div>
        )}

        {/* <br /> */}

        {!extracting && results.length === 0 && !loading ? (
          <>
            <br />
            <p style={{ marginLeft: "4px" }}>No results found.</p>
          </>
        ) : (
          <>
            <RecipeList
              recipes={
                loading || extracting
                  ? Array.from({ length: 24 }, (_, i) => ({
                      id: `placeholder-${i}`,
                      title: "Loading...",
                      authorName: "Please wait",
                      imageUrl: "/assets/placeholder.jpg",
                      cookingTime: "...",
                    }))
                  : results
              }
            />

            <div className="pagination-wrapper">
              <div className="pagination-meta">
                <span>
                  <b>
                    {(page - 1) * RESULTS_PER_PAGE + 1} -{" "}
                    {Math.min(page * RESULTS_PER_PAGE, totalElements)}
                  </b>{" "}
                  of <b>{totalElements}</b> results
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
          </>
        )}
      </div>
    </section>
  );
}
