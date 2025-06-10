import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from '../utils/supabaseClient';
import MainNav from "../components/MainNav";
import ReviewList from "../components/ReviewList";
import ReviewForm from "../components/ReviewForm";

export default function IndRecipe() {
    const { id } = useParams(); 
    const [recipe, setRecipe] = useState(null);
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshFlag, setRefreshFlag] = useState(false);

    // fetch user session
    useEffect(() => {
        const getUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Error fetching user:", error.message);
                return;
            }
            setUser(data.user);
            setUserId(data.user.id);
        };

        getUser();
    }, []);

    // fetch recipe data
    useEffect(() => {
        const fetchRecipe = async () => {
            const { data, error } = await supabase
                .from('recipe')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (error) {
                console.error("Error fetching recipe:", error.message);
            } else {
                console.log("Fetched recipe:", data, "Error:", error);
                setRecipe(data);
            }
            setLoading(false);
        };

        if (id) fetchRecipe();
    }, [id]);

    // refresh reviews after adding new reviews 
    const refreshReviews = () => setRefreshFlag(!refreshFlag);

    if (loading) return <p>Loading...</p>;
    if (!recipe) return <p>Recipe not found.</p>;
    if (!user) return <p>You must be signed in to leave a review.</p>;

    return (
        <>
        <div className="layout-wrapper">
            <h2>{recipe.title}</h2>
            <p>{recipe.description}</p>

            <ReviewForm
            recipeId={recipe.id}
            onReviewSubmitted={refreshReviews}
            />
            <ReviewList
            recipeId={recipe.id}
            refreshTrigger={refreshFlag}
            />
        </div>
        </>
    );
}