import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // CONFIRA A PORTA DO SEU BACKEND (geralmente 8080 ou 3000)
});

// Tipagem básica do filme
export interface MovieData {
  id: number;
  title: string;
  director: string;
  year: number;
  gender: string;
  rating: number;
  poster_path?: string;
}

// Função de busca
export const searchMoviesApi = async (query: string): Promise<MovieData[]> => {
  const response = await api.get(`/movies/search`, { params: { q: query } });
  return response.data;
};

// Função de recomendação
export const getRecommendationsApi = async (selectedIds: number[]): Promise<MovieData[]> => {
  const response = await api.post("/recommendations", { movieIds: selectedIds });
  return response.data;
};

// Função para chamar a IA
// userMovies pode ser apenas uma lista de strings com os títulos para economizar dados
export const explainRecommendationApi = async (userMovies: any[], recommendedMovie: any) => {
  const response = await api.post("/recommendations/explain", { 
    userMovies, 
    recommendedMovie 
  });
  return response.data.text;
};