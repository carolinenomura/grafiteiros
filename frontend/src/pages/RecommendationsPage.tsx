import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { getRecommendationsApi, explainRecommendationApi } from '../services/api';
import ReactMarkdown from 'react-markdown';

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

// --- Componente do Modal de Explicação ---
interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  movieImage: string;
}

// --- Componente do Card (Reutilizável) ---
interface MovieCardProps {
  movie: RecommendedMovie;
  onExplain: (movie: RecommendedMovie) => void; 
  explanationText: string | null;                // O texto da IA (se houver)
  isLoading: boolean;                            
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, onClose, title, content, movieImage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#1A1A1A] border border-[#515151] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#232448]">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8A92D3]">psychology</span>
            Análise do Algoritmo
          </h3>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col md:flex-row p-6 gap-6">
            {/* Poster Pequeno (Opcional, mas fica bonito) */}
            <div 
              className="hidden md:block w-32 h-48 rounded-lg bg-cover bg-center shrink-0 shadow-lg border border-white/10"
              style={{ backgroundImage: `url("${movieImage}")` }}
            />
            
            <div className="flex-1">
                <h4 className="text-lg font-semibold text-[#8A92D3] mb-2">{title}</h4>
                <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown components={{
                        // Customização opcional para garantir que o negrito fique na cor certa
                        strong: ({node, ...props}) => <span className="font-bold text-[#8A92D3]" {...props} />
                    }}>
                        {content}
                    </ReactMarkdown>
                </div>
                
                {/* Nota de rodapé técnica */}
                <div className="mt-6 pt-4 border-t border-white/5 flex gap-2 items-center text-xs text-white/30">
                   <span className="material-symbols-outlined text-sm">info</span>
                   Explicado por IA baseada nos pesos do Grafo de Similaridade.
                </div>
            </div>
        </div>
        
        {/* Footer com Botão Fechar */}
        <div className="p-4 bg-[#141414] flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-[#8A92D3] hover:bg-[#7a82c3] text-white font-bold rounded-lg transition-colors"
            >
                Entendi
            </button>
        </div>
      </div>
    </div>
  );
};

const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  onExplain, 
  isLoading 
}) => {
  return (
    <div className="group flex transform flex-col rounded-lg bg-[#2e2e2e] border border-[#515151]/40 transition-all duration-300 hover:scale-105 hover:bg-[#4f4f4f]/90 p-3">
      <div
        className="relative w-full overflow-hidden rounded-lg bg-center bg-no-repeat aspect-[2/3] bg-cover"
        style={{ backgroundImage: `url("${movie.imageUrl}")` }}
      >
         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="flex flex-1 flex-col mt-3">
        <div className="flex-grow">
          <p className="font-semibold text-white truncate">{movie.title}</p>
          <p className="text-sm text-gray-300">{movie.year} • {movie.genre}</p>
          <p className="text-sm text-gray-300">{movie.duration} min</p>
        </div>
        
        {/* --- BOTÃO IA (Limpo, sem bordas em cima) --- */}
        <div className="mt-4">
            <button 
                onClick={() => onExplain(movie)}
                disabled={isLoading}
                className="flex items-center gap-2 text-xs font-bold text-[#8A92D3] hover:text-white transition-colors w-full bg-[#8A92D3]/10 hover:bg-[#8A92D3]/20 py-2 px-3 rounded-md justify-center"
            >
                <span className="material-symbols-outlined text-sm">
                   {isLoading ? 'hourglass_empty' : 'auto_awesome'}
                </span>
                {isLoading ? "Analisando..." : "Por que este filme?"}
            </button>
        </div>
      </div>
    </div>
  );
};

const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // <--- Agora funciona pois importamos
  const [movies, setMovies] = useState<RecommendedMovie[]>([]); 
  const [loading, setLoading] = useState(true);

  // Estado para guardar qual card está mostrando a explicação
 
  const [explanationData, setExplanationData] = useState<{ movie: RecommendedMovie; text: string } | null>(null);
  
  const [loadingId, setLoadingId] = useState<number | null>(null); // Para saber qual card está girando

  // Escolhe um backdrop aleatório ao carregar a página
  const [selectedBackdrop] = useState(() => {
    const randomIndex = Math.floor(Math.random() * backdrops.length);
    return backdrops[randomIndex];
  });

  const handleAskAI = async (movie: RecommendedMovie) => {
    // Se clicou no mesmo que já está aberto, fecha
    if (explanationData?.movie.id === movie.id) {
        setExplanationData(null);
        return;
    }

    // Inicia carregamento deste ID específico
    setLoadingId(movie.id); 

    try {
        // Nota: Se sourceIds no location for apenas números, o backend precisa saber lidar
        // ou você precisa passar os títulos. Assumindo que seu backend trata IDs:
        const sourceIds = location.state?.sourceIds || [];
        // Formata para enviar como objetos com ID
        const userMoviesPayload = sourceIds.map((id: number) => ({ id }));

        const explanation = await explainRecommendationApi(userMoviesPayload, movie);
        setExplanationData({ movie: movie, text: explanation });
    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com a IA.");
    } finally {
        setLoadingId(null); // Para o carregamento
    }
  };

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
                const tmdbBaseUrl = "https://image.tmdb.org/t/p/w500"; 

                // Converte os dados do backend para o formato visual do card
                const formatted = data.map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    director: m.director,
                    year: m.year,
                    genre: m.gender, 
                    duration: 120, // Dado fictício
                    imageUrl: m.poster_path 
                        ? `${tmdbBaseUrl}${m.poster_path}` 
                        : "https://via.placeholder.com/300x450?text=Sem+Imagem"
                }));
                setMovies(formatted); 
            })
            .catch(err => console.error("Erro ao buscar recomendações:", err))
            .finally(() => setLoading(false));
    } else {
        setLoading(false); 
    }
  }, [location.state]);

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
          <div className="container mx-auto max-w-4xl px-4 py-8 sm:pt-6 sm:pb-12">
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

                    // --- NOVAS PROPS SENDO PASSADAS ---
                    onExplain={handleAskAI}
                    // Só manda o texto se o ID bater com o card atual
                    explanationText={explanationData?.id === movie.id ? explanationData.text : null}
                    // Só diz que está carregando se o ID bater
                    isLoading={loadingId === movie.id}
                />
            ))}
            </div>

            {/* Botão de Ínicio */}
            <div className="mt-12 flex justify-center">
              <button onClick={() => navigate('/')} className="rounded-lg bg-primary px-8 py-3 text-base font-medium text-white shadow-sm  transition-all hover:bg-primary/90 hover:shadow-primary/10">
                Escolher outros filmes
              </button>
              
            </div>
            
          </div>
        </main>

        {/* Footer */}
        <footer className="z-10 mt-6 w-full">
          <div className="container mx-auto px-4 py-1 text-center text-sm text-neutral-400">
          <p>© 2025 Grafiteiros. Todos os direitos reservados.</p>
          </div>
        </footer>

        {/* -Modal de Explicação */}
        <ExplanationModal 
          isOpen={!!explanationData} // Abre se tiver dados
          onClose={() => setExplanationData(null)} // Fecha limpando os dados
          title={explanationData?.movie.title || ""}
          content={explanationData?.text || ""}
          movieImage={explanationData?.movie.imageUrl || ""}
        />
      </div>
    </div>
  );
};

export default RecommendationsPage;