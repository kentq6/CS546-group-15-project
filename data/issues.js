//Export the following functions using ES6 Syntax
import { movies } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import moment from 'moment';
import inputValidation from '../helpers.js';
import { updateOverallRating } from '../helpers.js'; 

const exportedMethods = {
  async createReview(
    movieId,
    reviewTitle,
    reviewerName,
    review,
    rating
  ) {
    // checks if movieId is valid
    movieId = inputValidation.isValidId(movieId, 'movieId');

    // checks if all other inputs are valid
    const validatedInputs = inputValidation.isValidReview(
      reviewTitle,
      reviewerName,
      review,
      rating
    );
    
    // gets current date
    const currentDate = moment().format('MM/DD/YYYY');
  
    // creates review
    const newReview = {
      _id: new ObjectId(),
      reviewTitle: validatedInputs.reviewTitle,
      reviewDate: currentDate,
      reviewerName: validatedInputs.reviewerName,
      review: validatedInputs.review,
      rating: validatedInputs.rating
    };
  
    // gets movie collection from database
    const movieCollection = await movies();

    // finds movie with matching movieId and add to reviews
    const movie = await movieCollection.findOne({_id: new ObjectId(movieId)});
    
    // checks if movie exists
    if (!movie) throw `Error: Could not find movie with id ${movieId}!`;

    // adds all existing reviews and new review into an array
    const allReviews = [...movie.reviews, newReview];
    // computes the sum of all the review ratings in allReviews 
    const sumOfRatings = allReviews.reduce((sum, review) => sum + review.rating, 0);
    // calculates new overallRating of movieId
    const newOverallRating = parseFloat((sumOfRatings / allReviews.length).toFixed(1));

    // adds review and updates overallRating
    const updatedMovie = await movieCollection.findOneAndUpdate(
      {_id: new ObjectId(movieId)},
      {
        $push: {reviews: newReview},
        $set: {overallRating: newOverallRating}
      },
      {returnDocument: 'after'}
    );

    // checks if review was added to movie
    if (!updatedMovie) throw 'Error: Movie could not be updated with new review!';

    // returns ONLY the review object, not all the movie data
    return newReview;
  },
  async getAllReviews(movieId) {
    /* checks if movieId:
      1. is not provided
      2. is not a string or is an empty string
    */
    movieId = inputValidation.isValidId(movieId, 'movieId');
    
    // gets movie collection from database
    const movieCollection = await movies();
    // finds movie with matching movieId
    const movie = await movieCollection.findOne({_id: new ObjectId(movieId)});
  
    // checks if movie exists with movieId
    if (!movie) throw `Error: Could not find movie with id of ${movieId}`;

    // if no reviews, return empty array
    if (movie.reviews.length === 0) 
      return [];
  
    // returns only the reviews array
    return movie.reviews;
  },
  async getReview(reviewId) {
    /* checks if reviewId:
      1. is not provided
      2. is not a string or is an empty string
      3. is not a valid ObjectId
    */
    reviewId = inputValidation.isValidId(reviewId, 'reviewId');
  
    // gets movie collection from database
    const movieCollection = await movies();
    // returns review object with matching reviewId
    const foundReview = await movieCollection.findOne(
      {'reviews._id': new ObjectId(reviewId)},
      {projection: {_id: 0, 'reviews.$': 1}}
    );
  
    // checks if review exists with that id
    if (!foundReview) throw 'Error: Review not found!';
  
    // returns review object
    return foundReview.reviews[0];
  },  
  async removeReview(reviewId) {
    /* checks if reviewId:
      1. is not provided
      2. is not a string or is an empty string
      3. is not a valid ObjectId
    */
    reviewId = inputValidation.isValidId(reviewId, 'reviewId');
  
    // gets movie collection from database
    const movieCollection = await movies();

    // finds movie with matching movieId and add to reviews
    const movie = await movieCollection.findOne({'reviews._id': new ObjectId(reviewId)});
    
    // checks if review exists
    if (!movie) throw `Error: Could not find review with id ${reviewId}!`;

    // removes review with reviewId from array of reviews
    const allReviews = movie.reviews.filter(review => review._id.toString() !== reviewId);    
    // computes the sum of all the review ratings in allReviews 
    const sumOfRatings = allReviews.reduce((sum, review) => sum + review.rating, 0);
    // calculates new overallRating of movieId
    let newOverallRating = 0;
    if (allReviews.length > 0)
      newOverallRating = parseFloat((sumOfRatings / allReviews.length).toFixed(1));

    // returns review object with matching reviewId
    const updatedInfo = await movieCollection.findOneAndUpdate(
      {'reviews._id': new ObjectId(reviewId)},
      {
        $pull: {reviews: {_id: new ObjectId(reviewId)}},
        $set: {overallRating: newOverallRating}
      },
      {returnDocument: 'after'}
    );

    // checks if movie could be updated
    if (!updatedInfo) throw 'Error: Movie could not be updated!';

    // returns movie object that the review was removed from
    return updatedInfo;
  },
};

export default exportedMethods;