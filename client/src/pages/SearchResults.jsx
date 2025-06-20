// import { useSearchParams } from "react-router-dom";
// import { useEffect, useRef, useState } from "react";
// import RecipeList from "./../components/RecipeList";
// import SortDropdown from "./../components/SortDropdown";

// const RESULTS_PER_PAGE = 24;
// const MAX_RESULTS = 50;

// export default function SearchResults() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const keyword = searchParams.get("keyword");

//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [sort, setSort] = useState(searchParams.get("sort") || "createdAt");
//   const sectionRef = useRef(null);

//   useEffect(() => {
//     if (!keyword) return;

//     const params = new URLSearchParams();
//     params.set("keyword", keyword);
//     if (sort) params.set("sort", sort);
//     params.set("size", MAX_RESULTS);
//     setSearchParams(params);

//     const url = `https://letmecook.ca/api/recipes/search?${params.toString()}`;

//     setLoading(true);
//     setPage(1);

//     fetch(url)
//       .then((res) => res.json())
//       .then((data) => {
//         const recipes = Array.isArray(data)
//           ? data
//           : Array.isArray(data.content)
//           ? data.content
//           : [];
//         setResults(recipes);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch search results:", err);
//         setResults([]);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, [keyword, sort]);

//   useEffect(() => {
//     if (sectionRef.current) {
//       sectionRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [page]);

//   const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
//   const paginatedResults = results.slice(
//     (page - 1) * RESULTS_PER_PAGE,
//     page * RESULTS_PER_PAGE
//   );

//   return (
//     <section className="search-results-section" ref={sectionRef}>
//       <div className="search-results-bg" />
//       <div className="layout-wrapper">
//         <div className="user-prompt">
//           "{keyword}"
//           {results.length > 0 && !loading && (
//             <span className="results-count">&nbsp;&nbsp;{results.length}</span>
//           )}
//         </div>
//         <br />

//         <div className="results-header">
//           <h3>Results</h3>
//           <SortDropdown sort={sort} setSort={setSort} />
//         </div>
//         <br />

//         {loading ? (
//           <p>Loading recipes...</p>
//         ) : results.length === 0 ? (
//           <p>No results found.</p>
//         ) : (
//           <>
//             <RecipeList recipes={paginatedResults} />

//             <div className="pagination-wrapper">
//               <div className="pagination-meta">
//                 <span>
//                   <b>
//                     {(page - 1) * RESULTS_PER_PAGE + 1} -{" "}
//                     {Math.min(page * RESULTS_PER_PAGE, results.length)}
//                   </b>{" "}
//                   of <b>{results.length}</b> results
//                 </span>
//               </div>

//               <div className="pagination-numbers">
//                 <span
//                   className={`page-prev ${page === 1 ? "disabled" : ""}`}
//                   onClick={() => page > 1 && setPage(page - 1)}
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="8"
//                     height="14"
//                     viewBox="0 0 8 14"
//                     fill="none"
//                   >
//                     <path d="M0 7L8 14L8 0L0 7Z" fill="#1E1E1E" />
//                   </svg>
//                 </span>

//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                   (p, index, arr) => (
//                     <span key={p} className="pagination-item">
//                       <span
//                         className={`page-number ${p === page ? "current" : ""}`}
//                         onClick={() => setPage(p)}
//                       >
//                         {p}
//                       </span>
//                       {index < arr.length - 1 && (
//                         <span className="divider">|</span>
//                       )}
//                     </span>
//                   )
//                 )}

//                 <span
//                   className={`page-next ${
//                     page === totalPages ? "disabled" : ""
//                   }`}
//                   onClick={() => page < totalPages && setPage(page + 1)}
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="8"
//                     height="14"
//                     viewBox="0 0 8 14"
//                     fill="none"
//                   >
//                     <path d="M8 7L0 14L0 0L8 7Z" fill="#1E1E1E" />
//                   </svg>
//                 </span>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </section>
//   );
// }
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

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sort, setSort] = useState(searchParams.get("sort") || "createdAt");
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!keyword) return;

    const params = new URLSearchParams();
    params.set("keyword", keyword);
    params.set("sort", sort);
    params.set("page", page - 1);
    params.set("size", RESULTS_PER_PAGE);

    setSearchParams(params);
    const url = `https://letmecook.ca/api/recipes/search?${params.toString()}`;

    setLoading(true);

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
  }, [keyword, sort, page]);

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [page]);

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
          "{keyword}"
          {totalElements > 0 && !loading && (
            <span className="results-count">&nbsp;&nbsp;{totalElements}</span>
          )}
        </div>
        <br />

        <div className="results-header">
          <h3>Results</h3>
          <SortDropdown sort={sort} setSort={setSort} />
        </div>
        <br />

        {results.length === 0 && !loading ? (
          <p>No results found.</p>
        ) : (
          <>
            <RecipeList
              recipes={
                loading
                  ? Array.from({ length: 24 }, (_, i) => ({
                      id: `placeholder-${i}`,
                      title: "Loading...",
                      authorName: "Please wait",
                      imageUrl: "/assets/placeholder.jpg", // use same placeholder image
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
