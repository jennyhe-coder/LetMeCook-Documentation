import { useEffect, useRef } from "react";
import Carousel from "./../components/Carousel";
import { Link } from "react-router-dom";
import SearchBar from "./../components/SearchBar-Home";
import { useAuth0 } from "@auth0/auth0-react";

export default function Home() {
  const inputRef = useRef();
  const { loginWithRedirect } = useAuth0();
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="wave">
          <div className="wave-padding"></div>
          <svg
            id="visual"
            viewBox="0 0 900 600"
            width="900"
            height="600"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
          >
            <path
              d="M0 165L10 165.8C20 166.7 40 168.3 60 178.8C80 189.3 100 208.7 120 215.2C140 221.7 160 215.3 180 209.2C200 203 220 197 240 200.2C260 203.3 280 215.7 300 206.8C320 198 340 168 360 164.3C380 160.7 400 183.3 420 196C440 208.7 460 211.3 480 208.5C500 205.7 520 197.3 540 192.8C560 188.3 580 187.7 600 186.7C620 185.7 640 184.3 660 189C680 193.7 700 204.3 720 199.2C740 194 760 173 780 175C800 177 820 202 840 214.3C860 226.7 880 226.3 890 226.2L900 226L900 0L890 0C880 0 860 0 840 0C820 0 800 0 780 0C760 0 740 0 720 0C700 0 680 0 660 0C640 0 620 0 600 0C580 0 560 0 540 0C520 0 500 0 480 0C460 0 440 0 420 0C400 0 380 0 360 0C340 0 320 0 300 0C280 0 260 0 240 0C220 0 200 0 180 0C160 0 140 0 120 0C100 0 80 0 60 0C40 0 20 0 10 0L0 0Z"
              fill="#ee889d"
            ></path>
            <path
              d="M0 131L10 128.8C20 126.7 40 122.3 60 130.8C80 139.3 100 160.7 120 162.7C140 164.7 160 147.3 180 135.3C200 123.3 220 116.7 240 125.3C260 134 280 158 300 162.5C320 167 340 152 360 150.3C380 148.7 400 160.3 420 156C440 151.7 460 131.3 480 126.5C500 121.7 520 132.3 540 135.2C560 138 580 133 600 128.5C620 124 640 120 660 124.5C680 129 700 142 720 146.8C740 151.7 760 148.3 780 143.8C800 139.3 820 133.7 840 131C860 128.3 880 128.7 890 128.8L900 129L900 0L890 0C880 0 860 0 840 0C820 0 800 0 780 0C760 0 740 0 720 0C700 0 680 0 660 0C640 0 620 0 600 0C580 0 560 0 540 0C520 0 500 0 480 0C460 0 440 0 420 0C400 0 380 0 360 0C340 0 320 0 300 0C280 0 260 0 240 0C220 0 200 0 180 0C160 0 140 0 120 0C100 0 80 0 60 0C40 0 20 0 10 0L0 0Z"
              fill="#ee889d"
            ></path>
            <path
              d="M0 137L10 129.8C20 122.7 40 108.3 60 100.8C80 93.3 100 92.7 120 93.7C140 94.7 160 97.3 180 94.5C200 91.7 220 83.3 240 91.3C260 99.3 280 123.7 300 125.3C320 127 340 106 360 93.5C380 81 400 77 420 76.8C440 76.7 460 80.3 480 88.2C500 96 520 108 540 109C560 110 580 100 600 103.5C620 107 640 124 660 121.8C680 119.7 700 98.3 720 94.8C740 91.3 760 105.7 780 110.7C800 115.7 820 111.3 840 114C860 116.7 880 126.3 890 131.2L900 136L900 0L890 0C880 0 860 0 840 0C820 0 800 0 780 0C760 0 740 0 720 0C700 0 680 0 660 0C640 0 620 0 600 0C580 0 560 0 540 0C520 0 500 0 480 0C460 0 440 0 420 0C400 0 380 0 360 0C340 0 320 0 300 0C280 0 260 0 240 0C220 0 200 0 180 0C160 0 140 0 120 0C100 0 80 0 60 0C40 0 20 0 10 0L0 0Z"
              fill="#ee889d"
            ></path>
            <path
              d="M0 90L10 81.8C20 73.7 40 57.3 60 52.2C80 47 100 53 120 57.8C140 62.7 160 66.3 180 67C200 67.7 220 65.3 240 61.2C260 57 280 51 300 49.2C320 47.3 340 49.7 360 59.5C380 69.3 400 86.7 420 87.8C440 89 460 74 480 67.3C500 60.7 520 62.3 540 61.7C560 61 580 58 600 54.7C620 51.3 640 47.7 660 53.3C680 59 700 74 720 84.7C740 95.3 760 101.7 780 100C800 98.3 820 88.7 840 81.8C860 75 880 71 890 69L900 67L900 0L890 0C880 0 860 0 840 0C820 0 800 0 780 0C760 0 740 0 720 0C700 0 680 0 660 0C640 0 620 0 600 0C580 0 560 0 540 0C520 0 500 0 480 0C460 0 440 0 420 0C400 0 380 0 360 0C340 0 320 0 300 0C280 0 260 0 240 0C220 0 200 0 180 0C160 0 140 0 120 0C100 0 80 0 60 0C40 0 20 0 10 0L0 0Z"
              fill="#f79dac"
            ></path>
            <path
              d="M0 11L10 10.5C20 10 40 9 60 14.8C80 20.7 100 33.3 120 38.3C140 43.3 160 40.7 180 43.3C200 46 220 54 240 50.2C260 46.3 280 30.7 300 32C320 33.3 340 51.7 360 59C380 66.3 400 62.7 420 55.5C440 48.3 460 37.7 480 34.8C500 32 520 37 540 34.2C560 31.3 580 20.7 600 21.5C620 22.3 640 34.7 660 44.7C680 54.7 700 62.3 720 56.8C740 51.3 760 32.7 780 25.8C800 19 820 24 840 26.5C860 29 880 29 890 29L900 29L900 0L890 0C880 0 860 0 840 0C820 0 800 0 780 0C760 0 740 0 720 0C700 0 680 0 660 0C640 0 620 0 600 0C580 0 560 0 540 0C520 0 500 0 480 0C460 0 440 0 420 0C400 0 380 0 360 0C340 0 320 0 300 0C280 0 260 0 240 0C220 0 200 0 180 0C160 0 140 0 120 0C100 0 80 0 60 0C40 0 20 0 10 0L0 0Z"
              fill="#ffb2bc"
            ></path>
          </svg>
        </div>
        <div className="layout-wrapper">
          <div className="hero-box">
            <div className="dotted-box">
              <div className="main-container">
                <div className="main-text-hero">
                  <h1>
                    <span>LET</span>
                    <br></br>
                    <span>ME COOK</span>
                  </h1>
                </div>
                <hr className="dotted-divider" />
                <div className="desc-text-hero">
                  <span>Millions of Recipes Lorem Ipsum</span>
                  <br></br>
                  <span>Ut Aliquet Egestas Dolor Sit Amet Vulputate</span>
                </div>
              </div>
              <div className="thumbnail-container">
                <div className="box box-1"></div>
                <div className="box box-2"></div>
                <div className="box box-3"></div>
                <div className="box box-4"></div>
                <div className="box box-5"></div>
                <div className="box box-6"></div>
                <div className="box box-7"></div>
                <div className="box box-8"></div>
                <div className="box box-9"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main>
        <div className="layout-wrapper">
          <section className="search-box-container">
            <div className="search-box-text">
              <div>
                <span>
                  <h3>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="80"
                      height="20"
                      viewBox="0 0 80 20"
                      fill="none"
                    >
                      <path
                        d="M9.77474 5.72736C8.91257 8.05504 12.569 9.79605 14.373 8.3654C16.926 6.34074 14.9553 2.83835 12.0739 2.15827C6.66938 1.18271 1.88331 4.83927 2.00217 9.76201C2.1044 13.9962 5.0282 16.2781 8.48149 17.2187C10.1492 17.6729 11.8858 17.9466 12.936 17.9865C26.4434 18.5002 44.7895 4.18191 63.3081 4.74657C67.6927 4.88026 78 6.50325 78 12.5602C77.8263 15.043 76.15 17.3541 73.2376 17.0523M73.2376 17.0523C73.0821 17.0362 72.9228 17.0136 72.7597 16.9841M73.2376 17.0523C73.0766 17.0446 72.9168 17.0212 72.7597 16.9841M72.7597 16.9841C70.8063 16.5231 69.6893 13.7726 71.42 12.4C72.6429 11.4302 74.6081 12.6116 73.7191 14.4174"
                        stroke="#E64824"
                        strokeWidth="3"
                      />
                    </svg>
                    &nbsp;&nbsp;What's in your pantry?
                  </h3>
                </span>
                <span>
                  <h3>Let's make something tasty!</h3>
                </span>
                <div className="desc">
                  Turn those ingredients into family favourites
                </div>
              </div>
              <div className="search-container">
                <SearchBar />
                <div className="powered-by">Powered by AI</div>
              </div>
            </div>
            <div className="search-box-image">
              <img src="/assets/srchbximg.jpg"></img>
            </div>
          </section>
        </div>

        <div className="section-line"></div>

        <section className="trending-recipes">
          <div className="layout-wrapper">
            <header className="section-header">
              <h2>Popular This Week</h2>
              <p>Lorem ipsum dolor sit amet!</p>
            </header>
          </div>

          <div className="see-all layout-wrapper">
            <Link to="/recipes">
              <span>See all recipes {">>"}</span>
            </Link>
          </div>
          <Carousel />
        </section>

        <div className="section-line"></div>

        <section className="join-banner">
          <div className="layout-wrapper join-box">
            <div className="one">
              <img className="one-one" src="assets/join02.jpg" />
              <img className="one-two" src="assets/join03.jpg" />
              <div className="one-three">
                <button
                  onClick={() =>
                    loginWithRedirect({
                      authorizationParams: {
                        screen_hint: "signup",
                      },
                    })
                  }
                >
                  SIGN UP
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                  >
                    <g clip-path="url(#clip0_30_137)">
                      <path
                        d="M18.75 10.4167V14.5834H32.4792L8.33334 38.7292L11.2708 41.6667L35.4167 17.5209V31.2501H39.5833V10.4167H18.75Z"
                        fill="#EF9FA9"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_30_137">
                        <rect width="50" height="50" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </div>
            </div>
            <div className="two">
              <div className="join-box-header">JOIN THE COMMUNITY</div>
              <div className="join-box-text">
                <p>
                  Get personalized recipes tailored to you. Save, ipsum dolor
                  sit amet, consectetur
                </p>
              </div>
              <img src="assets/join01.jpg" />
            </div>
          </div>
        </section>
        <div className="section-line"></div>
      </main>
    </>
  );
}
