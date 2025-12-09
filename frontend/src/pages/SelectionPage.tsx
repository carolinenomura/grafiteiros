import React, { useEffect, useState } from "react";
import Modal from "../components/modal";
import { useNavigate } from 'react-router-dom';
import type { MovieData } from "../services/api";

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

type AddMovieSlotProps = {
  onClick: () => void;
};

// --- Componente Slot Vazio ---
const AddMovieSlot: React.FC<AddMovieSlotProps> = ({ onClick }) => {
  return (
    <div onClick={onClick} className="group relative flex flex-col gap-3 pb-3 transition-transform duration-300 hover:-translate-y-1">
      <div className="relative w-full cursor-pointer overflow-hidden bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-xl border border-[#515151] hover:border-white/70 transition-colors">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#3b3b3b]/95 hover:bg-[#929292] transition-colors">
          <span className="material-symbols-outlined text-white/70 text-4xl">add_circle</span>
          <span className="text-white text-base font-medium">Adicionar Filme</span>
        </div>
      </div>
    </div>
  );
};

// --- Componente Slot Preenchido ---
interface SelectedMovieSlotProps {
  title: string;
  year: string;
  imageUrl: string;
  onRemove: () => void;
}

const SelectedMovieSlot: React.FC<SelectedMovieSlotProps> = ({ title, year, imageUrl, onRemove }) => {
  return (
    <div className="group relative flex flex-col gap-3 pb-3 transition-transform duration-300 hover:-translate-y-1">
      <div
        className="relative w-full cursor-pointer overflow-hidden bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-xl"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex flex-col justify-end">
          <p className="text-white text-base font-bold leading-tight">{title}</p>
          <p className="text-white/80 text-sm font-normal leading-normal">{year}</p>
        </div>
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 z-10 size-7 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  );
};

// --- Interface para o Filme Selecionado ---
interface SelectedMovie {
  id: number;
  title: string;
  year: string;
  imageUrl: string;
}

// --- Componente da Página Principal ---
const SelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Escolhe um backdrop aleatório ao carregar a página
  const [selectedBackdrop] = useState(() => {
    const randomIndex = Math.floor(Math.random() * backdrops.length);
    return backdrops[randomIndex];
  });

  // Nome da página
  useEffect(() => {
    document.title = "Início - CineMatch";
  }, []);

  /*
  const [selectedMovies, setSelectedMovies] = useState<SelectedMovie[]>([
    {
      id: 1,
      title: "Parasite",
      year: "2019",
      imageUrl:
        "https://image.tmdb.org/t/p/original/dwkDeJXXaHVuIhcyCxUdb3YctxY.jpg",
    },
    {
      id: 2,
      title: "Amadeus",
      year: "1984",
      imageUrl:
        "https://image.tmdb.org/t/p/original/1n5VUlCqgmVax1adxGZm8oCFaKc.jpg",
    },
  ]);
  */

  // ESTADO INICIAL VAZIO (Removemos Parasite e Amadeus hardcoded)
  const [selectedMovies, setSelectedMovies] = useState<SelectedMovie[]>([]);

  const slotsToFill = 4;
  const emptySlotsCount = slotsToFill - selectedMovies.length;

  const handleRemoveMovie = (movieId: number) => {
    setSelectedMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));
  };

  // --- NOVA FUNÇÃO: Recebe o filme vindo do Modal e adiciona na lista ---
  const handleSelectMovieFromModal = (movie: MovieData) => {
    // 1. Evita duplicatas
    if (selectedMovies.some((m) => m.id === movie.id)) {
      alert("Você já selecionou este filme!");
      return;
    }

    const tmdbBaseUrl = "https://image.tmdb.org/t/p/w500";

    // 2. Formata o objeto para o visual do card
    const newMovie: SelectedMovie = {
      id: movie.id,
      title: movie.title,
      year: movie.year.toString(),
      // Como o backend ainda não retorna URL de imagem, usamos um placeholder
      imageUrl: movie.poster_path 
        ? `${tmdbBaseUrl}${movie.poster_path}` 
        : "https://via.placeholder.com/300x450?text=Sem+Imagem"  
    };

    setSelectedMovies((prev) => [...prev, newMovie]);
  };

  // --- NOVA FUNÇÃO: Navega enviando os IDs ---
  const handleGetRecommendations = () => {
    const ids = selectedMovies.map(m => m.id);
    
    // Passamos os IDs através do "state" do React Router
    navigate('/recomendacoes', { state: { sourceIds: ids } });
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center">
      <div className="relative w-full max-w-[1300px] flex flex-col items-center">
        {/* Imagem de fundo */}
        <div 
            className="absolute inset-x-0 top-8 z-0 h-[650px] bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: `url("${selectedBackdrop.url}")` }} // <--- MUDOU AQUI (.url)
          >
          <div className="absolute inset-0 bg-gradient-to-t from-transparent from-50% to-[#1A1A1A]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent from-70% to-[#1A1A1A]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-[#1A1A1A]" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent from-70% to-[#1A1A1A]" />
        
          <div className="absolute bottom-4 right-6 text-white/30 text-xs font-light tracking-wider select-none">
            {selectedBackdrop.title} ({selectedBackdrop.year})
          </div>
        </div>

        {/* Header */}
        <header className="relative z-10 w-[960px] flex items-center justify-center border-none border-b border-[#3F3F3F] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="size-6 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clapperboard-icon lucide-clapperboard"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" /><path d="m6.2 5.3 3.1 3.9" /><path d="m12.4 3.4 3.1 4" /><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>
            </div>
            <h2 className="text-lg font-bold tracking-[-0.015em]">CineMatch</h2>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 z-10  py-10  w-full max-w-[900px] text-center">
          <h1 className="text-2xl sm:text-5xl drop-shadow-sm font-semibold tracking-tight">
            Encontre seu próximo filme favorito
          </h1>
          <p className="mt-4 text-lg text-white drop-shadow-md max-w-xl mx-auto">
            Comece escolhendo quatro filmes que você ama e geraremos recomendações incríveis para você.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-4 mt-8">
            {selectedMovies.map((movie) => (
              <SelectedMovieSlot
                key={movie.id}
                title={movie.title}
                year={movie.year}
                imageUrl={movie.imageUrl}
                onRemove={() => handleRemoveMovie(movie.id)}
              />
            ))}
            {Array.from({ length: emptySlotsCount }).map((_, index) => (
              <AddMovieSlot key={`empty-${index}`} onClick={() => setIsModalOpen(true)} />
            ))}
          </div>
          <p className="text-neutral-400 text-sm mt-6">
            {selectedMovies.length} de {slotsToFill} filmes selecionados
          </p>
          
          <button
            className="mt-6 rounded-lg bg-primary px-8 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-primary/10 disabled:bg-[#232448] disabled:text-[#5b5f7d] transition-colors"
            disabled={selectedMovies.length < slotsToFill}
            onClick={handleGetRecommendations} // <-- Atualizado para chamar a nova função
          >
            Obter Recomendações
          </button>
        </main>

        {/* Footer */}
        <footer className="mt-10 w-full">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-neutral-400">
            <p>© 2025 Grafiteiros. Todos os direitos reservados.</p>
          </div>
        </footer>
        
        {/* MODAL Conectado */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectMovie={handleSelectMovieFromModal} // <-- Passamos a função aqui
        />
      </div>
    </div>
  );
};

export default SelectionPage;