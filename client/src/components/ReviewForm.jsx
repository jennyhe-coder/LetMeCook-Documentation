import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import './ReviewForm.css'; 

const ReviewForm = ({ recipeId, onReviewSubmitted }) => {
    const [comment, setComment] = useState('');
    const [ratings, setRatings] = useState({
        cost: 0,
        time: 0,
        difficulty: 0,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleRatingChange = (category, value) => {
        setRatings({ ...ratings, [category]: parseInt(value, 10) });
    };

    // When user clicks on submit review button 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        // get user session information
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error | !user) {
            console.error("User not authenticated:", error.message);
            setSubmitting(false);
            return;
        }

        // Insert new review into reviews table
        const { data: reviewData, error: reviewError } = await supabase
            .from('reviews')
            .insert({
                recipe_id: recipeId,
                user_id: user.id,
                comment,
            })
            .select()
            .single();

        if (reviewError) {
            console.error('Error adding review:', reviewError.message);
            setSubmitting(false);
            return;
        }

        const reviewId = reviewData.id;

        // Insert ratings for each category
        const ratingRows = Object.entries(ratings).map(([category, value]) => ({
            review_id: reviewId,
            category,
            value,
        }));

        // fetch review_ratings table and insert rows 
        const { error: ratingsError } = await supabase
            .from('review_ratings')
            .insert(ratingRows);

        if (ratingsError) {
            console.error('Error adding ratings:', ratingsError.message);
        } else {
            setComment('');
            setRatings({ cost: 0, time: 0, difficulty: 0 });
            onReviewSubmitted?.(); 
        }

        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit}>
        <h3>Leave a Review</h3>
        <textarea
            placeholder="Your comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={10}
            cols={50}
            required
        />
        <div>
            {['cost', 'time', 'difficulty'].map((cat) => (
            <div key={cat}>
                <label>{cat.charAt(0).toUpperCase() + cat.slice(1)} : </label>
                <select
                value={ratings[cat]}
                onChange={(e) => handleRatingChange(cat, e.target.value)}
                required
                >
                <option value="">Select rating</option>
                {[1, 2, 3, 4, 5].map((val) => (
                    <option key={val} value={val}>{val}</option>
                ))}
                </select>
            </div>
            ))}
        </div>
        <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        </form>
    );
};

export default ReviewForm;