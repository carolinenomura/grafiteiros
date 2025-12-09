import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { getRecommendationsApi } from '../services/api';

import FavoriteIcon from '../assets/favorite.svg?react';
import FavoriteFilledIcon from '../assets/favorite_filled.svg?react';

// --- Imagens de fundo ---
const backdrops = [
  { url: '/backdrop1.jpg', title: 'Duna: Parte Dois', year: '2024' },
  { url: '/backdrop2.jpg', title: 'Antes do Amanhecer', year: '1995' },
  { url: '/backdrop3.jpg', title: 'O Sétimo Selo', year: '1957' },
  { url: '/backdrop4.jpg', title: 'Guerra nas Estrelas: O Império Contra-Ataca', year: '1980' },
  { url: '/backdrop5.jpg', title: 'Aquarius', year: '2016' },
  { url: '/backdrop6.jpg', title: 'Se Meu Apartamento Falasse', year: '1960' },
  { url: '/backdrop7.jpg', title: 'Interestelar', year: '2014' }
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
  const navigate = useNavigate();
  const location = useLocation(); // <--- Agora funciona pois importamos
  const [movies, setMovies] = useState<RecommendedMovie[]>([]); 
  const [loading, setLoading] = useState(true);

  // Escolhe um backdrop aleatório ao carregar a página
  const [selectedBackdrop] = useState(() => {
    const randomIndex = Math.floor(Math.random() * backdrops.length);
    return backdrops[randomIndex];
  });

  // Nome da página
  useEffect(() => {
    document.title = "Recomendações - CineMatch";
  }, []);

  useEffect(() => {
    // Pega os IDs enviados pela página anterior
    const sourceIds = location.state?.sourceIds;

    if (sourceIds && sourceIds.length > 0) {
        getRecommendationsApi(sourceIds)
            .then((data) => {
                // Converte os dados do backend para o formato visual do card
                const formatted = data.map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    director: m.director,
                    year: m.year,
                    genre: m.gender, 
                    duration: 120, // Dado fictício
                    imageUrl: "https://via.placeholder.com/300x450" 
                }));
                setMovies(formatted); // <--- Atualiza o estado com DADOS REAIS
            })
            .catch(err => console.error("Erro ao buscar recomendações:", err))
            .finally(() => setLoading(false));
    } else {
        setLoading(false); 
    }
  }, [location.state]); // <--- Corrigido array de dependência

  // Estado para simular quais filmes o usuário curtiu
  const [likedMovieIds, setLikedMovieIds] = useState<number[]>([]);

  const handleLikeToggle = (id: number) => {
    setLikedMovieIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((likedId) => likedId !== id)
        : [...prevIds, id]
    );
  };

  if (loading) return <div className="text-white text-center mt-20 text-xl">Processando grafo de filmes...</div>;

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center">

      {/* Container de largura 1200px */}
      <div className="relative w-full max-w-[1300px] flex flex-col items-center">

        {/* Imagem de fundo e fade */}
        <div 
            className="absolute inset-x-0 top-8 z-0 h-[650px] bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: `url("${selectedBackdrop.url}")` }} // <--- MUDOU AQUI (.url)
          >
          <div className="absolute inset-0 bg-gradient-to-t from-transparent from-30% to-[#1A1A1A]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent from-70% to-[#1A1A1A]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-[#1A1A1A]" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent from-70% to-[#1A1A1A]" />
        
          <div className="absolute bottom-4 right-6 text-white/30 text-xs font-light tracking-wider select-none">
            {selectedBackdrop.title} ({selectedBackdrop.year})
          </div>
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
          <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-10 mt-2">
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
              {movies.length === 0 ? (
                 <p className="text-gray-400 col-span-4 text-center">Nenhuma recomendação encontrada baseada nos seus filmes.</p>
              ) : (
                movies.map((movie) => (
                    <MovieCard
                    key={movie.id}
                    movie={movie}
                    isLiked={likedMovieIds.includes(movie.id)}
                    onLikeToggle={handleLikeToggle}
                    />
                ))
              )}
            </div>

            {/* Botão de Ação */}
            <div className="mt-12 flex justify-center">
              <button className="rounded-lg bg-primary px-8 py-3 text-base font-medium text-white shadow-sm  transition-all hover:bg-primary/90 hover:shadow-primary/10">
                Novas recomendações
              </button>
              
            </div>
            {/* 2. NOVO BOTÃO (Estilo texto sublinhado) */}
            <div className="mt-5 flex justify-center">
              <button 
                onClick={() => navigate('/')} // 3. AÇÃO DE NAVEGAÇÃO
                className="text-neutral-400 text-base underline transition-colors hover:text-white"
              >
                Mudar meus filmes
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="z-10 mt-auto w-full">
          <div className="container mx-auto px-4 py-1 text-center text-sm text-neutral-400">
          <p>© 2025 Grafiteiros. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RecommendationsPage;