import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!keyword) return;

    fetch(`/api/recipes/search?keyword=${encodeURIComponent(keyword)}`)
      .then((res) => res.json())
      .then(setResults)
      .catch((err) => {
        console.error("Failed to fetch search results:", err);
      });
  }, [keyword]);

  return (
    <div className="layout-wrapper">
      <br />
      <h3>Search Results for "{keyword}"</h3>
      <br />
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <ul>
          {results.map((item) => (
            <li key={item.id}>
              <p>{item.title}</p>

              <p>{item.authorName}</p>
              <br />
              <p dangerouslySetInnerHTML={{ __html: item.description }}></p>
              <br />
              <p>{item.cookingTime} minutes</p>
              <p>{item.servings} servings</p>
              <br />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
