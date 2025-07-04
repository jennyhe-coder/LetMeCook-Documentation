import { useEffect, useRef } from "react";
import Carousel from "./../components/Carousel";
import { Link } from "react-router-dom";
import SearchBar from "./../components/SearchBar-Home";
import RecipeCard from "./../components/RecipeCard";
import CarouselSection from "./../components/CarouselSection";

export default function Home() {
  const inputRef = useRef();
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <main>
        <section className="prompt-section">
          <div className="layout-wrapper">
            <div className="prompt-desc">
              Let's get cooking! Search for your favourite recipe
            </div>
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
          title="Quick & Easy Meals"
          sectionClass="section-4"
          dataSource="https://letmecook.ca/api/recipes?sort=cookTime&size=20"
        />
      </main>
    </>
  );
}
