class GenderNode{

    #genderList = []
    #movieId = ""

    constructor(movieId,genderList = []){
        this.#genderList = genderList;
        this.#movieId = movieId;
    }

    addGender(gender){
        this.#genderList.push(gender);
    }

    setGenderList(genderList){
        this.#genderList = genderList;
    }

    getGenderList(){
        return this.#genderList;
    }

    isOnTheGenderList(otherGender){
        return this.#genderList.includes(otherGender);
    }

    getMovieId(){
        return this.#movieId;
    }

    setMovieId(movieId){
        this.#movieId = movieId; 
    }
}

module.exports = GenderNode;