import { useState } from 'react';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const movies = [
    "Wall-E",
    "Kung Fu Panda",
    "Gato de Botas"
];


export default function Modal({ isOpen, onClose }: ModalProps) {
    if (!isOpen) return null;

    const [query, setQuery] = useState("");
    const [result, setResult] = useState<string[]>(movies);
    const [search, setSearch] = useState(false);
    /*const [screen, setScreen] = useState<"search" | "success" | "error">("search");
    const [movie, setMovie] = useState();*/

    const toggleSearch = () => {
        setSearch(!search);
    }

    const handleSearch = (text: string) => {
        setQuery(text);

        if (text.trim() === "") {
            setResult([]);
            return;
        }

        const filtered = movies.filter((item) =>
            item.toLowerCase().includes(text.toLowerCase())
        );

        setResult(filtered);
    }

    /*
    const handleSubmit = () => {
        if (!query.trim()) {
            setScreen("error");
            return;
        }

        const exists = movies.some(m => m.toLowerCase() === query.toLowerCase());

        if (exists) {
            setScreen("success");
        } else {
            setScreen("error");
        }
    }*/

    return (
        <div className='fixed top-1/2 left-1/2 w-[450px] h-[650px] rounded-3xl -translate-x-1/2 -translate-y-1/2 z-[99]
        shadow-xl bg-transparent border-white backdrop-blur-md overflow-hidden text-center'>

            {/*Botão de Fechar o Modal*/}
            <button onClick={onClose} className='bg-[#2e27ff]
                rounded-tr-3xl rounded-bl-3xl bg-[#232448] w-[50px] h-[50px] 
                top-0 right-0 absolute z-[99]
                
                before:content-[""] before:absolute before:top-1/2 before:left-1/2
                before:-translate-x-1/2 before:-translate-y-1/2 before:w-[15px]
                before:h-[4px] before:bg-white before:rotate-45 before:rounded

                after:content-[""] after:absolute after:top-1/2 after:left-1/2 
                after:-translate-x-1/2 after:-translate-y-1/2 after:w-[15px] 
                after:h-[4px] after:bg-white after:-rotate-45 after:rounded'>
            </button>

            {/*Box de adicionar filme*/}
            <div className='w-[100%] h-[650px] absolute top-[0]'>

                {/*Parte resposável pela busca */}
                <div className='w-[100%] h-[650px]'>
                    <form action='#' className='h-[650px]'>
                        <div className='h-full flex flex-col items-center gap-6 justify-between pt-[40px] pl-[40px] pr-[40px] pb-[60px]'>
                            <h2 className='text-4xl mb-[30px] font-bold text-[#2e27ff] uppercase'>
                                Filmes
                            </h2>
                            <div className='w-[100%] h-[3.75rem] relative'>
                                <input
                                    className={`text-black ${search ? "w-[100%] rounded-[999px]" : "w-[3.75rem] rounded-[100%]"} h-full shadow-xl transition-all duration-500 pl-[30px]`}
                                    type="search"
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    name="lupa"
                                    id="lupa"
                                    placeholder={`${search ? 'digite para pesquisar' : ""}`}
                                    autoComplete='off'
                                    required />

                                <span onClick={toggleSearch} className={`absolute w-[3rem] h-[3rem] rounded-[100%] top-[50%] 
                                        ${search ? "left-[calc(100%-2rem)] opacity-[0]" : "left-[50%] opacity-[100]"} 
                                        -translate-x-1/2 -translate-y-1/2 cursor-pointer bg-[#2e27ff] transition-all duration-500
                                        
                                        after:content-[""] after:absolute after:top-[48%] after:left-[50%]
                                        after:-translate-x-1/2 after:-translate-y-1/2
                                        after:w-[15px] after:h-[15px]
                                        after:rounded-[100%] after:border-2 after:border-[#ffffff]
                                        
                                        before:content-[""] before:absolute 
                                        before:top-[60%] before:left-[60%]
                                        before:w-[6px] before:h-[2px] before:rounded-3xl
                                        before:bg-[#ffffff] before:rotate-[40deg]`}>
                                </span>
                                <span onClick={toggleSearch} className={`absolute bg-[#2e27ff] top-[50%] ${search ? "left-[calc(100%-2rem)] opacity-[100]" : "left-[50%] opacity-[0]"} 
                                    w-[3rem] h-[3rem] rounded-[100%] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 cursor-pointer 
                                    
                                    before:content-[""] before:absolute before:top-1/2 before:left-1/2
                                    before:-translate-x-1/2 before:-translate-y-1/2 before:w-[15px]
                                    before:h-[4px] before:bg-white before:rotate-45 before:rounded
                                    
                                    after:content-[""] after:absolute after:top-1/2 after:left-1/2 
                                    after:-translate-x-1/2 after:-translate-y-1/2 after:w-[15px] 
                                    after:h-[4px] after:bg-white after:-rotate-45 after:rounded`}>
                                </span>
                            </div>
                            <div className={`${search ? "opacity-[100]" : "opacity-[0]"} border-t-gray-950 pl-[10px] pt-[15px] pr-[10px] pb-[15px] bg-[#333] transition-all duration-500`}>
                                <ul className='w-[370px] h-[192px]'>
                                    {result.slice(0, 3).map(movie => (
                                        <li
                                            key={movie}
                                            onClick={() => {
                                                setQuery(movie);
                                                setResult([movie]);
                                            }}
                                            className='w-[370px] list-none rounded-[3px] pl-[10px] pt-[15px] pr-[10px] pb-[15px] cursor-pointer'>
                                            {movie}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <input
                                /*onClick={handleSubmit}*/
                                className='w-[300px] h-[50px] bg-[#2e27ff] text-white shadow-xl rounded-3xl cursor-pointer mt-[40px]'
                                type="button"
                                value="Buscar"
                            />
                        </div>
                    </form>
                </div>

                {/*Parte no caso de sucesso na busca*/}
                <div className={`${search? "opacity-[100]" : "opacity-[0]"} h-[650px] top-[650px] absolute transition-all duration-500`} >
                    <div className=''></div>
                    <h2>Titulo</h2>
                    <p>descrição do filme</p>
                    <p>diretor</p>
                    <p>ano</p>
                    <p>genero</p>
                    <p>duração</p>
                    <div className=''>
                        <input type="button" value="Adicionar" />
                    </div>
                </div>
            </div>
        </div>
    );
}