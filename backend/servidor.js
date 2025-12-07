// arquivo API: foco em receber requisições e devolver respostas ao json

const express = require('express'); // framework
const cors = require('cors'); // ver com o front
const { gerarRecomendacoes } = require('./recomenda');
const filmesDB = require('../dados'); // ver o arquivo dos dados com o Luiz

const app = express();
const PORT = 3000; // - http://localhost:3000

app.use(express.json());
app.use(cors());

// 1. ****implementar**** rota de teste pra listar todos os filmes

// 2. rota principal: recebe os 3 ids de filmes e devolve a recomendação
app.post('/recomendar', (req, res) => { // - http://localhost:3000/recomendar

    const { ids } = req.body;

    // validação: entrada
    if (!ids || !Array.isArray(ids)) return res.status(400).json({

        erro: "Formato inválido. Envie um JSON com um array 'ids'."

    });

    if (ids.length !== 3) return res.status(400).json({

        erro: "A precisão do algoritmo exige exatamente 3 filmes de entrada."

    });

    // validação: checar existência dos ids no banco de dados
    const ids_validos = filmesDB.map(f => f.id);
    const verificador = ids.every(id => ids_validos.includes(id));

    if (!verificador) return res.status(404).json({

        erro: "Um ou mais IDs enviados não existem no catálogo."

    });

    try { // chamada da função recomendacoes pra retornar o resultado

        console.log(`Processando recomendação para os filmes: ${ids}`);

        const resultado = recomendacoes(ids);

        res.json({

            filmes_base: ids,
            recomendacoes: resultado

        });

    } catch (erro) {

        console.error(erro);
        res.status(500).json({ erro: "Erro interno ao calcular recomendações." });

    }
    
});

app.listen(PORT, () => { console.log(`Servidor rodando em http://localhost:${PORT}`); });

