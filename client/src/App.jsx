import { Routes, Route } from "react-router-dom";
import MainNav from "./components/MainNav";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import SearchResults from "./pages/SearchResults";
import { useEffect, useState } from "react";
import { useApi } from "./utils/Api";
import { useAuth0 } from "@auth0/auth0-react";



function App() {
  const [me, setMe] = useState(null);
  const api = useApi();
  const { isAuthenticated, user } = useAuth0();
  useEffect(() => {
    if(!isAuthenticated) return;
    api.get("/api/me")
    .then((res) => setMe(res.data))
    .catch((err) => console.error("Error fetching user data:", err));
  }, [api, isAuthenticated])

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
      </Routes>
      <Footer />
    </>
  );
}

export default App;
