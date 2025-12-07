const express = require("express");
const router = express.Router();
const Movie = require("./Movie");

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

module.exports = router;