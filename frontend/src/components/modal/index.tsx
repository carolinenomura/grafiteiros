import { useState } from 'react';
import { searchMoviesApi } from '../../services/api';

type MovieResult = {
  id: number;
  title: string;
  year: string;
  director: string;
  // adicione outros campos se necessário
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: MovieResult) => void; // Callback para mandar o filme pra trás
};

export default function Modal({ isOpen, onClose, onSelectMovie }: ModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MovieResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const fetchMovies = async (searchTerm: string = "") => {
        setIsLoading(true);
        try {
            // Se searchTerm for vazio, o backend agora entende e devolve os recentes
            const data = await searchMoviesApi(searchTerm);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if(!query) return;
        setIsLoading(true);
        try {
            const data = await searchMoviesApi(query);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 z-[99] flex justify-center items-center bg-black/60 backdrop-blur-sm'>
            <div className='relative w-[500px] h-[650px] bg-[#1A1A1A] border border-[#515151] rounded-3xl overflow-hidden shadow-2xl flex flex-col'>
                
                {/* Botão Fechar */}
                <button onClick={onClose} className='absolute top-4 right-4 text-white hover:text-red-500 z-10'>
                    <span className="material-symbols-outlined text-3xl">close</span>
                </button>

                <div className='p-8 flex flex-col h-full'>
                    <h2 className='text-3xl font-bold text-primary mb-8 text-center'>Filmes</h2>
                    
                    {/* Input de Busca */}
                    <div className='flex gap-2 mb-8'>
                        <input 
                            className='flex-1 bg-[#2e2e2e] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary' 
                            type="search" 
                            placeholder="Digite o nome do filme..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button 
                            onClick={handleSearch}
                            className='bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/80 transition'
                        >
                            {isLoading ? '...' : 'Buscar'}
                        </button>
                    </div>

                    {/* Lista de Resultados */}
                    <div className='flex-1 overflow-y-auto space-y-3 custom-scrollbar'>
                        {results.length === 0 && !isLoading && (
                            <p className="text-center text-gray-500">Nenhum filme encontrado</p>
                        )}
                        
                        {results.map((movie) => (
                            <div key={movie.id} className='bg-[#2e2e2e] p-4 rounded-xl flex justify-between items-center hover:bg-[#3e3e3e] transition'>
                                <div>
                                    <h3 className='text-white font-bold'>{movie.title}</h3>
                                    <p className='text-gray-400 text-sm'>{movie.year} • {movie.director}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        onSelectMovie(movie);
                                        onClose();
                                        setResults([]); // Limpa para a próxima
                                        setQuery("");
                                    }}
                                    className='text-primary hover:text-white font-bold text-sm border border-primary hover:bg-primary px-3 py-1 rounded-lg transition'
                                >
                                    Selecionar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}