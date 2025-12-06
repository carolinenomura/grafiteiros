// Lógica Pura (Grafos + Dijkstra)

const filmesDB = require('../dados'); // ver com o Luiz o arquivo

const PESOS = {       // calibragem

    DIRETOR_IGUAL: 0,      // distância zero (muito perto)
    DIRETOR_DIFERENTE: 10, // distância alta
    GENERO_IGUAL: 0,
    GENERO_DIFERENTE: 5,
    ANO_FATOR: 0.1         // multiplicador para diferença de anos

};

function calcular_peso(filmeA, filmeB) {

    let peso = 0;

    peso += (filmeA.diretor === filmeB.diretor) ? PESOS.MESMO_DIRETOR : PESOS.DIFERENTE_DIRETOR; // diretor

    peso += (filmeA.genero === filmeB.genero) ? PESOS.MESMO_GENERO : PESOS.DIFERENTE_GENERO;     // genero

    peso += Math.abs(filmeA.ano - filmeB.ano) * PESOS.FATOR_ANO; // ano (diferença temporal aumenta a distância)

    return peso;

}

function add_grafo(filmes) { // construção do grafo

    const grafo = {};

    filmes.forEach(f1 => {

        grafo[f1.id] = {};

        filmes.forEach(f2 => {

            if (f1.id !== f2.id) grafo[f1.id][f2.id] = calcularPeso(f1, f2);

        });

    });

    return grafo;
}

function dijkstra(grafo, origem_id) {

    let distancias = {};
    let visitados = new Set();
    let nos = Object.keys(grafo);

    // inicialização
    nos.forEach(no => distancias[no] = Infinity);
    distancias[origem_id] = 0;

    while (visitados.size < nos.length) {

        let u = null;
        let menor_distancia = Infinity;

        // escolhe o nó não visitado com menor distância
        nos.forEach(no => {

            if (!visitados.has(no) && distancias[no] < menor_distancia) {

                menor_distancia = distancias[no];
                u = no;

            }

        });

        if (u === null) break;

        visitados.add(u);

        // relaxamento dos vizinhos
        for (let v in grafo[u]) {

            let peso = grafo[u][v];

            if (distancias[u] + peso < distancias[v]) distancias[v] = distancias[u] + peso;

        }

    }

    return distancias;
}

function recomendacoes(entrada_ids) {

    const grafo = add_grafo(filmesDB);
    let scores_finais = {};

    entrada_ids.forEach(input_id => { // roda o Dijkstra para CADA filme de entrada

        const distancias = dijkstra(grafo, String(input_id));

        for (let [filme_id, dist] of Object.entries(distancias)) { // soma as distâncias (score acumulado)

            if (!scoresFinais[idFilme]) scoresFinais[idFilme] = 0;
            scoresFinais[idFilme] += dist;

        }

    });

    // filtra e ordena
    return filmesDB

        .filter(f => !entrada_ids.includes(f.id)) // remove os filmes que o usuário já escolheu
        .map(f => ({

            ...f,
            score_relevancia: scoresFinais[f.id].toFixed(2) // menor score = mais relevante

        }))
        .sort((a, b) => a.score_relevancia - b.score_relevancia)
        .slice(0, 4); // Top 4
}

module.exports = { recomendacoes };