class YearNode{

    #year = -1;
    #movieId = "";

    constructor(movieId,year){
        this.#movieId = movieId;
        this.#year = year;
    }

    getYear(){
        return this.#year;
    }

    setYear(year){
        this.#year = year;
    }

    checkProximity(otherYear){
        let actualYear = new Date().getFullYear();
        let yearsRange = actualYear - 1888 //ano do primeiro filme já criado

        return (yearsRange - (Math.abs(this.#year - otherYear))); //retorna um numero parametrizado que em 2025 vai de 0 até 137, sendo que 137 indica diferença máxima de anos e 0 significa do mesmo ano
    }

    getMovieId(){
        return this.#movieId;
    }

    setMovieId(movieId){
        this.#movieId = movieId; 
    }
}

module.exports = YearNode;