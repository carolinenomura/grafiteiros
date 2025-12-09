const express = require("express");
const router = express.Router();
const Movie = require("./Movie");
const Sequelize = require("sequelize");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Op = Sequelize.Op;


const MotherGraph = require("../public/js/MotherGraph");

router.get("/movies", (req,res) => {
    Movie.findAll().then((movies) => {
        if(movies !== null){
            res.statusCode = 200;
            res.json(movies);
        }else{
            res.sendStatus(404);
        }
    });
});

() => {}

// Rota de Busca para o Modal 
router.get("/movies/search", (req, res) => {
    const query = req.query.q;
    
    if (!query) {
        return res.status(400).json({ error: "Termo de busca vazio" });
    }

    Movie.findAll({
        where: {
            title: {
                [Op.like]: `%${query}%` // Busca parcial (ex: "Aveng" acha "Avengers")
            }
        },
        limit: 10 // Limita para não travar o modal
    }).then(movies => {
        res.json(movies);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

router.get("/movies/:id", (req,res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);

        Movie.findOne({where: {id:id}}).then((movie) => {
            if(movie !== null){
                res.statusCode = 200;
                res.json(movie);
            }else{
                res.sendStatus(404);
            }
        });
    }
});

router.delete("/movie/:id", (req,res) => {
    if(isNaN(req.params.id) || !req.params.id){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        Movie.destroy({where: { id : id }})
            .then(() => {
                res.sendStatus(204);
            }).catch((error => {
                console.log(error);
                res.sendStatus(404);
            }));
    }
});

router.post("/movie", (req,res) => {
    var {title, gender, director, year, rating} = req.body;
    if(isNaN(year) || isNaN(rating) || (title === undefined) || (gender === undefined) || (director === undefined)){
        res.sendStatus(400);
    }else{
        Movie.findOne({where: {title:title} }).then((movie) => {
            if(movie ===null){
                Movie.create({
                    title : title,
                    gender: gender,
                    director: director,
                    year: year,
                    rating: rating
                }).then(() => {
                    res.sendStatus(201);
                }).catch((error) => {
                    console.log(error);
                    res.sendStatus(400);
                });
            }else{
                res.sendStatus(409);
            }
        });
    }
});

router.put("/movie/:id", (req,res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);

        Movie.findOne({ where : { id : id}}).then((movie) => {
            if(movie !== null){
                var {title, gender, director, year, rating} = req.body;
                if(title !== undefined){
                    movie.title = title;
                }
                if(gender !== undefined){
                    movie.gender = gender;
                }
                if(director !== undefined){
                    movie.director = director;
                }
                if(year !== undefined){
                    if(isNaN(year)){
                        res.sendStatus(400);
                    }else{
                        movie.year = year;
                    }
                }
                if(rating !== undefined){
                    if(isNaN(rating)){
                        res.sendStatus(400);
                    }else{
                        movie.rating = rating
                    }
                }
                movie.save();
                res.sendStatus(200);
            }else{
                res.sendStatus(404);
            }
        });
    }
});

