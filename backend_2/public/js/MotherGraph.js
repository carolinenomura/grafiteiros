const Graph = require('./Graph');
const GenderNode = require('./weight_nodes/GenderNode');
const RatingNode = require('./weight_nodes/RatingNode');
const YearNode = require('./weight_nodes/YearNode');

class MotherGraph extends Graph {
    constructor(movies = []) {
        super();
        this.genderGraph = new Graph();
        this.ratingGraph = new Graph();
        this.directorGraph = new Graph();
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

    getDirKey(movieId) {
        const dir = this.movies.get(movieId)?.director?.trim();
        return dir ? `director:${dir}:movie:${movieId}` : '';
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

    /**
 * Adiciona um filme a todos os graphs
 * @param {Object} movie - Objeto filme
 */
    addMovieToAllGraphs(movie) {
        if (!movie || !movie.id) {
            console.warn('Filme inválido ou sem ID:', movie);
            return;
        }

        const movieId = movie.id;

        this.movies.set(movieId, {
            id: movieId,
            title: movie.title || '',
            gender: movie.gender || '',
            director: movie.director || '',
            year: movie.year || 0,
            rating: movie.rating || 0
        });

        this.addNode(movieId);

        console.log(movie)

        this.addToDirectorGraph(movieId, movie);

        this.addToGenderGraph(movieId, movie);

        this.addToRatingGraph(movieId, movie);

        this.addToYearGraph(movieId, movie);
    }

    /**
 * Inicializa todos os graphs com a lista de filmes
 * @param {Array} movies - Array de objetos de filmes
 */
    initializeGraphs(movies) {
        movies.forEach(movie => {
            this.addMovieToAllGraphs(movie);
        });
    }

    printGraphs() {
        console.log(this.directorGraph.getAllNodes());
        console.log(this.yearGraph.getAllNodes());
        console.log(this.ratingGraph.getAllNodes());
        console.log(this.genderGraph.getAllNodes());
        console.log(this.movies);
    }

    clearAll() {
        this.adjacencyList.clear();
        this.directorGraph.adjacencyList.clear();
        this.genderGraph.adjacencyList.clear();
        this.ratingGraph.adjacencyList.clear();
        this.yearGraph.adjacencyList.clear();
        this.movies.clear();
    }

    populateMainGraphWithSimilarity() {
        const similarityGraph = this.generateSimilarityGraph();
        const allNodes = similarityGraph.getAllNodes();

        // Copia todas as arestas do grafo de similaridade para o grafo principal
        allNodes.forEach(node => {
            const neighbors = similarityGraph.getNeighbors(node);
            neighbors.forEach(([neighbor, weight]) => {
                // Evita duplicatas
                if (!this.hasEdge(node, neighbor)) {
                    this.addEdge(node, neighbor, weight);
                }
            });
        });

        console.log(`Grafo principal populado com ${similarityGraph.getAllNodes().length} nós`);
    }

    generateSimilarityGraph(min = 0.3) {
        const g = new Graph();
        const movies = [...this.movies.values()];

        movies.forEach(m => g.addNode(m.id));

        movies.forEach((a, i) => {
            movies.slice(i + 1).forEach(b => {
                let sim = 0;
                if (a.director === b.director) sim += 0.2;
                if (Math.abs(a.year - b.year) <= 5) sim += 0.3;
                if (Math.abs(a.rating - b.rating) <= 1) sim += 0.1;

                if (sim >= min) g.addEdge(a.id, b.id, sim);
            });
        });
        return g;
    }

    getCombinedRecommendations(movieIds, minSimilarity = 0.2) {
        // 1. Gerar grafo de similaridade
        const similarityGraph = this.generateSimilarityGraph(minSimilarity);

        // 2. Filtrar candidatos: conectados a pelo menos 2 filmes do cluster
        const candidates = new Map(); // id -> {score, connections}

        similarityGraph.getAllNodes().forEach(candidateId => {
            // Pula se for um dos filmes escolhidos
            if (movieIds.includes(candidateId)) return;

            // Calcula conexões com o cluster
            let totalScore = 0;
            let connectionCount = 0;

            movieIds.forEach(chosenId => {
                const weight = similarityGraph.getWeight(chosenId, candidateId);
                if (weight && weight > minSimilarity) {
                    totalScore += weight;
                    connectionCount++;
                }
            });

            // Só considera se conectado a pelo menos 2 filmes
            if (connectionCount >= 2) {
                candidates.set(candidateId, {
                    score: totalScore,
                    connections: connectionCount,
                    avgScore: totalScore / connectionCount
                });
            }
        });

        // 3. Ordenar candidatos por diferentes critérios
        const candidatesArray = Array.from(candidates.entries())
            .map(([id, data]) => ({ id, ...data }));

        if (candidatesArray.length === 0) {
            return []; // Sem recomendações suficientes
        }

        // 4. Selecionar 4 recomendações diversas
        const recommendations = [];

        // Critério 1: Maior pontuação total (filme que mais agrada o cluster)
        const byTotalScore = [...candidatesArray].sort((a, b) => b.score - a.score);
        if (byTotalScore.length > 0) {
            recommendations.push(byTotalScore[0].id);
        }

        // Critério 2: Melhor média (filme mais consistente)
        const byAvgScore = [...candidatesArray]
            .filter(c => !recommendations.includes(c.id))
            .sort((a, b) => b.avgScore - a.avgScore);
        if (byAvgScore.length > 0) {
            recommendations.push(byAvgScore[0].id);
        }

        // Critério 3: Mais conexões (filme que abrange mais gostos)
        const byConnections = [...candidatesArray]
            .filter(c => !recommendations.includes(c.id))
            .sort((a, b) => b.connections - a.connections);
        if (byConnections.length > 0) {
            recommendations.push(byConnections[0].id);
        }

        // Critério 4: "Surpresa" - bem conectado mas não tão óbvio
        const surpriseCandidates = [...candidatesArray]
            .filter(c => !recommendations.includes(c.id))
            .sort((a, b) => {
                // Prefere filmes com boa média mas não máximo total
                const balanceA = a.avgScore * 0.7 + (a.score / 10) * 0.3;
                const balanceB = b.avgScore * 0.7 + (b.score / 10) * 0.3;
                return balanceB - balanceA;
            });
        if (surpriseCandidates.length > 0) {
            recommendations.push(surpriseCandidates[0].id);
        }

        // Garantir que temos 4 recomendações únicas
        return [...new Set(recommendations)].slice(0, 4);
    }



}




module.exports = MotherGraph;