import React from "react";
import  { useState, useEffect} from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";

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
            <h2>Welcome, {user? user.first_name || user.email : "User"}!</h2>
            <section>
                <h3>Your Favourites</h3>
                <div className="carousel"/>
            </section>
            <section>
                <h3>Recently Viewed</h3>
                <div className="carousel" emptyMsg="No browsing history." />
            </section>
            <section>
                <h3>Your Own Recipes</h3>
                <div className="carousel"/>
            </section>
            <section>
                <h3>Recommended For You</h3>
                <div className="carousel"/>
            </section>
        </div>
        }
        </>
    )




}
