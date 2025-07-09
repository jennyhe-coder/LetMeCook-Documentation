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
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import EditProfile from "./pages/EditProfile";
import UserDashboard from "./pages/UserDashboard";
import IndividualRecipe from "./pages/IndividualRecipe";
import Favourites from "./pages/Favourites";
import CreateRecipe from "./pages/CreateRecipe";
import UserRecipe from "./pages/UserRecipe";

function App() {

  return (
    <>
      <header>
        <MainNav/>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />   
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:id" element={<IndividualRecipe />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/create-recipe" element={<CreateRecipe />} />
        <Route path="/user-recipe" element={<UserRecipe />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;