router.post("/movies/batch", async (req, res) => {
    try {
        const movies = req.body;
        
        if (!Array.isArray(movies)) {
            return res.status(400).json({ error: "Envie um array de filmes" });
        }
        
        const results = await Promise.allSettled(
            movies.map(async (movie) => {
                // Verifica dados básicos
                if (!movie.title || !movie.director) {
                    throw new Error("Dados incompletos");
                }
                
                // Verifica se já existe
                const exists = await Movie.findOne({ where: { title: movie.title } });
                if (exists) {
                    throw new Error("Filme já existe");
                }
                
                // Cria filme
                return await Movie.create({
                    title: movie.title,
                    gender: movie.gender || "",
                    director: movie.director,
                    year: parseInt(movie.year) || 0,
                    rating: parseFloat(movie.rating) || 0
                });
            })
        );
        
        const success = results.filter(r => r.status === "fulfilled");
        const failed = results.filter(r => r.status === "rejected");
        
        res.json({
            total: movies.length,
            success: success.length,
            failed: failed.length,
            created_ids: success.map(s => s.value.id)
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota de Recomendações 
router.post("/recommendations", async (req, res) => {
    try {
        const { movieIds } = req.body; // O frontend vai mandar [1, 5, 10, 22]

        if (!movieIds || !Array.isArray(movieIds) || movieIds.length === 0) {
            return res.status(400).json({ error: "Selecione filmes para gerar recomendações" });
        }

        // A. Precisamos de TODOS os filmes para montar o Grafo e criar as conexões
        const allMovies = await Movie.findAll();
        
        // Converter os dados do Sequelize para objetos simples JS
        const plainMovies = allMovies.map(m => m.toJSON());

        // B. Inicializar o MotherGraph com todos os filmes
        const graph = new MotherGraph(plainMovies);

        // C. Gerar as recomendações baseado nos IDs que o usuário escolheu
        // O método retorna apenas os IDs (ex: [45, 12, 99, 2])
        const recommendedIds = graph.getCombinedRecommendations(movieIds);

        if (recommendedIds.length === 0) {
            return res.json([]); 
        }

        // D. Buscar os detalhes completos desses filmes recomendados no banco
        const recommendedMovies = await Movie.findAll({
            where: {
                id: { [Op.in]: recommendedIds }
            }
        });
        
        // Fallback: Se o grafo achou menos de 4 filmes, completa com filmes aleatórios/populares
        /*
        if (recommendedIds.length < 4) {
            const missingCount = 4 - recommendedIds.length;
            const excludeIds = [...movieIds, ...recommendedIds];

            const fillerMovies = await Movie.findAll({
                where: {
                    id: { [Op.notIn]: excludeIds }
                },
                limit: missingCount,
                order: [['rating', 'DESC']] // Pega os melhores avaliados para completar
            });

            const fillerIds = fillerMovies.map(m => m.id);
            recommendedIds = [...recommendedIds, ...fillerIds];
        }
        */

        res.json(recommendedMovies);

    } catch (error) {
        console.error("Erro ao gerar recomendações:", error);
        res.status(500).json({ error: "Erro interno no servidor de recomendações" });
    }
});

// Rota de Explicação técnica das Recomendações usando IA (Gemini)
router.post("/recommendations/explain", async (req, res) => {
    try {
        // --- ADICIONE ESTA LINHA ---
        console.log("Minha Chave Gemini:", process.env.GEMINI_API_KEY);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const { userMovies, recommendedMovie } = req.body;

        if (!userMovies || !recommendedMovie) {
            return res.status(400).json({ error: "Dados incompletos." });
        }

        // 1. Instancia o Grafo novamente para rodar a auditoria
        const allMovies = await Movie.findAll();
        const plainMovies = allMovies.map(m => m.toJSON());
        const graph = new MotherGraph(plainMovies);

        // 2. Extrai os IDs
        // O frontend pode mandar objetos ou só IDs, vamos garantir que temos os IDs
        const sourceIds = userMovies.map(m => m.id);
        const targetId = recommendedMovie.id;

        // 3. Gera o relatório técnico matemático
        const technicalReport = graph.getDetailedExplanation(sourceIds, targetId);

        const prompt = `
            Você é um professor de Algoritmos explicando o resultado de uma recomendação baseada em Grafos.
            
            O Filme Recomendado é: "${recommendedMovie.title}".
            Score Total: ${technicalReport.totalScore.toFixed(3)}.

            Abaixo estão os dados brutos das arestas que conectaram a esse filme:
            ${technicalReport.matches.map(m => `- Conexão com "${m.connectedWith}" (Peso: ${m.scoreContributed}): ${m.details}`).join("\n")}

            SUA TAREFA:
            Escreva uma explicação direta que misture a "Vibe" (contexto humano) com a "Lógica" (dados técnicos).
            
            Regras de Escrita:
            1. PROIBIDO USAR SAUDAÇÕES (Não diga "Olá", "Oi", etc). Comece direto com o nome do filme ou a justificativa.
            2. Ao citar o Score Total (${technicalReport.totalScore.toFixed(3)}), contextualize a força dele. 
               - Considere que: > 0.5 é uma Conexão Forte; entre 0.2 e 0.5 é Moderada; < 0.2 é uma Conexão Sutil/Específica.
               - Exemplo: "...gerando um Score de 0.8, o que indica uma conexão fortíssima..."
            3. Para as 2 conexões mais fortes, faça a "Tradução Técnica":
               - Primeiro o motivo real (ex: "A conexão com 'Filme X' se deve ao tema...").
               - Depois, cite a prova matemática: "(validado pelo Índice Jaccard de 0.04 e peso 0.14)".
            4. Use negrito (**texto**) nos nomes dos algoritmos, filmes e valores.
            5. Máximo de 600 caracteres.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ text: text });

    } catch (error) {
        console.error("Erro ao gerar explicação:", error);
        res.status(500).json({ error: "Erro ao processar dados do grafo." });
    }
});

module.exports = router;