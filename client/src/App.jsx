import { Routes, Route } from "react-router-dom";
import MainNav from "./components/MainNav";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import SearchResults from "./pages/SearchResults";
import Contact from './pages/Contact';
import About from './pages/About';
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Profile from "./pages/Profile";
import { useEffect, useState } from "react";
import { useApi } from "./utils/Api";
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const [me, setMe] = useState(null);
  const api = useApi();
  const { isAuthenticated, getAccessTokenSilently} = useAuth0();

  useEffect(() => {
    if(!isAuthenticated) return;
    api.get("/api/me")
    .then((res) => setMe(res.data))
    .catch((err) => console.error("Error fetching user data:", err));
    getAccessTokenSilently() //this is temp just for testing 
      .then(token => {
        console.log("Access Token: ",token);
      }) .catch(err => console.error("Token fetch error:", err));
  }, [api, isAuthenticated, getAccessTokenSilently]);


  return (
    <>
      <header>
        <MainNav user ={me}/>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />   
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;

