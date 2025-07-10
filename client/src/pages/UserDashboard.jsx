import  { useState, useEffect} from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import CarouselSection from "./../components/CarouselSection";

export default function UserDashboard() {
    const {user} = useAuth();
    const [favourites, setFavourites] = useState([]);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [recipeCreations, setRecipeCreations] = useState([]);
    const [showModal, setShowModal] = useState(false)
    //const [recommendations, setRecommendations] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
            if (!user) {
                setShowModal(true)
            } else {
                fetchFavourites(user.id);
                fetchHistory(user.id);
                fetchCreations(user.id);
                //fetch recommendations(user.id) implement this after AI algorithm is done
            };
        
    },[navigate]);

    const fetchFavourites = async (userId) => {
        let {data, error} =  await supabase
        .from("recipe_favourites")
        .select("recipe_id, recipe(*)")
        .eq("user_id", userId);

        if (data) {
            setFavourites(data.map(r => r.recipe));
        };
        if (error) {
            setError(error.message)
        };
    };

    const fetchHistory = async (userId) => {
        let {data, error} = await supabase 
        .from("recipe_browsing_history")
        .select("recipe_id, recipe(*)")
        .eq("user_id", userId);

        if (data){
            setHistory(data.map(r => r.recipe));
        }
        if (error) {
            setError(error.message);
        }
    };

    const fetchCreations = async (userId) => {
        let {data, error} = await supabase
        .from("recipe")
        .select("*")
        .eq("author_id", userId)
        .order("created_at", {ascending: false});
        if (data) {
            setRecipeCreations(data);
        } 
        if (error) {
            setError(error.message);
        }
    }

    //const fetchRecommendation = async (userId) => {}

    return (
        <>
        <Modal
            isOpen={showModal}
            message={"Please login first."}
            onClose={() => {
                setShowModal(false)
                navigate('/login')
            }}
        />
        { user && 
        <div className="layout">
            <div className="welcome">
              <h2>Welcome back, <span>{user.first_name || user.email}</span>! 👋</h2>
              <p>Here’s your personalized dashboard. Create, view, and manage your recipes easily.</p>
            </div>
            <section>
                <CarouselSection
                    title="Your Own Recipes"
                    sectionClass="section-1"
                    dataSource={`https://letmecook.ca/api/recipes?authorId=${user?.id}`}
                    actionButton={
                        <button
                            onClick={() => navigate('/create-recipe')}
                            className="create-button" >
                                + Add
                        </button>
                    }
                />
            </section>
            <section>
                {/* Have to get the data source for this later */}
                <CarouselSection
                    title="Your Favourites"
                    sectionClass="section-2"
                    dataSource=""
                />
            </section>
            <section>
                {/* Have to get the data source for this later */}
                <CarouselSection
                    title="Recently Viewed"
                    sectionClass="section-3"
                    dataSource=""
                />
            </section>
            <section>
                {/* Have to get the data source for this later */}
                <CarouselSection
                    title="Recommended For You"
                    sectionClass="section-4"
                    dataSource={`http://localhost:8080/api/recipes/recommended-by-id?userid=${user?.id}`}
                />
            </section>
        </div>
        }
        </>
    )
}
