const axios = require('axios');
const Movie = require('./movies/Movie'); // Ajuste o caminho se necessário
const connection = require('./database/database'); // Ajuste o caminho
require('dotenv').config();

const API_KEY = process.env.TMDB_API_KEY;
const LANGUAGE = 'pt-BR'; // Dados em português

const TOTAL_PAGES = 5;

async function fetchAndSaveMovies() {
    try {
        console.log("Autenticando no banco...");
        await connection.authenticate();
        
        // --- LOOP NOVO: VAI DA PÁGINA 1 ATÉ O TOTAL QUE VOCÊ QUER ---
        for (let page = 1; page <= TOTAL_PAGES; page++) {
            
            console.log(`\n--- Baixando PÁGINA ${page} de ${TOTAL_PAGES} ---`);
            
            // Note que mudamos o final da URL para usar a variável ${page}
            const response = await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=${LANGUAGE}&page=${page}`);
            const moviesList = response.data.results;

            // Loop pelos filmes dessa página (igual estava antes)
            for (const movieData of moviesList) {
                const movieId = movieData.id;

                try {
                    // OTIMIZAÇÃO: Verifica se já existe ANTES de fazer as chamadas extras (economiza tempo/API)
                    const existingMovie = await Movie.findOne({ where: { title: movieData.title } });
                    
                    // Se já existe, pula para o próximo (comente essas 4 linhas se quiser forçar atualização de todos)
                    if (existingMovie) {
                        console.log(`[PULADO] ${movieData.title} (Já existe)`);
                        continue; 
                    }

                    // Se não existe, busca os detalhes (Cast, Tags, etc)
                    const [detailsRes, creditsRes, keywordsRes] = await Promise.all([
                        axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=${LANGUAGE}`),
                        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}&language=${LANGUAGE}`),
                        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/keywords?api_key=${API_KEY}`)
                    ]);

                    const details = detailsRes.data;
                    const credits = creditsRes.data;
                    const keywords = keywordsRes.data;

                    // Formatação
                    const genresString = details.genres.map(g => g.name).join(', ');
                    const directorData = credits.crew.find(c => c.job === 'Director');
                    const directorName = directorData ? directorData.name : 'Desconhecido';
                    const castString = credits.cast.slice(0, 5).map(c => c.name).join(', ');
                    const tagsString = keywords.keywords.map(k => k.name).join(', ');
                    const yearInt = parseInt(details.release_date.substring(0, 4));

                    // Salva no Banco
                    await Movie.create({
                        title: details.title,
                        gender: genresString,
                        director: directorName,
                        year: isNaN(yearInt) ? 0 : yearInt,
                        rating: details.vote_average,
                        cast: castString,
                        tags: tagsString,
                        poster_path: details.poster_path
                    });
                    console.log(`[CRIADO] ${details.title}`);

                } catch (innerError) {
                    console.error(`Erro ao processar filme ${movieData.title}:`, innerError.message);
                }
            }
        }

        console.log("\n--- FINALIZADO COM SUCESSO ---");

    } catch (error) {
        console.error("Erro fatal:", error.message);
    }
}

fetchAndSaveMovies();