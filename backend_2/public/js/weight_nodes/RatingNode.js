class RatingNode{

    #rating = -1;
    #movieId = "";

    constructor(movieId,rating = -1){
        this.#movieId = movieId;
        this.#rating = rating;
    }

    getRating(){
        return this.#rating;
    }

    setRating(rating){
        this.#rating = rating;
    }

    getMovieId(){
        return this.#movieId;
    }

    setMovieId(movieId){
        this.#movieId = movieId; 
    }

}

module.exports = RatingNode;