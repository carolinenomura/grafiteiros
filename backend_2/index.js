const express = require("express");
require('dotenv').config();
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");

const Movie = require("./movies/Movie");

//definindo o ejs como view engine
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

const MoviesController = require("./movies/MoviesController.js");

app.use("/", MoviesController);

const MotherGraph = require('./public/js/MotherGraph.js');
let motherGraph = null;

app.get("/graphs", async (req, res) => {
    // Carrega ou cria MotherGraph
    if (!motherGraph) {
        motherGraph = new MotherGraph();
        const movies = await Movie.findAll();
        
        // Extrai apenas os dataValues de cada objeto Sequelize
        const data = movies.map(m => ({
            id: m.id,
            title: m.title,
            gender: m.gender,
            director: m.director,
            year: m.year,
            rating: m.rating
        }));
        
        console.log("Filmes extraídos:", data); // Verifique aqui
        
        motherGraph.initializeGraphs(data);
        motherGraph.populateMainGraphWithSimilarity();
    }
    
    // Função auxiliar
    const getGraphData = (g) => {
        const result = {};
        g.getAllNodes().forEach(node => {
            result[node] = g.getNeighbors(node);
        });
        return result;
    };
    
    // Retorna JSON
    res.json({
        main: getGraphData(motherGraph),
        director: getGraphData(motherGraph.directorGraph),
        gender: getGraphData(motherGraph.genderGraph),
        year: getGraphData(motherGraph.yearGraph),
        rating: getGraphData(motherGraph.ratingGraph)
    });
});

app.post("/recommendations", async (req, res) => {
    try {
        const { movie_ids } = req.body;
        
        if (!movie_ids || !Array.isArray(movie_ids) || movie_ids.length !== 4) {
            return res.status(400).json({ 
                error: "Forneça exatamente 4 IDs de filmes" 
            });
        }
        
        // Garantir que MotherGraph existe
        if (!motherGraph) {
            motherGraph = new MotherGraph();
            const movies = await Movie.findAll({ raw: true });
            const data = movies.map(m => ({ ...m }));
            motherGraph.initializeGraphs(data);
        }
        
        // Obter recomendações
        const recommendedIds = motherGraph.getCombinedRecommendations(movie_ids);
        
        // Buscar dados completos dos filmes recomendados
        const recommendations = await Promise.all(
            recommendedIds.map(id => 
                Movie.findByPk(id, { 
                    attributes: ['id', 'title', 'director', 'year', 'rating', 'gender']
                })
            )
        );
        
        // Filtrar nulos (se algum ID não existir)
        const validRecommendations = recommendations.filter(movie => movie !== null);
        
        res.json({
            success: true,
            chosen_movies: movie_ids,
            recommendations: validRecommendations.map(movie => ({
                id: movie.id,
                title: movie.title,
                director: movie.director,
                year: movie.year,
                rating: movie.rating,
                gender: movie.gender,
                why: "Recomendado baseado na similaridade com seus filmes escolhidos"
            }))
        });
        
    } catch (error) {
        console.error("Erro nas recomendações:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

//conexão com banco de dados
connection.authenticate().then(() => {
    console.log("bd on");
}).catch((errorMsg) => {
    console.log(errorMsg);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("server ta on");
});