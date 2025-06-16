import Carousel from "./Carousel";

export default function CarouselSection({ sectionClass = "" }) {
  return (
    <section className={`carousel-section ${sectionClass}`}>
      <div className="carousel-section-bg" />
      <div className="layout-wrapper">
        <Carousel />
      </div>
    </section>
  );
}
