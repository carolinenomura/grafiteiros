// Lógica Pura (Grafos + Dijkstra)

const filmesDB = require('../dados'); // ver com o Luiz o arquivo

/**
 * calcula a proporção de itens em comum (indice de Jaccard simplificado).
 * usado para gênero e elenco.
 * retorna entre 0.0 e 1.0
 */
function proporcao(listaA, listaB) {

    if (!listaA || !listaB || listaA.length === 0 || listaB.length === 0) return 0;

    const setA = new Set(listaA);
    const setB = new Set(listaB);

    // semelhança de itens nas listas
    let intersecao = 0;
    for (let item of setA) if (setB.has(item)) intersecao++;

    // união (total de itens únicos considerando os dois arrays)
    const t_uniao = (setA.size + setB.size) - intersecao;

    return intersecao / t_uniao;
}

/**
 * normaliza a diferença numérica para uma escala 0-1.
 * 1 significa "igual" (diferença zero).
 * 0 significa "muito diferente" (diferença >= maxDiff).
 */
function similaridade(valorA, valorB, diferenca_max) {

    const diferenca = Math.abs(valorA - valorB);
    if (diferenca >= diferenca_max) return 0;
    return 1 - (diferenca / diferenca_max);

}

function peso(filmeA, filmeB) {

    // 1. gênero (Peso 0.4) - proporção em comum
    const genero = proporcao(filmeA.generos, filmeB.generos);

    // 2. diretor (Peso 0.2) - 1 se igual, senão 0
    const diretor = (filmeA.diretor === filmeB.diretor) ? 1 : 0;

    // 3. elenco (Peso 0.2) - Proporção em comum
    const elenco = proporcao(filmeA.elenco, filmeB.elenco);

    // 4. ano (Peso 0.1) - Normalizado (se a diferença for maior que 30 anos, a similaridade é 0)
    const ano = similaridade(filmeA.ano, filmeB.ano, 30);

    // 5. nota (Peso 0.1) - Normalizado (vai de 0 a 10, então a direfenca_max é 10)
    const nota = similaridade(filmeA.nota, filmeB.nota, 10);

    // --- FÓRMULA FINAL (Passo 1 da Imagem) ---
    const similaridadeTotal =
        (0.4 * genero) +
        (0.2 * diretor) +
        (0.2 * elenco) +
        (0.1 * ano) +
        (0.1 * nota);

    // --- TRANSFORMAÇÃO EM PESO (Passo 2 da Imagem) ---
    // Dijkstra precisa de peso MENOR para caminhos MELHORES.
    // inverter a similaridade:
    // similaridade 1.0 (Idêntico) -> Peso 0.0
    // similaridade 0.0 (Nada a ver) -> Peso 1.0
    const peso = 1 - similaridade_total;

    return parseFloat(peso.toFixed(4)); // arredonda para evitar dízimas
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

            if (!scores_finais[filme_id]) scores_finais[filme_id] = 0;
            scores_finais[filme_id] += dist;

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
        .slice(0, 4);

}

module.exports = { recomendacoes };