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
            <div className="search-container">
              <SearchBar />
            </div>
          </div>
        </section>

        <CarouselSection sectionClass="section-1" />
        <CarouselSection sectionClass="section-2" />
        <CarouselSection sectionClass="section-3" />
        <CarouselSection sectionClass="section-4" />
      </main>
    </>
  );
}
