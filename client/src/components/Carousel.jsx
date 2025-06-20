import { useRef, useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";

const MAX_RECIPES = 20;

const FALLBACK_RECIPE = [
  {
    id: "fallback-01",
    title: "One-Pot Miso-Turmeric Salmon and Coconut Rice",
    imageUrl: "/assets/01.jpg",
    authorName: "Yotam Ottolenghi",
    cookingTime: 90,
  },
  {
    id: "fallback-02",
    title: "Chicken With Tender Lettuce, Peas and Prosciutto",
    imageUrl: "/assets/02.jpg",
    authorName: "Cybelle Tondu",
    cookingTime: 25,
  },
  {
    id: "fallback-03",
    title: "Crispy Halloumi With Tomatoes and White Beans",
    imageUrl: "/assets/03.jpg",
    authorName: "Nargisse Benkabbou",
    cookingTime: 30,
  },
  {
    id: "fallback-04",
    title: "Pasta Primavera",
    imageUrl: "/assets/04.jpg",
    authorName: "Melissa Clark",
    cookingTime: 45,
  },
];

export default function Carousel() {
  const carouselRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStart = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const momentumFrame = useRef(null);
  const resumeTimeout = useRef(null);

  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const dataToRender = (error ? FALLBACK_RECIPE : recipes).slice(
    0,
    MAX_RECIPES
  );

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("https://letmecook.ca/api/recipes?size=20");
        if (!res.ok) throw new Error("Network error");

        const data = await res.json();
        if (!Array.isArray(data.content) || data.content.length === 0) {
          throw new Error("Invalid or empty data");
        }

        setRecipes(data.content);
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    if (loading) return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    const track = carousel.querySelector(".carousel-track");
    if (!track) return;

    let preventClick = false;

    const handleMouseDown = (point, e) => {
      e?.preventDefault();
      isDragging.current = true;
      dragStartX.current = point.pageX;
      scrollStart.current = carousel.scrollLeft;
      lastX.current = point.pageX;
      lastTime.current = performance.now();
      velocity.current = 0;
      preventClick = false;
      cancelAnimationFrame(momentumFrame.current);
      carousel.classList.add("dragging");
    };

    const handleMouseMove = (point) => {
      if (!isDragging.current) return;
      const dx = point.pageX - dragStartX.current;
      if (Math.abs(dx) > 5) preventClick = true;

      const now = performance.now();
      const deltaX = point.pageX - lastX.current;
      const deltaTime = now - lastTime.current;
      if (deltaTime > 0) velocity.current = deltaX / deltaTime;

      carousel.scrollLeft = scrollStart.current - dx;
      lastX.current = point.pageX;
      lastTime.current = now;

      document.body.classList.add("grabbing-cursor");
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      carousel.classList.remove("dragging");

      const applyMomentum = () => {
        if (Math.abs(velocity.current) < 0.01) return;
        carousel.scrollLeft -= velocity.current * 10;
        velocity.current *= 0.95;
        momentumFrame.current = requestAnimationFrame(applyMomentum);
      };
      momentumFrame.current = requestAnimationFrame(applyMomentum);
      document.body.classList.remove("grabbing-cursor");
    };

    const handleClick = (e) => {
      if (preventClick) {
        e.preventDefault();
        e.stopPropagation();
        preventClick = false;
      }
    };

    const onMouseDown = (e) => handleMouseDown(e, e);
    const onTouchStart = (e) => handleMouseDown(e.touches[0], e);
    const onTouchMove = (e) => handleMouseMove(e.touches[0]);

    track.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("click", handleClick, true);
    track.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      track.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("click", handleClick, true);
      track.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", handleMouseUp);

      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
      cancelAnimationFrame(momentumFrame.current);
    };
  }, [loading]);

  return (
    <div className="carousel" ref={carouselRef}>
      {loading ? (
        <div className="carousel-loading">Loading recipes...</div>
      ) : (
        <div className="carousel-track">
          {dataToRender.map((recipe, i) => (
            <RecipeCard
              key={`${recipe.id}-${i}`}
              id={recipe.id}
              title={recipe.title}
              author={recipe.authorName}
              imageUrl={recipe.imageUrl}
              cookingTime={recipe.cookingTime}
            />
          ))}
        </div>
      )}
    </div>
  );
}
