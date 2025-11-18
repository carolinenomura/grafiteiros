import React, { useState } from "react";
import Modal from "../components/modal";

// --- Componente Slot Vazio ---
const AddMovieSlot: React.FC = () => {
  return (
    <div className="group relative flex flex-col gap-3 pb-3 transition-transform duration-300 hover:-translate-y-1">
      <div className="relative w-full cursor-pointer overflow-hidden bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-xl border border-dashed border-transparent hover:border-primary transition-colors">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30">
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

  const slotsToFill = 4;
  const emptySlotsCount = slotsToFill - selectedMovies.length;

  const handleRemoveMovie = (movieId: number) => {
    setSelectedMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center">
      {/* Header */}
      <header className="w-full flex items-center justify-center border-b border-[#3F3F3F] px-6 py-4 max-w-[960px]">
        <div className="flex items-center gap-3">
          <div className="size-6 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-clapperboard-icon lucide-clapperboard"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>
          </div>
          <h2 className="text-lg font-bold tracking-[-0.015em]">Protótipo</h2>
        </div>
        
      </header>

      {/* Conteúdo */}
      <main className="flex-1 py-10 mt-10 w-full max-w-[960px] text-center">
        <h1 className="text-2xl sm:text-5xl font-black font-semibold tracking-[-0.033em]">
          Encontre seu próximo filme favorito
        </h1>
        <p className="mt-4 text-neutral-400 max-w-lg mx-auto">
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
            <AddMovieSlot key={`empty-${index}`} />
          ))}
        </div>

        <p className="text-neutral-400 text-sm mt-6">
          {selectedMovies.length} de {slotsToFill} filmes selecionados
        </p>

        <button
          className="mt-6 w-auto min-w-[180px] h-12 px-10 bg-primary text-white font-semibold rounded-xl disabled:bg-[#232448] disabled:text-[#5b5f7d] transition-colors"
          disabled={selectedMovies.length < slotsToFill}
        >
          Obter Recomendações
        </button>
      </main>
      {/* Footer */}
      <footer className="mt-auto w-full">
        <div className="container mx-auto px-4 py-6 mb-3 text-center text-sm text-neutral-400">
        <p>© 2025 Grafiteiros. Todos os direitos reservados.</p>
        </div>
        </footer>
    </div>
  );
};

export default SelectionPage;
