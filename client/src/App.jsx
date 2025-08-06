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
import EditRecipe from "./pages/EditRecipe";
import Err401 from "./pages/Err401";
import Err404 from "./pages/Err404";
import Err403 from "./pages/Err403";
import PrivateRoute from "./components/PrivateRoute"
import GuestRoute  from "./components/GuestRoute";

function App() {
  return (
    <>
      <header>
        <MainNav/>
      </header>
      <Routes>
        {/* public route always accessible */}
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:id" element={<IndividualRecipe />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/unauthorized" element={<Err401 />} />
        <Route path="/forbidden" element={<Err403 />} />
        <Route path="*" element={<Err404 />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* guest only route */}
        <Route path="/" element={<GuestRoute> <Home /> </GuestRoute>} /> 
        <Route path="/login" element={<GuestRoute> <Login /> </GuestRoute>} />
        <Route path="/register" element={<GuestRoute> <Register /> </GuestRoute>} />

        {/* authenticated user route */} 
        <Route path="/dashboard" element={ <PrivateRoute> <UserDashboard /> </PrivateRoute>} /> 
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/create-recipe" element={<CreateRecipe />} />
        <Route path="/user-recipe" element={<UserRecipe />} />
        <Route path="/edit-recipe/:id" element={<EditRecipe />} />

      </Routes>
      <Footer />
    </>
  );
}

export default App;

