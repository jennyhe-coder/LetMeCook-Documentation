import Carousel from "./Carousel";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CarouselSection({
  sectionClass = "",
  title = "",
  dataSource,
}) {
  const sectionRef = useRef();

  useEffect(() => {
    const el = sectionRef.current;

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
          toggleActions: "play reverse play reverse",
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className={`carousel-section ${sectionClass}`}>
      <div className="carousel-section-bg" />
      <div className="layout-wrapper">
        {title && <div className="section-title">{title}</div>}
        <Carousel dataSource={dataSource} />
      </div>
    </section>
  );
}
