import Carousel from "./Carousel";

export default function CarouselSection({ sectionClass = "", title = "" }) {
  return (
    <section className={`carousel-section ${sectionClass}`}>
      <div className="carousel-section-bg" />
      <div className="layout-wrapper">
        {title && <div className="section-title">{title}</div>}
        <Carousel />
      </div>
    </section>
  );
}
