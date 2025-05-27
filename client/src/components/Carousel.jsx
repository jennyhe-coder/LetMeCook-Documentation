import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const REPEAT_COUNT = 25;
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
  const isHovering = useRef(false);
  const lastScrollTime = useRef(0);
  const resumeTimeout = useRef(null);
  const [isInView, setIsInView] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const dataToRender = error ? FALLBACK_RECIPE : recipes;

  // Build fullList only after loading
  const fullList = [
    ...Array.from({ length: REPEAT_COUNT }).flatMap(() => dataToRender),
    ...dataToRender,
    ...Array.from({ length: REPEAT_COUNT }).flatMap(() => dataToRender),
  ];

  // Fetch
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("https://letmecook.ca/api/recipes");
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("Invalid or empty data");
        }
        setRecipes(data);
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
        setError(true);
      }
    };

    fetchRecipes();
  }, []);

  const handleLoopScroll = () => {
    const carousel = carouselRef.current;
    const item = carousel?.querySelector(".recipe-card");
    if (!carousel || !item) return;

    const itemWidth =
      item.offsetWidth + parseInt(getComputedStyle(item).marginRight || "0");
    const totalItems = fullList.length;
    const totalWidth = itemWidth * totalItems;

    if (carousel.scrollLeft <= 0) {
      carousel.scrollLeft += totalWidth / 2;
    } else if (carousel.scrollLeft + carousel.offsetWidth >= totalWidth) {
      carousel.scrollLeft -= totalWidth / 2;
    }
  };

  // Observer for auto-scroll
  useEffect(() => {
    const carousel = carouselRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.5 }
    );
    if (carousel) observer.observe(carousel);
    return () => observer.disconnect();
  }, []);

  // Initial scroll position (only for real data)
  useEffect(() => {
    if (error) return;

    const carousel = carouselRef.current;
    if (!carousel || dataToRender.length === 0) return;

    const images = Array.from(carousel.querySelectorAll("img"));
    const allImagesLoaded = images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = img.onerror = res;
          })
    );

    Promise.all(allImagesLoaded).then(() => {
      const item = carousel.querySelector(".recipe-card");
      if (!item) return;

      const itemWidth =
        item.offsetWidth + parseInt(getComputedStyle(item).marginRight || "0");
      const totalClones = REPEAT_COUNT * dataToRender.length;
      const scrollTarget = totalClones * itemWidth;

      carousel.scrollLeft = scrollTarget;
      setTimeout(() => setHasLoaded(true), 1000);
    });
  }, [dataToRender]);

  // Auto-scroll
  useEffect(() => {
    if (!hasLoaded) return;
    const carousel = carouselRef.current;
    if (!carousel) return;

    let animationFrame;
    const SCROLL_INTERVAL = 10;
    const SCROLL_STEP = 1;

    const scroll = (time) => {
      if (!isDragging.current && !isHovering.current && isInView) {
        if (time - lastScrollTime.current >= SCROLL_INTERVAL) {
          carousel.scrollLeft += SCROLL_STEP;
          lastScrollTime.current = time;
          handleLoopScroll();
        }
      }
      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasLoaded, isInView]);

  // Drag and touch handlers (same as before, unchanged)
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

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
      handleLoopScroll();
      document.body.classList.add("grabbing-cursor");
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      carousel.classList.remove("dragging");

      const applyMomentum = () => {
        if (Math.abs(velocity.current) < 0.01) return;
        carousel.scrollLeft -= velocity.current * 10;
        velocity.current *= 0.95;
        handleLoopScroll();
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

    const handleEnter = () => {
      isHovering.current = true;
      if (resumeTimeout.current) {
        clearTimeout(resumeTimeout.current);
        resumeTimeout.current = null;
      }
    };

    const handleLeave = () => {
      resumeTimeout.current = setTimeout(() => {
        isHovering.current = false;
      }, 300);
    };

    const onMouseDown = (e) => handleMouseDown(e, e);
    const onTouchStart = (e) => handleMouseDown(e.touches[0], e);
    const onTouchMove = (e) => handleMouseMove(e.touches[0]);

    carousel.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("click", handleClick, true);
    carousel.addEventListener("mouseenter", handleEnter);
    carousel.addEventListener("mouseleave", handleLeave);
    carousel.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      carousel.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("click", handleClick, true);
      carousel.removeEventListener("mouseenter", handleEnter);
      carousel.removeEventListener("mouseleave", handleLeave);
      carousel.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", handleMouseUp);

      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
      cancelAnimationFrame(momentumFrame.current);
    };
  }, []);

  return (
    <div className="carousel" ref={carouselRef}>
      <div className="carousel-track">
        {fullList.map((recipe, i) => (
          <Link
            key={`${recipe.id}-${i}`}
            to={`/recipes/${recipe.id}`}
            className="recipe-card"
          >
            <div className="img-container">
              <img src={recipe.imageUrl} alt={recipe.title} loading="eager" />
            </div>
            <div className="recipe-meta">
              <div className="recipe-title">{recipe.title}</div>
              <p>{recipe.authorName}</p>
              <p>{recipe.cookingTime} min</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
