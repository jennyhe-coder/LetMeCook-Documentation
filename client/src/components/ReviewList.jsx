import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const ReviewList = ({ recipeId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // render the stars for the categories 
    const renderStars = (value) => {
        return '★'.repeat(value) + '☆'.repeat(5 - value);
    };

    // fetch user session
    useEffect(() => {
        const getUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Error fetching user:", error.message);
                return;
            }
            setUser(data.user);
        };

        getUser();
    }, []);

    // fetch recipe reviews and review categories 
    useEffect(() => {
        const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reviews')
            .select('id, comment, created_at, user_id, review_ratings:review_ratings(value, category)')
            .eq('recipe_id', recipeId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error.message);
        } else {
            setReviews(data);
            console.log("Reviews with ratings:", data);
        }
        setLoading(false);
        };

        if (recipeId) fetchReviews();
    }, [recipeId]);

    if (loading) return <p>Loading reviews...</p>;
    if (!reviews.length) return <p>No reviews yet for this recipe.</p>;

    return (
        <div>
        <h3>Reviews</h3>
        <ul>
           {reviews.map((review) => {
                const identity = user?.identities?.[0]?.identity_data;
                const firstName = identity?.first_name || '';
                const lastName = identity?.last_name || '';
                const ratings = review.review_ratings || [];

                return (
                    <ul key={review.id}>
                        <div>
                            {ratings.map(({ category, value }) => (
                                <p key={ category }>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}: {renderStars(value)}
                                </p>
                            ))}
                        </div>
                        <p>{review.comment || '(No comment)'}</p>
                        <small>
                            Posted by {firstName} {lastName} on {new Date(review.created_at).toLocaleDateString()}
                        </small>
                    </ul>
                );
            })}
        </ul>
        </div>
    );
};

export default ReviewList;
