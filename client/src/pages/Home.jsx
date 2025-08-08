import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./../components/SearchBar-Home";
import CarouselSection from "./../components/CarouselSection";
import sunnythechef from "../assets/sunnythechef.png";
import sunnythumbsup from "../assets/sunnythumbsup.png";

export default function Home() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    const trimEmail = email.trim();
    if (!trimEmail) return;

    // redirect to /register page 
    navigate(`/register?email=${encodeURIComponent(trimEmail)}`);
  };

  return (
    <>
      <main>
        <section className="prompt-section">
          <div className="layout-wrapper">
            <div className="prompt-desc">
              <img src={sunnythechef} alt="Sunny the Chef" class="float-img" />
              <h1>Your AI Chef Awaits</h1>
              <p>
                Meet Sunny the Chef, your egg-stra special AI assistant<br></br>
                <br></br>Whether you're into sweet desserts, plant-based meals,
                or quick one-pot dinners, Sunny's always ready with a recipe
                tailored just for you!
              </p>
            </div>
            <a href="/recipes" class="exploreRecipeBtn">
              Start Exploring Recipes
            </a>
            <div className="search-container">
              <SearchBar />
            </div>
          </div>
        </section>

        <CarouselSection
          title="Latest Picks"
          sectionClass="section-1"
          dataSource="https://letmecook.ca/api/recipes?sort=createdAt&size=20"
        />
        <CarouselSection
          title="Most Popular"
          sectionClass="section-2"
          dataSource="https://letmecook.ca/api/recipes?sort=viewCount&size=20"
        />
        <CarouselSection
          title="Vegetarian/Vegan"
          sectionClass="section-3"
          dataSource="https://letmecook.ca/api/recipes?dietaryPreferences=vegan&size=20"
        />
        <CarouselSection
          title="Gluten Free"
          sectionClass="section-4"
          dataSource="https://letmecook.ca/api/recipes?dietaryPreferences=gluten+free&size=20"
        />
        <div className="signup-section">
          <div className="signup-box">
            <div className="signup-header">
              <img src={sunnythumbsup} alt="Sunny with a thumbs up" />
              <h2>Get more from Let Me Cook</h2>
            </div>
            <ul>
              <li>✓ Personalized recipe recommendations</li>
              <li>✓ Save and rate your favorite dishes</li>
              <li>✓ Weekly handpicked recipe inspiration</li>
            </ul>
            <form className="email-section" onSubmit={handleSignUpSubmit}>
              <input 
                name="emailInput"
                type="email" 
                placeholder="Your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                ref={inputRef}
                required
              />
              <button className="getStartedBtn" type="submit">
                Get Started
              </button>
            </form>
            <p className="text">
              Already have an account?
              <a href="/login"> Log in here</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
