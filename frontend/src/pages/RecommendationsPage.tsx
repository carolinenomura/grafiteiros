import React, { useEffect, useState } from 'react';

import FavoriteIcon from '../assets/favorite.svg?react';
import FavoriteFilledIcon from '../assets/favorite_filled.svg?react';

// --- Imagens de fundo ---
const backdrops = [
  '/backdrop1.jpg',
  '/backdrop2.jpg',
  '/backdrop3.jpg',
  '/backdrop4.jpg',
  '/backdrop5.jpg',
  '/backdrop6.jpg'
];

// --- Interface (Contrato de Dados) ---
interface RecommendedMovie {
  id: number;
  title: string;
  director: string;
  year: number;
  genre: string;
  duration: number;
  imageUrl: string;
}

// --- Dados Simulados (Mock Data) ---
// Substitua este array pelos dados que virão da sua API.
const mockRecommendedMovies: RecommendedMovie[] = [
  {
    id: 1,
    title: "Frankenstein",
    director: "Guillermo del Toro",
    year: 2025,
    genre: "Terror/Sci-Fi",
    duration: 150,
    imageUrl: "https://a.ltrbxd.com/resized/film-poster/9/5/8/1/0/0/958100-frankenstein-2025-0-230-0-345-crop.jpg?v=49a1ca2305",
  },
  {
    id: 2,
    title: "Portrait of a Lady on Fire",
    director: "Céline Sciamma",
    year: 2019,
    genre: "Romance/Drama",
    duration: 121,
    imageUrl: "https://image.tmdb.org/t/p/w500/2LquGwEhbg3soxSCs9VNyh5VJd9.jpg",
  },
  {
    id: 3,
    title: "Before Sunrise",
    director: "Richard Linklater",
    year: 1995,
    genre: "Romance/Drama",
    duration: 101,
    imageUrl: "https://image.tmdb.org/t/p/original/xfsesL93davwAyHHWykRTW92Bqo.jpg",
  },
  {
    id: 4,
    title: "Apocalypse Now",
    director: "Francis Ford Coppola",
    year: 1979,
    genre: "Guerra/Ação",
    duration: 147,
    imageUrl: "https://image.tmdb.org/t/p/original/veXttPnNe8EZulvmeGTyDUrG9T4.jpg",
  }
];

// --- Componente do Card (Reutilizável) ---
interface MovieCardProps {
  movie: RecommendedMovie;
  isLiked: boolean;
  onLikeToggle: (id: number) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isLiked, onLikeToggle }) => {
  return (
    <div className="group flex transform flex-col rounded-lg bg-[#2e2e2e] border border-[#515151]/40 transition-all duration-300 hover:scale-105 hover:bg-[#4f4f4f]/90 p-3">
      <div
        className="relative w-full overflow-hidden rounded-lg bg-center bg-no-repeat aspect-[2/3] bg-cover"
        data-alt={`Movie poster for ${movie.title}`}
        style={{ backgroundImage: `url("${movie.imageUrl}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      <div className="flex flex-1 flex-col mt-3">
        <div className="flex-grow">
          <p className="font-semibold text-white truncate">{movie.title}</p>
          <p className="text-sm text-gray-300">{movie.year}  {movie.genre}</p>
          <p className="text-sm text-gray-300">{movie.duration} min</p>
        </div>
        
        {/* Botão com estado (Like/Liked) */}
        <button
          onClick={() => onLikeToggle(movie.id)}
          className={`group/button mt-4 flex size-10 items-center justify-center ml-auto rounded-[50px] transition-colors ${
            isLiked
              ? 'bg-[#8A92D3]/30' // Estado "Liked"
              : 'bg-white/20 hover:bg-white/40' // Estado Padrão
          }`}
        >
          {isLiked ? (
            <FavoriteFilledIcon 
              className="h-5 w-5 text-primary/60" 
            />
          ) : (
            <FavoriteIcon 
              className="h-5 w-5 text-neutral-400 group-hover/button:text-neutral-400" 
            />
          )}
        </button>
      </div>
    </div>
  );
};

const RecommendationsPage: React.FC = () => {
  // Escolhe um backdrop aleatório ao carregar a página
  const [selectedBackdrop] = useState(() => {
    const randomIndex = Math.floor(Math.random() * backdrops.length);
    return backdrops[randomIndex];
  });

  // Nome da página
  useEffect(() => {
    document.title = "Recomendações - CineMatch";
  }, []);

  // Estado para simular quais filmes o usuário curtiu
  // No futuro será enviado para o backend
  const [likedMovieIds, setLikedMovieIds] = useState<number[]>([]);

  // Lógica para adicionar/remover um ID da lista de curtidas
  const handleLikeToggle = (id: number) => {
    setLikedMovieIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((likedId) => likedId !== id) // Remove
        : [...prevIds, id] // Adiciona
    );
  };

  // Futuramente sera usado useEffect para buscar estes dados de uma API
  // const [movies, setMovies] = useState<RecommendedMovie[]>([]);
  // useEffect(() => {
  //   api.getRecommendations().then(data => setMovies(data));
  // }, []);
  // Por enquanto, usamos os dados simulados:
  const movies = mockRecommendedMovies;

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center">

      {/* Container de largura 1200px */}
      <div className="relative w-full max-w-[1300px] flex flex-col items-center">

        {/* Imagem de fundo e fade */}
        <div className="absolute inset-x-0 top-8 z-0 h-[650px] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url("${selectedBackdrop}")` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent from-70% to-[#1A1A1A]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent from-70% to-[#1A1A1A]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-[#1A1A1A]" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent from-70% to-[#1A1A1A]" />
        </div>

        {/* Header */}
        <header className="relative z-10 w-[960px] flex items-center justify-center border-none border-b border-[#3F3F3F] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="size-6 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clapperboard-icon lucide-clapperboard"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>
            </div>
            <h2 className="text-lg font-bold tracking-[-0.015em]">CineMatch</h2>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-grow z-10">
          <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-10 mt-10">
            <div className="text-center">
              <h1 className="text-2xl sm:text-5xl drop-shadow-sm font-semibold tracking-tight">
                Suas recomendações
              </h1>
              <p className="mt-4 text-lg text-white drop-shadow-md max-w-2xl mx-auto">
                Curta quais sugestões você gostou para aprimorarmos as próximas.
              </p>
            </div>

            {/* Grid de Filmes (Renderizado dinamicamente) */}
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isLiked={likedMovieIds.includes(movie.id)}
                  onLikeToggle={handleLikeToggle}
                />
              ))}
            </div>

            {/* Botão de Ação */}
            <div className="mt-12 flex justify-center">
              <button className="rounded-lg bg-primary px-8 py-3 text-base font-medium text-white shadow-sm  transition-all hover:bg-primary/90 hover:shadow-primary/10">
                Novas recomendações
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="z-10 mt-auto w-full">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-neutral-400">
          <p>© 2025 Grafiteiros. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RecommendationsPage;