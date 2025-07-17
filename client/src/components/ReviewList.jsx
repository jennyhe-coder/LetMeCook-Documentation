import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const customSelectStyle = {
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 4px center",
  backgroundSize: "16px",
  paddingRight: "30px",
  cursor: "pointer",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  fontFamily: "'Raleway', sans-serif",
  height: "32px",
};

const ReviewList = ({ recipeId, refreshTrigger }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // create state for sorting reviews
  const [sort, setSort] = useState("recent");
  const [sortOrder, setSortOrder] = useState("desc");

  // render the stars for the categories
  const renderStars = (value) => {
    return "★".repeat(value) + "☆".repeat(5 - value);
  };

  // fetch user session
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }
      setUser(data.user);
    };

    getUser();
  }, []);

  // fetch recipe reviews and review categories
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id, comment, created_at, user_id, user:users(first_name, last_name), review_ratings:review_ratings(value, category)"
        )
        .eq("recipe_id", recipeId);

      if (error) {
        console.error("Error fetching reviews:", error.message);
        setReviews([]);
      } else {
        // filter for overall rating
        const filter = data.map((review) => {
          const overallRating =
            review.review_ratings.find((r) => r.category === "overall")
              ?.value || 0;
          return { ...review, overallRating };
        });

        const sorted = filter.sort((a, b) => {
          if (sort === "rating") {
            return sortOrder === "asc"
              ? a.overallRating - b.overallRating
              : b.overallRating - a.overallRating;
          } else {
            return sortOrder === "desc"
              ? new Date(b.created_at) - new Date(a.created_at)
              : new Date(a.created_at) - new Date(b.created_at);
          }
        });

        setReviews(sorted);
      }

      setLoading(false);
    };

    if (recipeId) fetchReviews();
  }, [recipeId, sort, sortOrder, refreshTrigger]);

  if (loading) return <p>Loading reviews...</p>;
  if (!reviews.length) return <p>No reviews yet for this recipe.</p>;

  return (
    <div style={{ marginTop: "2.5rem" }}>
      <h3 style={{ marginBottom: "0rem" }}>Reviews</h3>
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <div>
          <label
            htmlFor="sort-select"
            style={{
              marginBottom: "0.5rem",
              display: "block",
              marginLeft: "1px",
            }}
          >
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={customSelectStyle}
          >
            <option value="recent">Date</option>
            <option value="rating">Overall Rating</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="order-select"
            style={{ marginBottom: "0.5rem", display: "block" }}
          >
            Order By:
          </label>
          <select
            id="order-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={customSelectStyle}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <br />

      <ul style={{ padding: 0, listStyle: "none" }}>
        {reviews.map((review) => {
          const firstName = review.user?.first_name || "";
          const lastName = review.user?.last_name || "";
          const ratings = review.review_ratings || [];

          return (
            <li
              key={review.id}
              style={{
                marginBottom: "2rem",
                border: "1px solid #ccc",
                padding: "1rem",
                borderRadius: "10px",
              }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                {ratings.map(({ category, value }) => (
                  <p key={category}>
                    <strong>
                      {category.charAt(0).toUpperCase() + category.slice(1)}:
                    </strong>{" "}
                    {renderStars(value)}
                  </p>
                ))}
              </div>
              <p style={{ fontStyle: "italic" }}>
                {review.comment || "(No comment)"}
              </p>
              <small>
                Posted by {firstName} {lastName} on{" "}
                {new Date(review.created_at).toLocaleDateString()}
              </small>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ReviewList;
