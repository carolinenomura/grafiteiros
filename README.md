# 🎬 CineMatch - Sistema de Recomendação com Grafos e IA

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow) ![Stack](https://img.shields.io/badge/Stack-Fullstack-blue) ![License](https://img.shields.io/badge/License-Academic-green)

O **CineMatch** é uma aplicação web que utiliza **Teoria dos Grafos** e **Inteligência Artificial** para recomendar filmes. Diferente de filtros comuns, ele constrói um grafo de similaridade ponderado entre os filmes, analisando conexões semânticas (tags), elenco, diretor e gênero para sugerir obras que realmente tenham a mesma "vibe".

Além disso, o projeto integra a **Google Gemini AI** para explicar, em linguagem natural, a lógica matemática por trás de cada recomendação.

---

## 🧠 O Algoritmo (MotherGraph)

Este projeto foi desenvolvido para a disciplina de **Algoritmos e Grafos**. A lógica de recomendação não é uma caixa preta; ela segue um cálculo de peso de arestas transparente.

Os filmes são **Nós** e a similaridade entre eles são **Arestas** com pesos variáveis:

| Critério | Peso | Método de Cálculo |
| :--- | :---: | :--- |
| **Tags/Keywords** | `0.4` | **Índice de Jaccard** (Interseção sobre União das palavras-chave) |
| **Diretor** | `0.3` | Match exato (Mesmo nó de diretor) |
| **Elenco** | `0.2` | **Índice de Jaccard** (Atores em comum nos top 5 créditos) |
| **Gênero** | `0.2` | **Índice de Jaccard** sobre a lista de gêneros |
| **Ajuste Fino** | `0.05` | Proximidade de Ano (±5 anos) e Nota (±1.0) |

> ⚙️ A recomendação final é dada pela soma dos pesos das arestas incidentes entre os filmes escolhidos pelo usuário e os candidatos no grafo.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* **React + Vite:** Para uma interface rápida e reativa.
* **TypeScript:** Para tipagem segura e código limpo.
* **Tailwind CSS:** Para estilização moderna e responsiva.
* **Axios:** Para comunicação com a API.
* **React Markdown:** Para renderização das explicações da IA.

### Backend
* **Node.js + Express:** Servidor RESTful.
* **Sequelize (ORM):** Gerenciamento do banco de dados SQL.
* **Google Gemini AI (API):** Geração de explicações "humanizadas" sobre os cálculos do grafo.
* **TMDB API:** Fonte de dados reais (sinopses, posters, elenco, tags).

### Banco de Dados
* **MySQL:** Armazenamento relacional dos filmes e metadados.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
* Node.js instalado.
* MySQL instalado e rodando.
* Chaves de API do [TMDB](https://www.themoviedb.org/) e [Google Gemini](https://aistudio.google.com/).

### 1. Configuração do Banco de Dados
Crie um schema (banco de dados) vazio no seu MySQL (ex: `cinematch` ou o nome que estiver na sua config).

### 2. Configuração do Backend

#### 1. Entre na pasta do backend:
```bash
cd backend_2
```

#### 2. Instale as dependências:
```bash
npm install
```

#### 3. Crie um arquivo .env na raiz do backend com as seguintes variáveis:

```
# Configuração do Banco
DB_NAME=seu_nome_do_banco
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_HOST=localhost
NODE_ENV=development

# APIs Externas
TMDB_API_KEY=sua_chave_do_tmdb
GEMINI_API_KEY=sua_chave_do_gemini
```

#### 4. Popule o banco de dados com filmes reais (Script de Automação):
```bash
node populate_tmdb.js
```

#### 5.Inicie o servidor:
```bash
node index.js
```
O servidor rodará na porta definida (ex: 8080).

### 3. Configuração do Frontend

#### 1. Em outro terminal, entre na pasta do frontend:
```bash
cd frontend
```

#### 2. Instale as dependências:
```bash
npm install
```

#### 3. Inicie o projeto:
```bash
npm run dev
```

#### 4. Acesse http://localhost:5173 no seu navegador.

## 📸 Funcionalidades

- Busca: Pesquisa de filmes por título 

- Seleção Múltipla: O usuário escolhe 4 filmes de referência para calibrar o grafo.

- Recomendação Inteligente: O sistema retorna 4 filmes baseados na soma dos pesos do grafo de similaridade.

- Explicação com IA: Um modal detalha por que o filme foi recomendado, citando as métricas matemáticas (Jaccard, Pesos) usadas na execução do algoritmo.

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos na disciplina de Algoritmos e Grafos.
