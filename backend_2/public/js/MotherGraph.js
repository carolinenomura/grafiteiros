const Graph = require('./Graph');
const GenderNode = require('./weight_nodes/GenderNode');
const RatingNode = require('./weight_nodes/RatingNode');
const YearNode = require('./weight_nodes/YearNode');

// --- FUNÇÃO AUXILIAR (Fora da Classe) ---
// Calcula o quanto duas listas de texto se parecem (0.0 até 1.0)
function calculateJaccardIndex(strA, strB) {
    // Se algum dos dois for vazio ou nulo, não tem similaridade
    if (!strA || !strB) return 0;
    
    // 1. Limpa os dados: " Ação, Drama " vira ['ação', 'drama']
    const cleanList = (str) => str.toLowerCase().split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    const listA = cleanList(strA);
    const listB = cleanList(strB);

    if (listA.length === 0 || listB.length === 0) return 0;

    const setA = new Set(listA);
    const setB = new Set(listB);

    // 2. Interseção: Itens que existem nos DOIS
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    
    // 3. União: Total de itens únicos juntando os dois
    const union = new Set([...setA, ...setB]);

    // 4. Cálculo: (O que tem em comum) / (Total de coisas)
    return intersection.size / union.size;
}

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

        // --- CORREÇÃO AQUI ---
        // Você precisa mapear os novos campos do banco para a memória do Grafo
        this.movies.set(movieId, {
            id: movieId,
            title: movie.title || '',
            gender: movie.gender || '',
            director: movie.director || '',
            year: movie.year || 0,
            rating: movie.rating || 0,
            // ADICIONE ESTAS LINHAS:
            cast: movie.cast || '', 
            tags: movie.tags || '',
            poster_path: movie.poster_path || ''
        });

        this.addNode(movieId);

        // ... resto da função continua igual ...
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

    generateSimilarityGraph(min = 0.1) {
        const g = new Graph();
        const movies = [...this.movies.values()];

        // Adiciona todos os nós
        movies.forEach(m => g.addNode(m.id));

        // Compara todo mundo com todo mundo (O(n^2))
        movies.forEach((a, i) => {
            movies.slice(i + 1).forEach(b => {
                let sim = 0;

                // 1. DIRETOR (Peso: 0.3)
                // Se for o mesmo diretor, já garante uma boa base
                if (a.director && b.director && a.director === b.director) {
                    sim += 0.3;
                }

                // 2. GÊNEROS (Peso: 0.2)
                // Usa Jaccard para ver sobreposição de temas
                // "gender" é como está no seu banco, embora o correto em inglês seja "genre"
                if (a.gender && b.gender) {
                    sim += calculateJaccardIndex(a.gender, b.gender) * 0.2;
                }

                // 3. ELENCO / CAST (Peso: 0.2) - NOVO!
                // Se tiver atores em comum
                if (a.cast && b.cast) {
                    sim += calculateJaccardIndex(a.cast, b.cast) * 0.2;
                }

                // 4. TAGS / KEYWORDS (Peso: 0.4) - NOVO E IMPORTANTE!
                // É o peso mais alto porque define o assunto do filme
                if (a.tags && b.tags) {
                     sim += calculateJaccardIndex(a.tags, b.tags) * 0.4;
                }

                // 5. AJUSTES FINOS (Ano e Nota)
                // Diferença de ano (máximo 5 anos)
                if (Math.abs(a.year - b.year) <= 5) sim += 0.05;
                
                // Diferença de nota (máximo 1 ponto)
                if (Math.abs(a.rating - b.rating) <= 1.0) sim += 0.05;

                // Cria a conexão se atingir o mínimo
                if (sim >= min) {
                    g.addEdge(a.id, b.id, sim);
                }
            });
        });
        return g;
    }

    getCombinedRecommendations(movieIds) {
        // 1. Gera o grafo atualizado com as novas regras
        const similarityGraph = this.generateSimilarityGraph(0.1);
        
        const candidates = new Map(); // ID -> Pontuação

        // 2. Soma os pesos dos vizinhos
        movieIds.forEach(sourceId => {
            const neighbors = similarityGraph.getNeighbors(sourceId);
            
            neighbors.forEach(([candidateId, weight]) => {
                // Ignora filmes que o usuário já escolheu
                if (movieIds.includes(candidateId)) return;

                const currentScore = candidates.get(candidateId) || 0;
                candidates.set(candidateId, currentScore + weight);
            });
        });

        // 3. Ordena e retorna
        const sortedCandidates = Array.from(candidates.entries())
            .map(([id, score]) => ({ id, score }))
            .sort((a, b) => b.score - a.score);

        // Retorna apenas os IDs
        return sortedCandidates.slice(0, 4).map(c => c.id);
    }

    getDetailedExplanation(sourceIds, targetId) {
        // Pega o objeto do filme alvo
        const targetMovie = this.movies.get(targetId);
        if (!targetMovie) return { totalScore: 0, matches: [] }; // Retorna objeto vazio para não quebrar

        let report = {
            totalScore: 0,
            matches: []
        };

        // Compara o filme alvo contra CADA um dos filmes que o usuário escolheu
        sourceIds.forEach(sourceId => {
            const sourceMovie = this.movies.get(sourceId);
            if (!sourceMovie) return;

            let interactionScore = 0;
            let reasons = [];

            // 1. Análise de Diretor (Peso 0.3)
            if (sourceMovie.director === targetMovie.director) {
                interactionScore += 0.3;
                reasons.push(`Mesmo nó de Diretor (${sourceMovie.director}) [+0.3]`);
            }

            // 2. Análise de Tags via Jaccard (Peso 0.4)
            if (sourceMovie.tags && targetMovie.tags) {
                const jaccardTags = calculateJaccardIndex(sourceMovie.tags, targetMovie.tags);
                const scoreTags = jaccardTags * 0.4;
                if (scoreTags > 0) {
                    interactionScore += scoreTags;
                    reasons.push(`Índice Jaccard de Tags: ${jaccardTags.toFixed(2)} (Peso 0.4) [+${scoreTags.toFixed(2)}]`);
                }
            }

            // 3. Análise de Elenco via Jaccard (Peso 0.2)
            if (sourceMovie.cast && targetMovie.cast) {
                const jaccardCast = calculateJaccardIndex(sourceMovie.cast, targetMovie.cast);
                const scoreCast = jaccardCast * 0.2;
                if (scoreCast > 0) {
                    interactionScore += scoreCast;
                    reasons.push(`Interseção de Elenco: ${jaccardCast.toFixed(2)} (Peso 0.2) [+${scoreCast.toFixed(2)}]`);
                }
            }

            // 4. Gênero (Peso 0.2)
            if (sourceMovie.gender && targetMovie.gender) {
                const jaccardGenre = calculateJaccardIndex(sourceMovie.gender, targetMovie.gender);
                const scoreGenre = jaccardGenre * 0.2;
                if (scoreGenre > 0) {
                    interactionScore += scoreGenre;
                    reasons.push(`Similaridade de Gênero: ${jaccardGenre.toFixed(2)} [+${scoreGenre.toFixed(2)}]`);
                }
            }

            // Só adiciona ao relatório se houve alguma conexão
            if (interactionScore > 0) {
                report.totalScore += interactionScore;
                report.matches.push({
                    connectedWith: sourceMovie.title,
                    scoreContributed: interactionScore.toFixed(2),
                    details: reasons.join(", ")
                });
            }
        });

        return report;
    }

}




module.exports = MotherGraph;