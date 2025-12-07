const Graph = require('./Graph');
const GenderNode = require('./weight_nodes/GenderNode');
const RatingNode = require('./weight_nodes/RatingNode');
const YearNode = require('./weight_nodes/YearNode');

class MotherGraph extends Graph {
    constructor(movies = []) {
        super();
        this.genderGraph = new Graph();
        this.ratingGraph = new Graph();
        this.yearGraph = new Graph();
        this.movies = new Map();

        if (movies && movies.length > 0) {
            this.initializeGraphs(movies);
        }
    }

    addToDirectorGraph(movieId, movie) {
        if (!movie.director) {
            console.warn(`Filme ${movieId} sem diretor definido`);
            return;
        }

        const directorName = movie.director.trim();
        if (!directorName) return;

        // Chave única para este filme
        const movieKey = `movie:${movieId}`;

        // Armazena o diretor junto com o nó (usando nodeData)
        this.directorGraph.addNode(movieKey, { director: directorName });

        // Busca todos os filmes existentes
        const allNodes = this.directorGraph.getAllNodes();

        allNodes.forEach(existingNodeKey => {
            // Verifica se é um nó de filme diferente do atual
            if (existingNodeKey.startsWith("movie:") && existingNodeKey !== movieKey) {
                // Obtém os dados armazenados do filme existente
                const existingData = this.directorGraph.getNodeData(existingNodeKey);

                // Verifica se tem o mesmo diretor
                if (existingData && existingData.director === directorName) {
                    // Conecta os dois filmes com peso 1
                    this.directorGraph.addEdge(movieKey, existingNodeKey, 1);
                }
            }
        });
    }

    addToGenderGraph(movieId, movie) {
        if (!movie.gender) {
            console.warn(`Filme ${movieId} sem gênero definido`);
            return;
        }

        let genderList = [];
        if (Array.isArray(movie.gender)) {
            genderList = movie.gender;
        } else if (typeof movie.gender === 'string') {
            genderList = movie.gender.split(',').map(g => g.trim()).filter(g => g);
        }

        if (genderList.length === 0) return;

        const genderNode = new GenderNode(movieId, genderList);

        const movieKey = `movie:${movieId}`;

        this.genderGraph.addNode(movieKey, genderNode);

        const allNodes = this.genderGraph.getAllNodes();

        allNodes.forEach(existingNodeKey => {
            if (existingNodeKey.startsWith("movie:") && existingNodeKey !== movieKey) {
                const existingNode = this.genderGraph.getNodeData(existingNodeKey);

                if (existingNode instanceof GenderNode) {
                    const existingGenderList = existingNode.getGenderList();

                    const commonGenres = genderList.filter(gender =>
                        existingGenderList.includes(gender)
                    );

                    if (commonGenres.length > 0) {
                        // Calcula o peso como proporção de gêneros em comum
                        // Peso = (gêneros em comum) / (total de gêneros únicos)
                        const uniqueGenres = [...new Set([...genderList, ...existingGenderList])];
                        const weight = commonGenres.length / uniqueGenres.length;

                        this.genderGraph.addEdge(movieKey, existingNodeKey, weight);
                    }
                }
            }
        });
    }

    addToRatingGraph(movieId, movie) {
        const rating = movie.rating || movie.rating === 0 ? parseFloat(movie.rating) : -1;

        const ratingNode = new RatingNode(movieId, rating);

        const movieKey = `movie:${movieId}`;

        this.ratingGraph.addNode(movieKey, ratingNode);

        const allNodes = this.ratingGraph.getAllNodes();

        allNodes.forEach(existingNodeKey => {
            if (existingNodeKey.startsWith("movie:") && existingNodeKey !== movieKey) {
                const existingNode = this.ratingGraph.getNodeData(existingNodeKey);

                if (existingNode instanceof RatingNode) {
                    const existingRating = existingNode.getRating();

                    if (rating < 0 || existingRating < 0) return;

                    // Calcula a média das duas notas
                    const averageRating = rating - existingRating;

                    // Usa a média como peso da aresta
                    const weight = averageRating;

                    // Adiciona aresta bidirecional com o peso calculado
                    this.ratingGraph.addEdge(movieKey, existingNodeKey, weight);
                }
            }
        });
    }

    addToYearGraph(movieId, movie) {
        if (!movie.year) {
            console.warn(`Filme ${movieId} sem ano definido`);
            return;
        }

        const year = parseInt(movie.year);
        if (isNaN(year)) return;

        const yearNode = new YearNode(movieId, year);

        const movieKey = `movie:${movieId}`;

        this.yearGraph.addNode(movieKey, yearNode);

        const allNodes = this.yearGraph.getAllNodes();

        allNodes.forEach(existingNodeKey => {
            if (existingNodeKey.startsWith("movie:") && existingNodeKey !== movieKey) {
                const existingNode = this.yearGraph.getNodeData(existingNodeKey);

                if (existingNode instanceof YearNode) {
                    const existingYear = existingNode.getYear();

                    const yearDifference = Math.abs(year - existingYear);

                    // Usa a função checkProximity do YearNode
                    // Ela retorna um valor que em 2025 vai de 0 a 137
                    // Onde 137 = máxima diferença, 0 = mesmo ano
                    const proximityValue = yearNode.checkProximity(existingYear);

                    const weight = yearDifference === 0 ? 0 : yearDifference;

                    this.yearGraph.addEdge(movieKey, existingNodeKey, weight);
                }
            }
        });
    }

}




module.exports = MotherGraph;